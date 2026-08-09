import React from "react";
import { ChevronDown, Link2, Link2Off } from "lucide-react";
import { useScrub } from "../inspector/useScrub";
import { COLOR_TOKENS } from "../lib/tokens";
import { Popover } from "./primitives";

// ── value helpers (reused logic; only markup is new) ─────────────────────────
type Unit = "px" | "%" | "rem" | "em" | "vh" | "vw" | "fr" | "auto";
export function parseVal(v: string): { num: string; unit: Unit } {
  if (v == null || v === "") return { num: "", unit: "px" };
  if (v === "auto" || v === "none") return { num: "", unit: "auto" };
  const m = String(v).match(/^(-?[\d.]+)\s*(px|%|rem|em|vh|vw|fr)?$/);
  if (m) return { num: m[1], unit: (m[2] as Unit) || "px" };
  return { num: String(v), unit: "px" };
}
export const lenNum = (v: string) => (/^-?\d*\.?\d+px$/.test(String(v)) ? String(v).replace(/px$/, "") : (parseVal(String(v)).num || ""));
export const toLen = (v: string) => {
  const s = String(v).trim();
  if (s === "") return "0px";
  if (/^-?\d*\.?\d+$/.test(s)) return `${s}px`;
  return s;
};
const asHex = (v: string, fb: string) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : fb);
const hexToRgb = (h: string) => {
  const m = h.replace("#", "");
  return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) };
};

const box = "flex items-center h-7 rounded-md border border-[#E3E6EB] bg-[#F6F7F9] focus-within:border-[#2563EB] focus-within:bg-white transition-colors";
const bareInput = "min-w-0 flex-1 h-full bg-transparent px-2 text-[12px] text-[#111827] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const checker = {
  backgroundImage: "linear-gradient(45deg,#d0d0d0 25%,transparent 25%,transparent 75%,#d0d0d0 75%),linear-gradient(45deg,#d0d0d0 25%,#fff 25%,#fff 75%,#d0d0d0 75%)",
  backgroundSize: "8px 8px", backgroundPosition: "0 0,4px 4px",
} as const;

// ── NumberField (+ optional unit), drag-to-scrub ─────────────────────────────
export function NumberField({
  value, onChange, units, min, max, step = 1, placeholder = "0", className = "w-full",
}: {
  value: string; onChange: (v: string) => void; units?: Unit[]; min?: number; max?: number; step?: number; placeholder?: string; className?: string;
}) {
  const { num, unit } = units ? parseVal(value) : { num: value ?? "", unit: "px" as Unit };
  const isAuto = units ? unit === "auto" : false;
  const typingUnit: Unit = units ? (unit === "auto" ? (units.find((u) => u !== "auto") ?? "px") : unit) : "px";
  const format = (n: string | number) => (units ? `${n === "" ? "0" : n}${typingUnit}` : String(n));

  const scrub = useScrub({ value: parseFloat(String(num)) || 0, onChange: (v) => onChange(format(v)), min, max, step });

  return (
    <div className={`${box} ${className}`}>
      <input
        type="number" value={isAuto ? "" : num} placeholder={isAuto ? "auto" : placeholder}
        onChange={(e) => onChange(format(e.target.value))}
        onPointerDown={scrub.onPointerDown} onPointerMove={scrub.onPointerMove} onPointerUp={scrub.onPointerUp} onPointerCancel={scrub.onPointerCancel}
        style={scrub.style} title="Drag to adjust · Shift ×10 · Alt ×0.1" className={bareInput}
      />
      {units && (
        <div className="relative h-full flex items-center border-l border-[#E3E6EB]">
          <select value={unit} onChange={(e) => (e.target.value === "auto" ? onChange("auto") : onChange(`${num || "0"}${e.target.value}`))}
            className="h-full bg-transparent text-[10px] text-[#9CA3AF] pl-1.5 pr-4 cursor-pointer focus:outline-none appearance-none">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-1 text-[#C0C4CC] pointer-events-none" />
        </div>
      )}
    </div>
  );
}

// ── SelectField ──────────────────────────────────────────────────────────────
export function SelectField({ value, onChange, options, className = "w-full" }: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; className?: string;
}) {
  return (
    <div className={`${box} ${className} relative`}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${bareInput} pr-6 cursor-pointer appearance-none`}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-1.5 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}

// ── TextField / TextArea ─────────────────────────────────────────────────────
export function TextField({ value, onChange, placeholder, mono, className = "w-full" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; className?: string;
}) {
  return (
    <div className={`${box} ${className}`}>
      <input type="text" value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className={`${bareInput} ${mono ? "font-mono text-[11px]" : ""}`} />
    </div>
  );
}
export function TextArea({ value, onChange, rows = 3, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea rows={rows} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[#E3E6EB] bg-[#F6F7F9] focus:border-[#2563EB] focus:bg-white transition-colors px-2 py-1.5 text-[12px] text-[#111827] focus:outline-none resize-y" />
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-8 h-[18px] rounded-full transition-colors relative ${checked ? "bg-[#2563EB]" : "bg-[#D5D9E0]"}`}>
      <span className={`absolute top-0.5 w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${checked ? "left-[15px]" : "left-0.5"}`} />
    </button>
  );
}

// ── Slider ───────────────────────────────────────────────────────────────────
export function Slider({ value, onChange, min = 0, max = 1, step = 0.05 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2563EB]" />;
}

// ── ColorField (swatch + hex + alpha + theme tokens) ─────────────────────────
export function ColorField({ value, onChange, allowClear }: { value: string; onChange: (v: string) => void; allowClear?: boolean }) {
  const v = value ?? "";
  const isTransparent = !v || v === "transparent";
  const isVar = v.startsWith("var(");
  const rgba = v.match(/^rgba?\(([^)]+)\)/);
  let alpha = 1;
  let baseHex = asHex(v, "#000000");
  if (rgba) {
    const parts = rgba[1].split(",").map((s) => s.trim());
    alpha = parts[3] != null ? parseFloat(parts[3]) : 1;
    const [r, g, b] = parts.map((n) => parseInt(n, 10));
    baseHex = "#" + [r, g, b].map((n) => (n || 0).toString(16).padStart(2, "0")).join("");
  }
  const setHex = (hex: string) => {
    if (alpha < 1) { const { r, g, b } = hexToRgb(hex); onChange(`rgba(${r}, ${g}, ${b}, ${alpha})`); }
    else onChange(hex);
  };
  const setAlpha = (a: number) => {
    if (isVar) return; // can't alpha a token
    if (a >= 1) return onChange(baseHex);
    const { r, g, b } = hexToRgb(baseHex);
    onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
  };

  const swatchStyle = isTransparent ? checker : { background: v };

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Popover
        align="right"
        width={216}
        trigger={<span className="block w-6 h-6 rounded-md border border-[#E3E6EB] shrink-0" style={swatchStyle} />}
      >
        {() => (
          <div>
            <input type="color" value={baseHex} onChange={(e) => setHex(e.target.value)} className="w-full h-9 p-0 border border-[#E3E6EB] rounded-md cursor-pointer mb-2.5" />
            {!isVar && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-[#9CA3AF] w-8">Alpha</span>
                <Slider value={alpha} onChange={setAlpha} min={0} max={1} step={0.01} />
                <span className="text-[10px] text-[#6B7280] w-7 text-right">{Math.round(alpha * 100)}%</span>
              </div>
            )}
            <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5">Theme</div>
            <div className="grid grid-cols-6 gap-1.5">
              {COLOR_TOKENS.map((tk) => (
                <button key={tk.name} title={tk.name} onClick={() => onChange(tk.value)}
                  className={`w-full aspect-square rounded-md border ${value === tk.value ? "ring-2 ring-[#2563EB] border-transparent" : "border-[#E3E6EB]"}`}
                  style={tk.value === "transparent" ? checker : { background: tk.preview }} />
              ))}
            </div>
          </div>
        )}
      </Popover>
      <div className={`${box} flex-1`}>
        <input type="text" value={v} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className={`${bareInput} font-mono text-[11px]`} />
      </div>
      {allowClear && <button onClick={() => onChange("transparent")} title="Clear" className="text-[#9CA3AF] hover:text-[#111827] text-[13px] px-0.5">✕</button>}
    </div>
  );
}

// ── SpacingBox (Webflow-style per-side margin/padding, scrub + link) ─────────
function SideInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  const scrub = useScrub({ value: parseFloat(value) || 0, onChange: (n) => onChange(`${n}px`), min: 0 });
  return (
    <input
      type="text" inputMode="numeric" value={lenNum(value)} onChange={(e) => onChange(toLen(e.target.value))}
      onPointerDown={scrub.onPointerDown} onPointerMove={scrub.onPointerMove} onPointerUp={scrub.onPointerUp} onPointerCancel={scrub.onPointerCancel}
      style={scrub.style} title="Drag to adjust · Shift ×10"
      className={`absolute w-8 text-center bg-transparent text-[10px] text-[#374151] focus:outline-none focus:bg-white rounded ${className}`}
    />
  );
}

export function SpacingBox({ get, set }: { get: (p: string) => string; set: (p: string, v: string) => void }) {
  const [linkM, setLinkM] = React.useState(false);
  const [linkP, setLinkP] = React.useState(false);
  const setM = (side: string, v: string) => (linkM ? ["Top", "Right", "Bottom", "Left"].forEach((s) => set(`margin${s}`, v)) : set(`margin${side}`, v));
  const setP = (side: string, v: string) => (linkP ? ["Top", "Right", "Bottom", "Left"].forEach((s) => set(`padding${s}`, v)) : set(`padding${side}`, v));

  return (
    <div className="relative w-full h-[132px] bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg select-none">
      <span className="absolute top-1.5 left-2.5 text-[8px] font-semibold text-[#9CA3AF] tracking-[0.12em]">MARGIN</span>
      <button onClick={() => setLinkM((l) => !l)} title="Link margins" className={`absolute top-1 right-2 ${linkM ? "text-[#2563EB]" : "text-[#C0C4CC] hover:text-[#6B7280]"}`}>
        {linkM ? <Link2 size={11} /> : <Link2Off size={11} />}
      </button>
      <SideInput value={get("marginTop")} onChange={(v) => setM("Top", v)} className="top-4 left-1/2 -translate-x-1/2 hover:bg-white" />
      <SideInput value={get("marginBottom")} onChange={(v) => setM("Bottom", v)} className="bottom-1.5 left-1/2 -translate-x-1/2 hover:bg-white" />
      <SideInput value={get("marginLeft")} onChange={(v) => setM("Left", v)} className="top-1/2 left-1.5 -translate-y-1/2 hover:bg-white" />
      <SideInput value={get("marginRight")} onChange={(v) => setM("Right", v)} className="top-1/2 right-1.5 -translate-y-1/2 hover:bg-white" />

      <div className="absolute inset-7 bg-white border border-dashed border-[#D5D9E0] rounded-md">
        <span className="absolute top-1 left-2 text-[8px] font-semibold text-[#9CA3AF] tracking-[0.12em]">PADDING</span>
        <button onClick={() => setLinkP((l) => !l)} title="Link padding" className={`absolute top-0.5 right-1.5 ${linkP ? "text-[#2563EB]" : "text-[#C0C4CC] hover:text-[#6B7280]"}`}>
          {linkP ? <Link2 size={10} /> : <Link2Off size={10} />}
        </button>
        <SideInput value={get("paddingTop")} onChange={(v) => setP("Top", v)} className="top-3.5 left-1/2 -translate-x-1/2 hover:bg-[#F6F7F9]" />
        <SideInput value={get("paddingBottom")} onChange={(v) => setP("Bottom", v)} className="bottom-1 left-1/2 -translate-x-1/2 hover:bg-[#F6F7F9]" />
        <SideInput value={get("paddingLeft")} onChange={(v) => setP("Left", v)} className="top-1/2 left-1 -translate-y-1/2 hover:bg-[#F6F7F9]" />
        <SideInput value={get("paddingRight")} onChange={(v) => setP("Right", v)} className="top-1/2 right-1 -translate-y-1/2 hover:bg-[#F6F7F9]" />
        <div className="absolute inset-6 bg-[#EFF4FF] border border-[#DBE7FF] rounded" />
      </div>
    </div>
  );
}
