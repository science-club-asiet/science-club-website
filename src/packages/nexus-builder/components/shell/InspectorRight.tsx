import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { MousePointerSquareDashed, Trash2, Copy, Eye, EyeOff, RotateCcw } from "lucide-react";
import { StyleControls } from "../../inspector/StyleControls";
import { AnimationControls } from "../../inspector/AnimationControls";
import { useDuplicate } from "../../lib/useDuplicate";
import { mergeStyle, useBreakpoint, BREAKPOINTS } from "../../lib/responsive";
import type { AnimationConfig } from "../../lib/animation";
import { getEntry } from "../../registry";
import { isBindable } from "../../lib/binding";
import * as t from "../../ui/tokens";

export const InspectorRight = () => {
  const { active, actions } = useEditor((state, query) => {
    const id = Array.from(state.events.selected)[0];
    let selected;
    if (id && state.nodes[id]) {
      const node = state.nodes[id];
      selected = {
        id,
        type: node.data.name as string,
        name: node.data.custom?.displayName || node.data.displayName,
        props: node.data.props,
        settings: node.related && node.related.settings,
        isDeletable: query.node(id).isDeletable(),
      };
    }
    return { active: selected };
  });

  const duplicate = useDuplicate();
  const bp = useBreakpoint();
  const bpInfo = BREAKPOINTS.find((b) => b.id === bp)!;
  const [tab, setTab] = useState<"style" | "settings">("style");

  if (!active) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center text-center px-6">
        <MousePointerSquareDashed size={26} className="text-[#C0C4CC] mb-3" />
        <p className="text-[13px] font-medium text-[#374151]">Nothing selected</p>
        <p className="text-[11px] text-[#9CA3AF] mt-1">Click an element on the canvas to style it.</p>
      </div>
    );
  }

  const setStyle = (property: string, value: any) => {
    actions.setProp(active.id, (props: any) => {
      if (bp === "desktop") props.style = { ...(props.style || {}), [property]: value };
      else { props.responsive = props.responsive || {}; props.responsive[bp] = { ...(props.responsive[bp] || {}), [property]: value }; }
    });
  };
  const getStyle = (property: string, def = "") => {
    const merged = mergeStyle(active?.props?.style, active?.props?.responsive, bp);
    return merged[property] ?? def;
  };
  const resetBreakpoint = () => bp !== "desktop" && actions.setProp(active.id, (p: any) => { if (p.responsive) p.responsive[bp] = {}; });

  const hidden = !!(active.props?.hideOn as any)?.[bp];
  const toggleHidden = () => actions.setProp(active.id, (p: any) => { p.hideOn = { ...(p.hideOn || {}), [bp]: !hidden }; });

  const anim = active?.props?.animation as AnimationConfig | undefined;
  const setAnim = (patch: Partial<AnimationConfig>) => actions.setProp(active.id, (p: any) => { p.animation = { type: "none", ...(p.animation || {}), ...patch }; });

  const tabCls = (on: boolean) =>
    `flex-1 h-8 text-[12px] font-medium rounded-md transition-colors ${on ? "bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)]" : "text-[#6B7280] hover:text-[#111827]"}`;

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* HEADER */}
      <div className="px-3 pt-3 pb-2 border-b border-[#ECEEF2]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-[#EFF4FF] text-[#2563EB] text-[11px] font-semibold">
            {active.name}
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={toggleHidden} title={hidden ? "Show on this breakpoint" : "Hide on this breakpoint"} className={t.iconBtn}>
              {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {active.id !== ROOT_NODE && <button onClick={() => duplicate(active.id)} title="Duplicate" className={t.iconBtn}><Copy size={14} /></button>}
            {active.isDeletable && <button onClick={() => actions.delete(active.id)} title="Delete" className={`${t.iconBtn} hover:!text-red-500`}><Trash2 size={14} /></button>}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#F1F3F6]">
          <button onClick={() => setTab("style")} className={tabCls(tab === "style")}>Style</button>
          <button onClick={() => setTab("settings")} className={tabCls(tab === "settings")}>Settings</button>
        </div>
      </div>

      {/* BODY */}
      <motion.div key={tab} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.14, ease: "easeOut" }} className="flex-1 overflow-y-auto">
        {tab === "style" && bp !== "desktop" && (
          <div className="mx-3 mt-3 flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-700">
            <span>Editing <b>{bpInfo.label}</b> (≤{bpInfo.maxWidth}px)</span>
            <button onClick={resetBreakpoint} title={`Clear ${bpInfo.label} overrides`} className="shrink-0 hover:text-amber-900"><RotateCcw size={12} /></button>
          </div>
        )}

        {tab === "style" && (
          <>
            <StyleControls getStyle={getStyle} setStyle={setStyle} groups={getEntry(active.type)?.styleGroups} />
            <AnimationControls anim={anim} setAnim={setAnim} />
          </>
        )}

        {tab === "settings" && (
          <div className="p-3 space-y-3">
            {isBindable(active.type) && (
              <div className="pb-3 border-b border-[#ECEEF2]">
                <span className={`block ${t.label} mb-1`}>CMS binding</span>
                <input
                  type="text"
                  value={(active.props?.bindField as string) ?? ""}
                  onChange={(e) => actions.setProp(active.id, (p: any) => (p.bindField = e.target.value))}
                  placeholder="field key (inside a Collection List)"
                  className={t.field}
                />
                <p className="text-[10px] text-[#9CA3AF] mt-1">Pulls content from the bound collection field.</p>
              </div>
            )}
            {active.settings ? (
              React.createElement(active.settings)
            ) : (
              !isBindable(active.type) && (
                <div className="py-10 text-center text-[#9CA3AF]">
                  <p className="text-[12px]">No settings for this element.</p>
                  <p className="text-[11px] mt-1">Use the Style tab to design it.</p>
                </div>
              )
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
