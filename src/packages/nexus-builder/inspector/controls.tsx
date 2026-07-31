import React from "react";
import { COLOR_TOKENS } from "../lib/tokens";

const asHex = (value: string, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback);

const checker = {
  backgroundImage: "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,#fff 25%,#fff 75%,#ccc 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0,4px 4px",
} as const;

type Unit = "px" | "%" | "rem" | "em" | "vh" | "vw" | "fr" | "auto";

function parseVal(v: string): { num: string; unit: Unit } {
  if (v == null || v === "") return { num: "", unit: "px" };
  if (v === "auto" || v === "none") return { num: "", unit: "auto" };
  const m = String(v).match(/^(-?[\d.]+)\s*(px|%|rem|em|vh|vw|fr)?$/);
  if (m) return { num: m[1], unit: (m[2] as Unit) || "px" };
  return { num: String(v), unit: "px" };
}

/** Number field + unit selector. Handles the `auto` keyword cleanly. */
export function UnitInput({
  value,
  onChange,
  units = ["px", "%", "rem", "vh", "auto"],
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  units?: Unit[];
  className?: string;
}) {
  const { num, unit } = parseVal(value);
  const isAuto = unit === "auto";
  // Fall back to the first real unit when currently on `auto` so typing a number
  // immediately produces a valid length instead of doing nothing.
  const typingUnit: Unit = unit === "auto" ? (units.find((u) => u !== "auto") ?? "px") : unit;

  const commit = (n: string, u: Unit) => {
    if (u === "auto") return onChange("auto");
    onChange(`${n === "" ? "0" : n}${u}`);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="number"
        value={isAuto ? "" : num}
        placeholder={isAuto ? "auto" : "0"}
        onChange={(e) => commit(e.target.value, typingUnit)}
        className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-[11px] text-right text-gray-700 focus:outline-none focus:border-blue-500"
      />
      <select
        value={unit}
        onChange={(e) => commit(num, e.target.value as Unit)}
        className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-[10px] text-gray-500 focus:outline-none cursor-pointer"
      >
        {units.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
    </div>
  );
}

/** Color control: swatch preview + hex text + quick palette popover. */
export function ColorInput({
  value,
  onChange,
  allowClear = false,
}: {
  value: string;
  onChange: (v: string) => void;
  allowClear?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const isTransparent = !value || value === "transparent";

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-6 h-6 rounded border border-gray-300 shrink-0"
          style={isTransparent ? checker : { background: value }}
          title="Pick colour"
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-20 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-[11px] font-mono text-gray-700 focus:outline-none focus:border-blue-500"
        />
        {allowClear && (
          <button onClick={() => onChange("transparent")} className="text-[10px] text-gray-400 hover:text-gray-700" title="Clear">
            ✕
          </button>
        )}
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 p-2.5 bg-white border border-gray-200 rounded-lg shadow-lg w-44">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Theme tokens</div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {COLOR_TOKENS.map((t) => (
                <button
                  key={t.name}
                  onClick={() => { onChange(t.value); setOpen(false); }}
                  className={`w-full aspect-square rounded border ${value === t.value ? "ring-2 ring-blue-500 border-transparent" : "border-gray-200"}`}
                  style={t.value === "transparent" ? checker : { background: t.preview }}
                  title={t.name}
                />
              ))}
            </div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Custom</div>
            <input
              type="color"
              value={asHex(value, "#000000")}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 p-0 border border-gray-200 rounded cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  );
}
