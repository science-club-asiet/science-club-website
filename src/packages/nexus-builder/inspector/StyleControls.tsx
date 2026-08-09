import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Italic, Underline } from "lucide-react";
import { Section, Row, Segmented } from "../ui/primitives";
import { NumberField, SelectField, TextField, ColorField, Slider, SpacingBox } from "../ui/fields";
import { ALL_STYLE_GROUPS, type StyleGroup } from "../registry/types";
import * as t from "../ui/tokens";

type Props = {
  getStyle: (property: string, defaultValue?: string) => string;
  setStyle: (property: string, value: any) => void;
  groups?: StyleGroup[];
};

const asHex = (value: string, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback);

const FONTS = [
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Oswald", value: "var(--font-oswald), sans-serif" },
  { label: "Playfair", value: "var(--font-playfair), serif" },
  { label: "System", value: "system-ui, sans-serif" },
];
const LEN = ["px", "%", "rem", "vh", "auto"] as const;

/** Universal Style tab — every control writes to the node's `props.style`. */
export const StyleControls = ({ getStyle: get, setStyle: set, groups = ALL_STYLE_GROUPS }: Props) => {
  const has = (g: StyleGroup) => groups.includes(g);
  const display = get("display", "block");
  const position = get("position", "relative");
  const bgImage = get("backgroundImage", "");
  const isGradient = bgImage.includes("gradient");
  const gm = bgImage.match(/linear-gradient\(([-\d.]+)deg,\s*([^,]+),\s*([^)]+)\)/);
  const gAngle = gm?.[1] ?? "90";
  const gC1 = (gm?.[2] ?? "#2563eb").trim();
  const gC2 = (gm?.[3] ?? "#7c3aed").trim();
  const setGradient = (a: string, c1: string, c2: string) => set("backgroundImage", `linear-gradient(${a}deg, ${c1}, ${c2})`);
  const bgUrl = bgImage && !isGradient ? bgImage.replace(/^url\(["']?|["']?\)$/g, "") : "";

  return (
    <div>
      {/* LAYOUT */}
      <Section title="Layout" show={has("layout")}>
        <Segmented value={display} onChange={(v) => set("display", v)} options={[
          { value: "block", label: "Block" }, { value: "flex", label: "Flex" }, { value: "grid", label: "Grid" },
          { value: "inline-block", label: "Inline", title: "Inline block" }, { value: "none", label: "None" },
        ]} />
        {display === "flex" && (
          <>
            <Row label="Direction"><SelectField className="w-32" value={get("flexDirection", "row")} onChange={(v) => set("flexDirection", v)} options={[
              { label: "Row", value: "row" }, { label: "Column", value: "column" }, { label: "Row reverse", value: "row-reverse" }, { label: "Col reverse", value: "column-reverse" }]} /></Row>
            <Row label="Justify"><SelectField className="w-32" value={get("justifyContent", "flex-start")} onChange={(v) => set("justifyContent", v)} options={[
              { label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Between", value: "space-between" }, { label: "Around", value: "space-around" }]} /></Row>
            <Row label="Align"><SelectField className="w-32" value={get("alignItems", "stretch")} onChange={(v) => set("alignItems", v)} options={[
              { label: "Stretch", value: "stretch" }, { label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }]} /></Row>
            <Row label="Wrap"><SelectField className="w-32" value={get("flexWrap", "nowrap")} onChange={(v) => set("flexWrap", v)} options={[{ label: "No wrap", value: "nowrap" }, { label: "Wrap", value: "wrap" }]} /></Row>
          </>
        )}
        {(display === "flex" || display === "grid") && <Row label="Gap"><NumberField className="w-24" units={["px", "rem", "%"]} value={get("gap", "0px")} onChange={(v) => set("gap", v)} /></Row>}
      </Section>

      {/* SPACING */}
      <Section title="Spacing" show={has("spacing")}>
        <SpacingBox get={(p) => get(p, "0px")} set={set} />
      </Section>

      {/* SIZE */}
      <Section title="Size" show={has("size")} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {([["Width", "width"], ["Height", "height"], ["Min W", "minWidth"], ["Min H", "minHeight"], ["Max W", "maxWidth"], ["Max H", "maxHeight"]] as const).map(([l, p]) => (
            <div key={p} className="flex items-center gap-1.5">
              <span className={`${t.label} w-8 shrink-0`}>{l}</span>
              <NumberField units={[...LEN]} value={get(p, "auto")} onChange={(v) => set(p, v)} />
            </div>
          ))}
        </div>
        <Row label="Overflow"><SelectField className="w-32" value={get("overflow", "visible")} onChange={(v) => set("overflow", v)} options={[
          { label: "Visible", value: "visible" }, { label: "Hidden", value: "hidden" }, { label: "Auto", value: "auto" }, { label: "Scroll", value: "scroll" }]} /></Row>
        <Row label="Fit"><SelectField className="w-32" value={get("objectFit", "fill")} onChange={(v) => set("objectFit", v)} options={[
          { label: "Fill", value: "fill" }, { label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "None", value: "none" }]} /></Row>
      </Section>

      {/* POSITION */}
      <Section title="Position" show={has("position")} defaultOpen={false}>
        <Row label="Position"><SelectField className="w-32" value={position} onChange={(v) => set("position", v)} options={[
          { label: "Static", value: "static" }, { label: "Relative", value: "relative" }, { label: "Absolute", value: "absolute" }, { label: "Fixed", value: "fixed" }, { label: "Sticky", value: "sticky" }]} /></Row>
        {position !== "static" && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {([["Top", "top"], ["Right", "right"], ["Bottom", "bottom"], ["Left", "left"]] as const).map(([l, p]) => (
              <div key={p} className="flex items-center gap-1.5">
                <span className={`${t.label} w-10 shrink-0`}>{l}</span>
                <NumberField units={["px", "%", "auto"]} value={get(p, "auto")} onChange={(v) => set(p, v)} />
              </div>
            ))}
          </div>
        )}
        <Row label="Z-index"><NumberField className="w-24" value={get("zIndex", "")} onChange={(v) => set("zIndex", v)} placeholder="auto" /></Row>
      </Section>

      {/* TYPOGRAPHY */}
      <Section title="Typography" show={has("typography")}>
        <Row label="Font"><SelectField className="w-40" value={get("fontFamily", FONTS[0].value)} onChange={(v) => set("fontFamily", v)} options={FONTS} /></Row>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5"><span className={`${t.label} w-8`}>Size</span><NumberField units={["px", "rem", "em"]} value={get("fontSize", "16px")} onChange={(v) => set("fontSize", v)} /></div>
          <div className="flex items-center gap-1.5"><span className={`${t.label} w-8`}>Line</span><NumberField value={get("lineHeight", "1.5")} onChange={(v) => set("lineHeight", v)} /></div>
          <div className="flex items-center gap-1.5"><span className={`${t.label} w-8`}>Wght</span><SelectField value={get("fontWeight", "400")} onChange={(v) => set("fontWeight", v)} options={[["300", "Light"], ["400", "Normal"], ["500", "Medium"], ["600", "Semibold"], ["700", "Bold"], ["800", "Extra"]].map(([v, l]) => ({ value: v, label: l }))} /></div>
          <div className="flex items-center gap-1.5"><span className={`${t.label} w-8`}>Spc</span><NumberField units={["px", "em"]} value={get("letterSpacing", "0px")} onChange={(v) => set("letterSpacing", v)} /></div>
        </div>
        <Row label="Color"><ColorField value={get("color", "#111827")} onChange={(v) => set("color", v)} /></Row>
        <Row label="Align">
          <Segmented className="w-40" value={get("textAlign", "left")} onChange={(v) => set("textAlign", v)} options={[
            { value: "left", icon: <AlignLeft size={13} /> }, { value: "center", icon: <AlignCenter size={13} /> }, { value: "right", icon: <AlignRight size={13} /> }, { value: "justify", icon: <AlignJustify size={13} /> }]} />
        </Row>
        <Row label="Style">
          <Segmented className="w-24" value={get("fontStyle") === "italic" ? "i" : "n"} onChange={(v) => set("fontStyle", v === "i" ? "italic" : "normal")} options={[{ value: "n", label: "—", title: "Normal" }, { value: "i", icon: <Italic size={12} /> }]} />
          <Segmented className="w-24" value={get("textDecoration") === "underline" ? "u" : "n"} onChange={(v) => set("textDecoration", v === "u" ? "underline" : "none")} options={[{ value: "n", label: "—", title: "None" }, { value: "u", icon: <Underline size={12} /> }]} />
        </Row>
        <Row label="Transform"><SelectField className="w-32" value={get("textTransform", "none")} onChange={(v) => set("textTransform", v)} options={[
          { label: "None", value: "none" }, { label: "Uppercase", value: "uppercase" }, { label: "Lowercase", value: "lowercase" }, { label: "Capitalize", value: "capitalize" }]} /></Row>
      </Section>

      {/* BACKGROUND */}
      <Section title="Background" show={has("background")} defaultOpen={false}>
        <Row label="Color"><ColorField value={get("backgroundColor", "transparent")} onChange={(v) => set("backgroundColor", v)} allowClear /></Row>
        <Row label="Gradient">
          {isGradient ? (
            <div className="flex items-center gap-1.5">
              <input type="color" value={asHex(gC1, "#2563eb")} onChange={(e) => setGradient(gAngle, e.target.value, gC2)} className="w-6 h-6 rounded border border-[#E3E6EB] p-0 cursor-pointer" />
              <input type="color" value={asHex(gC2, "#7c3aed")} onChange={(e) => setGradient(gAngle, gC1, e.target.value)} className="w-6 h-6 rounded border border-[#E3E6EB] p-0 cursor-pointer" />
              <NumberField className="w-16" value={gAngle} onChange={(v) => setGradient(v || "0", gC1, gC2)} />
              <button onClick={() => set("backgroundImage", "none")} className="text-[10px] text-[#9CA3AF] hover:text-[#111827]">✕</button>
            </div>
          ) : (
            <button onClick={() => setGradient("90", "#2563eb", "#7c3aed")} className="text-[11px] text-[#2563EB] hover:underline">Add</button>
          )}
        </Row>
        {!isGradient && (
          <>
            <Row label="Image"><TextField value={bgUrl} placeholder="image url" onChange={(v) => set("backgroundImage", v ? `url("${v}")` : "none")} /></Row>
            {bgUrl && (
              <>
                <Row label="Size"><SelectField className="w-32" value={get("backgroundSize", "cover")} onChange={(v) => set("backgroundSize", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Auto", value: "auto" }]} /></Row>
                <Row label="Repeat"><SelectField className="w-32" value={get("backgroundRepeat", "no-repeat")} onChange={(v) => set("backgroundRepeat", v)} options={[{ label: "No repeat", value: "no-repeat" }, { label: "Repeat", value: "repeat" }]} /></Row>
              </>
            )}
          </>
        )}
      </Section>

      {/* BORDER */}
      <Section title="Border" show={has("border")} defaultOpen={false}>
        <Row label="Style"><SelectField className="w-32" value={get("borderStyle", "none")} onChange={(v) => set("borderStyle", v)} options={[
          { label: "None", value: "none" }, { label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} /></Row>
        <Row label="Width"><NumberField className="w-24" units={["px"]} value={get("borderWidth", "0px")} onChange={(v) => set("borderWidth", v)} /></Row>
        <Row label="Color"><ColorField value={get("borderColor", "#e5e7eb")} onChange={(v) => set("borderColor", v)} /></Row>
        <Row label="Radius"><NumberField className="w-24" units={["px", "%"]} value={get("borderRadius", "0px")} onChange={(v) => set("borderRadius", v)} /></Row>
      </Section>

      {/* EFFECTS */}
      <Section title="Effects" show={has("effects")} defaultOpen={false}>
        <Row label="Opacity">
          <Slider value={parseFloat(get("opacity", "1"))} onChange={(v) => set("opacity", String(v))} />
          <span className="text-[10px] text-[#6B7280] w-8 text-right">{Math.round(parseFloat(get("opacity", "1")) * 100)}%</span>
        </Row>
        <Row label="Shadow"><SelectField className="w-32" value={get("boxShadow", "none")} onChange={(v) => set("boxShadow", v)} options={[
          { label: "None", value: "none" }, { label: "Small", value: "0 1px 3px rgba(0,0,0,0.12)" }, { label: "Medium", value: "0 4px 12px rgba(0,0,0,0.15)" }, { label: "Large", value: "0 12px 32px rgba(0,0,0,0.2)" }, { label: "XL", value: "0 24px 60px rgba(0,0,0,0.25)" }]} /></Row>
        <Row label="Cursor"><SelectField className="w-32" value={get("cursor", "auto")} onChange={(v) => set("cursor", v)} options={[
          { label: "Auto", value: "auto" }, { label: "Pointer", value: "pointer" }, { label: "Default", value: "default" }, { label: "Text", value: "text" }, { label: "Grab", value: "grab" }, { label: "Not allowed", value: "not-allowed" }]} /></Row>
        <Row label="Transform" align="start"><TextField value={get("transform", "")} placeholder="rotate(0deg)" onChange={(v) => set("transform", v)} /></Row>
        <Row label="Filter" align="start"><TextField value={get("filter", "")} placeholder="blur(0px)" onChange={(v) => set("filter", v)} /></Row>
        <Row label="Transition" align="start"><TextField value={get("transition", "")} placeholder="all 0.3s ease" onChange={(v) => set("transition", v)} /></Row>
      </Section>
    </div>
  );
};
