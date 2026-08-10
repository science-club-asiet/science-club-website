import React, { useState } from "react";
import { ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Italic, Underline } from "lucide-react";
import { UnitInput, ColorInput, type Unit } from "./controls";
import { ALL_STYLE_GROUPS, type StyleGroup } from "../registry/types";

type Props = {
  getStyle: (property: string, defaultValue?: string) => string;
  setStyle: (property: string, value: unknown) => void;
  groups?: StyleGroup[];
};

const asHex = (value: string, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback);

// Length helpers for the box model: show just the number (px assumed), and
// auto-append "px" to bare numbers so "20" becomes valid CSS (20px), not the
// invalid "20" the browser silently drops.
const lenDisplay = (v: string) => (/^-?\d*\.?\d+px$/.test(String(v)) ? String(v).replace(/px$/, "") : String(v ?? ""));
const toLen = (v: string) => {
  const s = String(v).trim();
  if (s === "") return "0px";
  if (/^-?\d*\.?\d+$/.test(s)) return `${s}px`;
  return s;
};
const FONTS = [
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Oswald", value: "var(--font-oswald), sans-serif" },
  { label: "Playfair", value: "var(--font-playfair), serif" },
  { label: "System", value: "system-ui, sans-serif" },
];

// ── Reusable controls ────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = false, show = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean; show?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!show) return null;
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
      >
        {title}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

const lbl = "text-gray-500 text-[11px]";
const inputCls = "bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:border-blue-500";

type RowProps = {
  label: string;
  prop: string;
  def?: string;
  get: (prop: string, def?: string) => string;
  set: (prop: string, val: string) => void;
};

function TextRow({ label, prop, def = "", placeholder, get, set, w = "w-24" }: RowProps & { placeholder?: string; w?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={lbl}>{label}</span>
      <input type="text" value={get(prop, def)} placeholder={placeholder} onChange={(e) => set(prop, e.target.value)} className={`${inputCls} ${w} text-right`} />
    </div>
  );
}
function SelectRow({ label, prop, def, options, get, set, onSet }: RowProps & { options: { label: string; value: string }[]; onSet?: (val: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className={lbl}>{label}</span>
      <select value={get(prop, def)} onChange={(e) => (onSet ? onSet(e.target.value) : set(prop, e.target.value))} className={`${inputCls} w-28 cursor-pointer`}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function ColorRow({ label, prop, def, get, set, clear }: RowProps & { clear?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={lbl}>{label}</span>
      <ColorInput value={get(prop, def)} onChange={(v) => set(prop, v)} allowClear={!!clear} />
    </div>
  );
}
function UnitRow({ label, prop, def = "", get, set, units }: RowProps & { units?: Unit[] }) {
  return (
    <div className="flex items-center justify-between">
      <span className={lbl}>{label}</span>
      <UnitInput value={get(prop, def)} onChange={(v) => set(prop, v)} units={units} />
    </div>
  );
}
function Segmented({ options, value, onChange }: { options: { value: string; node: React.ReactNode; title?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1 p-1 bg-gray-50 border border-gray-200 rounded-md" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`flex justify-center items-center py-1 rounded border text-[11px] capitalize ${value === o.value ? "bg-white shadow-sm border-gray-200 text-gray-800" : "border-transparent text-gray-500 hover:bg-gray-200"}`}
        >
          {o.node}
        </button>
      ))}
    </div>
  );
}

/** The universal Style tab. Every control writes to the node's `props.style`. */
export const StyleControls = ({ getStyle: get, setStyle: set, groups = ALL_STYLE_GROUPS }: Props) => {
  const has = (g: StyleGroup) => groups.includes(g);
  const display = get("display", "block");
  const position = get("position", "relative");
  const bgImage = get("backgroundImage", "");
  const isGradient = bgImage.includes("gradient");

  const setGradient = (angle: string, c1: string, c2: string) =>
    set("backgroundImage", `linear-gradient(${angle}deg, ${c1}, ${c2})`);
  // Parse current gradient back (best-effort) for the pickers.
  const gm = bgImage.match(/linear-gradient\(([-\d.]+)deg,\s*([^,]+),\s*([^)]+)\)/);
  const gAngle = gm?.[1] ?? "90";
  const gC1 = asHex((gm?.[2] ?? "").trim(), "#2563eb");
  const gC2 = asHex((gm?.[3] ?? "").trim(), "#7c3aed");

  return (
    <div>
      {/* ── LAYOUT ── */}
      <Section title="Layout" defaultOpen show={has("layout")}>
        <Segmented
          value={display}
          onChange={(v) => set("display", v)}
          options={[
            { value: "block", node: "Block" }, { value: "flex", node: "Flex" },
            { value: "grid", node: "Grid" }, { value: "inline-block", node: "Inline" }, { value: "none", node: "None" },
          ]}
        />
        {display === "flex" && (
          <>
            <SelectRow label="Direction" prop="flexDirection" def="row" get={get} set={set}
              options={[{ label: "Row", value: "row" }, { label: "Column", value: "column" }, { label: "Row reverse", value: "row-reverse" }, { label: "Col reverse", value: "column-reverse" }]} />
            <SelectRow label="Justify" prop="justifyContent" def="flex-start" get={get} set={set}
              options={[{ label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Space between", value: "space-between" }, { label: "Space around", value: "space-around" }]} />
            <SelectRow label="Align" prop="alignItems" def="stretch" get={get} set={set}
              options={[{ label: "Stretch", value: "stretch" }, { label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }]} />
            <SelectRow label="Wrap" prop="flexWrap" def="nowrap" get={get} set={set}
              options={[{ label: "No wrap", value: "nowrap" }, { label: "Wrap", value: "wrap" }]} />
          </>
        )}
        {(display === "flex" || display === "grid") && <UnitRow label="Gap" prop="gap" def="0px" get={get} set={set} units={["px", "rem", "%"]} />}
      </Section>

      {/* ── SPACING ── */}
      <Section title="Spacing" defaultOpen show={has("spacing")}>
        <div className="relative w-full h-40 bg-gray-50 border border-gray-200 rounded-md p-6 select-none">
          <div className="absolute top-2 left-3 text-[9px] text-gray-400 font-medium tracking-widest">MARGIN</div>
          {(["marginTop:top-2 left-1/2 -translate-x-1/2", "marginBottom:bottom-2 left-1/2 -translate-x-1/2", "marginLeft:top-1/2 left-2 -translate-y-1/2", "marginRight:top-1/2 right-2 -translate-y-1/2"] as const).map((s) => {
            const [prop, cls] = s.split(":");
            return <input key={prop} type="text" inputMode="numeric" value={lenDisplay(get(prop, "0px"))} onChange={(e) => set(prop, toLen(e.target.value))} className={`absolute ${cls} w-9 text-center bg-transparent text-[10px] text-gray-700 focus:outline-none focus:bg-white rounded hover:bg-gray-200`} />;
          })}
          <div className="w-full h-full bg-white border border-dashed border-gray-300 rounded relative">
            <div className="absolute top-1 left-2 text-[9px] text-gray-400 font-medium tracking-widest">PADDING</div>
            {(["paddingTop:top-1 left-1/2 -translate-x-1/2", "paddingBottom:bottom-1 left-1/2 -translate-x-1/2", "paddingLeft:top-1/2 left-1 -translate-y-1/2", "paddingRight:top-1/2 right-1 -translate-y-1/2"] as const).map((s) => {
              const [prop, cls] = s.split(":");
              return <input key={prop} type="text" inputMode="numeric" value={lenDisplay(get(prop, "0px"))} onChange={(e) => set(prop, toLen(e.target.value))} className={`absolute ${cls} w-9 text-center bg-transparent text-[10px] text-gray-700 focus:outline-none focus:bg-gray-50 rounded hover:bg-gray-100`} />;
            })}
            <div className="absolute inset-8 bg-blue-50 border border-blue-100 rounded-sm opacity-50" />
          </div>
        </div>
      </Section>

      {/* ── SIZE ── */}
      <Section title="Size" show={has("size")}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {([["Width", "width", "auto"], ["Height", "height", "auto"], ["Min W", "minWidth", "auto"], ["Min H", "minHeight", "auto"], ["Max W", "maxWidth", "auto"], ["Max H", "maxHeight", "auto"]] as const).map(([l, p, d]) => (
            <div key={p} className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] uppercase">{l}</span>
              <UnitInput value={get(p, d)} onChange={(v) => set(p, v)} units={["px", "%", "vh", "vw", "auto"]} />
            </div>
          ))}
        </div>
        <SelectRow label="Overflow" prop="overflow" def="visible" get={get} set={set}
          options={[{ label: "Visible", value: "visible" }, { label: "Hidden", value: "hidden" }, { label: "Auto", value: "auto" }, { label: "Scroll", value: "scroll" }]} />
        <SelectRow label="Object fit" prop="objectFit" def="fill" get={get} set={set}
          options={[{ label: "Fill", value: "fill" }, { label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "None", value: "none" }]} />
      </Section>

      {/* ── POSITION ── */}
      <Section title="Position" show={has("position")}>
        <SelectRow label="Position" prop="position" def="relative" get={get} set={set}
          options={[{ label: "Static", value: "static" }, { label: "Relative", value: "relative" }, { label: "Absolute", value: "absolute" }, { label: "Fixed", value: "fixed" }, { label: "Sticky", value: "sticky" }]} />
        {position !== "static" && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {([["Top", "top"], ["Right", "right"], ["Bottom", "bottom"], ["Left", "left"]] as const).map(([l, p]) => (
              <div key={p} className="flex items-center justify-between">
                <span className="text-gray-400 text-[10px] uppercase">{l}</span>
                <UnitInput value={get(p, "auto")} onChange={(v) => set(p, v)} units={["px", "%", "auto"]} />
              </div>
            ))}
          </div>
        )}
        <TextRow label="Z-index" prop="zIndex" def="auto" get={get} set={set} w="w-20" />
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section title="Typography" defaultOpen show={has("typography")}>
        <SelectRow label="Font" prop="fontFamily" def={FONTS[0].value} get={get} set={set} options={FONTS} />
        <UnitRow label="Size" prop="fontSize" def="16px" get={get} set={set} units={["px", "rem", "em", "%"]} />
        <div className="flex items-center justify-between">
          <span className={lbl}>Weight</span>
          <select value={get("fontWeight", "400")} onChange={(e) => set("fontWeight", e.target.value)} className={`${inputCls} w-28 cursor-pointer`}>
            {[["Light", "300"], ["Normal", "400"], ["Medium", "500"], ["Semibold", "600"], ["Bold", "700"], ["Extrabold", "800"]].map(([l, w]) => <option key={w} value={w}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className={lbl}>Line height</span>
          <input type="text" value={get("lineHeight", "1.5")} onChange={(e) => set("lineHeight", e.target.value)} className={`${inputCls} w-20 text-right`} />
        </div>
        <UnitRow label="Letter spacing" prop="letterSpacing" def="0px" get={get} set={set} units={["px", "em"]} />
        <ColorRow label="Color" prop="color" def="#111827" get={get} set={set} />
        <Segmented value={get("textAlign", "left")} onChange={(v) => set("textAlign", v)}
          options={[{ value: "left", node: <AlignLeft size={13} /> }, { value: "center", node: <AlignCenter size={13} /> }, { value: "right", node: <AlignRight size={13} /> }, { value: "justify", node: <AlignJustify size={13} /> }]} />
        <div className="flex items-center gap-2">
          <button onClick={() => set("fontStyle", get("fontStyle") === "italic" ? "normal" : "italic")} className={`flex-1 flex justify-center py-1 rounded border ${get("fontStyle") === "italic" ? "bg-white shadow-sm border-gray-200 text-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`} title="Italic"><Italic size={13} /></button>
          <button onClick={() => set("textDecoration", get("textDecoration") === "underline" ? "none" : "underline")} className={`flex-1 flex justify-center py-1 rounded border ${get("textDecoration") === "underline" ? "bg-white shadow-sm border-gray-200 text-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`} title="Underline"><Underline size={13} /></button>
        </div>
        <SelectRow label="Transform" prop="textTransform" def="none" get={get} set={set}
          options={[{ label: "None", value: "none" }, { label: "Uppercase", value: "uppercase" }, { label: "Lowercase", value: "lowercase" }, { label: "Capitalize", value: "capitalize" }]} />
      </Section>

      {/* ── BACKGROUND ── */}
      <Section title="Background" show={has("background")}>
        <ColorRow label="Color" prop="backgroundColor" def="#ffffff" get={get} set={set} clear={true} />
        <div className="pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className={lbl}>Gradient</span>
            {isGradient
              ? <button onClick={() => set("backgroundImage", "none")} className="text-[10px] text-gray-400 hover:text-gray-700 border border-gray-200 rounded px-1.5 py-0.5">Remove</button>
              : <button onClick={() => setGradient("90", "#2563eb", "#7c3aed")} className="text-[10px] text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">Add</button>}
          </div>
          {isGradient && (
            <div className="flex items-center gap-2">
              <input type="color" value={gC1} onChange={(e) => setGradient(gAngle, e.target.value, gC2)} className="w-6 h-6 p-0 border border-gray-200 rounded cursor-pointer" />
              <input type="color" value={gC2} onChange={(e) => setGradient(gAngle, gC1, e.target.value)} className="w-6 h-6 p-0 border border-gray-200 rounded cursor-pointer" />
              <input type="number" value={gAngle} onChange={(e) => setGradient(e.target.value || "0", gC1, gC2)} className={`${inputCls} w-16`} title="Angle" />
              <span className="text-[10px] text-gray-400">deg</span>
            </div>
          )}
        </div>
        {!isGradient && (
          <>
            <TextRow label="Image URL" prop="backgroundImage" def="" placeholder="url(...)" get={get} set={(p: string, v: string) => set(p, v ? `url("${v.replace(/^url\(["']?|["']?\)$/g, "")}")` : "none")} w="w-28" />
            {bgImage && bgImage !== "none" && (
              <>
                <SelectRow label="Size" prop="backgroundSize" def="cover" get={get} set={set} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Auto", value: "auto" }]} />
                <SelectRow label="Repeat" prop="backgroundRepeat" def="no-repeat" get={get} set={set} options={[{ label: "No repeat", value: "no-repeat" }, { label: "Repeat", value: "repeat" }]} />
                <TextRow label="Position" prop="backgroundPosition" def="center" get={get} set={set} w="w-24" />
              </>
            )}
          </>
        )}
      </Section>

      {/* ── BORDER ── */}
      <Section title="Border" show={has("border")}>
        <SelectRow label="Style" prop="borderStyle" def="none" get={get} set={set}
          options={[{ label: "None", value: "none" }, { label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} />
        <UnitRow label="Width" prop="borderWidth" def="0px" get={get} set={set} units={["px"]} />
        <ColorRow label="Color" prop="borderColor" def="#e5e7eb" get={get} set={set} />
        <UnitRow label="Radius" prop="borderRadius" def="0px" get={get} set={set} units={["px", "%"]} />
      </Section>

      {/* ── EFFECTS ── */}
      <Section title="Effects" show={has("effects")}>
        <div className="flex items-center justify-between">
          <span className={lbl}>Opacity</span>
          <input type="range" min={0} max={1} step={0.05} value={parseFloat(get("opacity", "1"))} onChange={(e) => set("opacity", e.target.value)} className="w-32 accent-blue-600" />
        </div>
        <SelectRow label="Shadow" prop="boxShadow" def="none" get={get} set={set}
          options={[{ label: "None", value: "none" }, { label: "Small", value: "0 1px 3px rgba(0,0,0,0.12)" }, { label: "Medium", value: "0 4px 12px rgba(0,0,0,0.15)" }, { label: "Large", value: "0 12px 32px rgba(0,0,0,0.2)" }, { label: "XL", value: "0 24px 60px rgba(0,0,0,0.25)" }]} />
        <SelectRow label="Cursor" prop="cursor" def="auto" get={get} set={set}
          options={[{ label: "Auto", value: "auto" }, { label: "Pointer", value: "pointer" }, { label: "Default", value: "default" }, { label: "Text", value: "text" }, { label: "Grab", value: "grab" }, { label: "Not allowed", value: "not-allowed" }]} />
        <TextRow label="Transform" prop="transform" def="" placeholder="rotate(0deg)" get={get} set={set} w="w-32" />
        <TextRow label="Filter" prop="filter" def="" placeholder="blur(0px)" get={get} set={set} w="w-32" />
        <TextRow label="Transition" prop="transition" def="" placeholder="all 0.3s ease" get={get} set={set} w="w-32" />
      </Section>
    </div>
  );
};
