import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { Layers, Trash2, Copy, RotateCcw } from "lucide-react";
import { StyleControls } from "../../inspector/StyleControls";
import { AnimationControls } from "../../inspector/AnimationControls";
import { useDuplicate } from "../../lib/useDuplicate";
import { mergeStyle, useBreakpoint, BREAKPOINTS, type ResponsiveStyles } from "../../lib/responsive";
import type { AnimationConfig } from "../../lib/animation";
import { getEntry } from "../../registry";
import { isBindable } from "../../lib/binding";

export const InspectorRight = () => {
  const { active, actions } = useEditor((state, query) => {
    const currentlySelectedNodeId = Array.from(state.events.selected)[0];
    let selected;

    if (currentlySelectedNodeId && state.nodes[currentlySelectedNodeId]) {
      const node = state.nodes[currentlySelectedNodeId];
      selected = {
        id: currentlySelectedNodeId,
        type: node.data.name as string, // resolver key → registry entry
        name: node.data.custom?.displayName || node.data.displayName,
        props: node.data.props,
        settings: node.related && node.related.settings,
        isDeletable: query.node(currentlySelectedNodeId).isDeletable(),
      };
    }

    return { active: selected };
  });

  const duplicate = useDuplicate();
  const bp = useBreakpoint();
  const bpInfo = BREAKPOINTS.find((b) => b.id === bp)!;
  const [activeTab, setActiveTab] = useState<"style" | "settings">("style");

  if (!active) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center text-gray-400">
        <Layers size={32} className="mb-4 opacity-50" />
        <p className="text-sm">Select an element to edit</p>
      </div>
    );
  }

  const setStyle = (property: string, value: unknown) => {
    actions.setProp(active.id, (props: Record<string, unknown>) => {
      if (bp === "desktop") {
        props.style = { ...((props.style as Record<string, unknown>) || {}), [property]: value };
      } else {
        const resp = ((props.responsive as Record<string, unknown>) || {}) as Record<string, Record<string, unknown>>;
        props.responsive = resp;
        resp[bp] = { ...(resp[bp] || {}), [property]: value };
      }
    });
  };
  // Show the *effective* value at the active breakpoint (base + cascaded overrides).
  const getStyle = (property: string, defaultValue = ""): string => {
    const merged = mergeStyle(active?.props?.style as React.CSSProperties | undefined, active?.props?.responsive as ResponsiveStyles | undefined, bp);
    const val = (merged as Record<string, unknown>)[property];
    return val !== undefined && val !== null ? String(val) : defaultValue;
  };

  const resetBreakpoint = () => {
    if (bp === "desktop") return;
    actions.setProp(active.id, (props: Record<string, unknown>) => {
      if (props.responsive) {
        (props.responsive as Record<string, unknown>)[bp] = {};
      }
    });
  };

  const anim = active?.props?.animation as AnimationConfig | undefined;
  const setAnim = (patch: Partial<AnimationConfig>) =>
    actions.setProp(active.id, (props: Record<string, unknown>) => {
      props.animation = { type: "none", ...((props.animation as Record<string, unknown>) || {}), ...patch };
    });

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden text-xs text-gray-700">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
            <Layers size={12} />
            <span>{active.name}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            {active.id !== ROOT_NODE && (
              <button onClick={() => duplicate(active.id)} className="hover:text-gray-900 transition-colors p-1" title="Duplicate">
                <Copy size={14} />
              </button>
            )}
            {active.isDeletable && (
              <button onClick={() => actions.delete(active.id)} className="hover:text-red-500 transition-colors p-1" title="Delete">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center border-b border-gray-100 px-4 bg-white sticky top-[57px] z-10">
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-3 text-center border-b-2 font-medium transition-colors ${activeTab === "style" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-center border-b-2 font-medium transition-colors ${activeTab === "settings" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
        >
          Settings
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === "style" && bp !== "desktop" && (
          <div className="mx-3 mt-3 mb-1 flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            <span>
              Editing <b>{bpInfo.label}</b> (≤{bpInfo.maxWidth}px). Overrides Desktop for this size &amp; smaller.
            </span>
            <button onClick={resetBreakpoint} title={`Clear ${bpInfo.label} overrides`} className="shrink-0 hover:text-amber-900">
              <RotateCcw size={13} />
            </button>
          </div>
        )}
        {activeTab === "style" && (
          <>
            <StyleControls getStyle={getStyle} setStyle={setStyle} groups={getEntry(active.type)?.styleGroups} />
            <AnimationControls anim={anim} setAnim={setAnim} />
          </>
        )}

        {activeTab === "settings" && isBindable(active.type) && (
          <div className="p-4 border-b border-gray-100">
            <label className="block text-[10px] text-gray-400 uppercase font-semibold mb-1 tracking-wider">
              CMS binding
            </label>
            <input
              type="text"
              value={(active.props?.bindField as string) ?? ""}
              onChange={(e) => actions.setProp(active.id, (p: Record<string, unknown>) => (p.bindField = e.target.value))}
              placeholder="field key (inside a Collection List)"
              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">Pulls this element&apos;s content from the collection field. Leave blank for static content.</p>
          </div>
        )}
        {activeTab === "settings" && active.settings && (
          <div className="p-4">{React.createElement(active.settings)}</div>
        )}
        {activeTab === "settings" && !active.settings && !isBindable(active.type) && (
          <div className="p-8 text-center text-gray-400">
            <p>No custom settings for this element.</p>
            <p className="mt-1 text-[11px]">Use the Style tab to design it.</p>
          </div>
        )}
      </div>
    </div>
  );
};
