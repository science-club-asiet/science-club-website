import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useNode, useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { ArrowUp, Move, Trash2, Copy } from "lucide-react";
import { useDuplicate } from "../../lib/useDuplicate";

const ACTIVE = "#2563eb";
const HOVER = "#93c5fd";

type Box = { top: number; left: number; width: number; height: number };

/**
 * On-canvas editor chrome (Webflow-style). Hovering shows a thin outline + a
 * passive name label; selecting shows a 2px outline + an actionable toolbar
 * (drag handle, select-parent, duplicate, delete). Keeping the buttons on the
 * *selected* state (not hover) means they never vanish as you move the mouse
 * toward them. Drawn as a fixed portal overlay that tracks the element via rAF.
 */
export const RenderNode = ({ render }: { render: React.ReactElement }) => {
  const { id } = useNode();
  const { actions, query, isActive, enabled } = useEditor((state, q) => ({
    isActive: q.getEvent("selected").contains(id),
    enabled: state.options.enabled,
  }));

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent,
  } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom?.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
  }));

  const duplicate = useDuplicate();
  const [box, setBox] = useState<Box | null>(null);
  const lastBox = useRef<Box | null>(null);

  const showChrome = enabled && (isActive || isHover);

  // Track the element via a single rAF loop while its chrome is shown — the
  // standard editor-overlay pattern (measures each frame, commits only on
  // change). Smooth through scroll, drag and layout shifts; only the 1–2 shown
  // nodes ever run it, so it's cheap. (Scroll-event tracking janks — avoid it.)
  useEffect(() => {
    if (!showChrome || !dom) return;
    let raf = 0;
    const tick = () => {
      const r = dom.getBoundingClientRect();
      const next = { top: r.top, left: r.left, width: r.width, height: r.height };
      const prev = lastBox.current;
      if (!prev || prev.top !== next.top || prev.left !== next.left || prev.width !== next.width || prev.height !== next.height) {
        lastBox.current = next;
        setBox(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastBox.current = null;
    };
  }, [showChrome, dom]);

  if (!showChrome || !box || typeof document === "undefined") {
    return <>{render}</>;
  }

  // Keep the label/toolbar clear of the fixed 56px top bar.
  const labelTop = box.top > 84 ? box.top - 26 : box.top + 4;

  return (
    <>
      {ReactDOM.createPortal(
        <>
          {/* Outline overlay — non-interactive so it never blocks the canvas */}
          <div
            className="fixed z-[9998] pointer-events-none rounded-[2px]"
            style={{
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              border: `${isActive ? 2 : 1}px solid ${isActive ? ACTIVE : HOVER}`,
            }}
          />

          {isActive ? (
            /* Selected → actionable toolbar (persists; always clickable) */
            <div
              className="fixed z-[9999] flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white shadow-lg select-none"
              style={{ top: labelTop, left: box.left }}
            >
              <span className="mr-1 max-w-[140px] truncate">{name}</span>
              {moveable && (
                <span ref={(r) => { if (r) drag(r); }} className="cursor-move opacity-80 hover:opacity-100" title="Drag">
                  <Move size={13} />
                </span>
              )}
              {id !== ROOT_NODE && parent && (
                <button className="opacity-80 hover:opacity-100" title="Select parent" onClick={() => actions.selectNode(parent)}>
                  <ArrowUp size={13} />
                </button>
              )}
              {id !== ROOT_NODE && (
                <button className="opacity-80 hover:opacity-100" title="Duplicate" onMouseDown={(e) => { e.stopPropagation(); duplicate(id); }}>
                  <Copy size={13} />
                </button>
              )}
              {deletable && (
                <button className="opacity-80 hover:opacity-100" title="Delete" onMouseDown={(e) => { e.stopPropagation(); actions.delete(id); }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ) : (
            /* Hover → passive name label only (non-interactive, no flicker) */
            <div
              className="fixed z-[9999] pointer-events-none rounded bg-blue-400 px-1.5 py-0.5 text-[10px] font-medium text-white select-none max-w-[160px] truncate"
              style={{ top: labelTop, left: box.left }}
            >
              {name}
            </div>
          )}
        </>,
        document.body
      )}
      {render}
    </>
  );
};
