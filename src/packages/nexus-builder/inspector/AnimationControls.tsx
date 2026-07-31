import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { AnimationConfig } from "../lib/animation";

const sel = "bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[11px] text-gray-700 focus:outline-none w-28 cursor-pointer";
const num = "bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[11px] text-gray-700 focus:outline-none w-20 text-right";
const lbl = "text-gray-500 text-[11px]";

const TYPES: { label: string; value: AnimationConfig["type"] }[] = [
  { label: "None", value: "none" },
  { label: "Fade in", value: "fade" },
  { label: "Slide up", value: "up" },
  { label: "Slide down", value: "down" },
  { label: "Slide left", value: "left" },
  { label: "Slide right", value: "right" },
  { label: "Zoom in", value: "zoom" },
];

export const AnimationControls = ({
  anim,
  setAnim,
}: {
  anim: AnimationConfig | undefined;
  setAnim: (patch: Partial<AnimationConfig>) => void;
}) => {
  const [open, setOpen] = useState(false);
  const type = anim?.type ?? "none";
  const active = type !== "none";

  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className={active ? "text-blue-600" : "text-gray-400"} />
          Animation
          {active && <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">On</span>}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className={lbl}>Effect</span>
            <select value={type} onChange={(e) => setAnim({ type: e.target.value as AnimationConfig["type"] })} className={sel}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {active && (
            <>
              <div className="flex items-center justify-between">
                <span className={lbl}>Trigger</span>
                <select value={anim?.trigger ?? "scroll"} onChange={(e) => setAnim({ trigger: e.target.value as AnimationConfig["trigger"] })} className={sel}>
                  <option value="scroll">On scroll into view</option>
                  <option value="load">On page load</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className={lbl}>Duration (ms)</span>
                <input type="number" min={0} step={50} value={anim?.duration ?? 600} onChange={(e) => setAnim({ duration: Number(e.target.value) })} className={num} />
              </div>
              <div className="flex items-center justify-between">
                <span className={lbl}>Delay (ms)</span>
                <input type="number" min={0} step={50} value={anim?.delay ?? 0} onChange={(e) => setAnim({ delay: Number(e.target.value) })} className={num} />
              </div>
              <p className="text-[10px] text-gray-400 leading-snug">Preview on the live page (Open) — the canvas shows the final state.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
