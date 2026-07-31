import React from "react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

type Props = {
  getStyle: (property: string, defaultValue?: string) => string;
  setStyle: (property: string, value: any) => void;
};

const asHex = (value: string, fallback: string) =>
  /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

const FONTS = [
  { label: "Inter (body)", value: "var(--font-inter), sans-serif" },
  { label: "Oswald (heading)", value: "var(--font-oswald), sans-serif" },
  { label: "Playfair", value: "var(--font-playfair), serif" },
  { label: "System", value: "system-ui, sans-serif" },
];

const rowInput = "w-16 bg-gray-50 text-right text-gray-700 outline-none rounded px-1 py-0.5 border border-transparent focus:border-blue-400";
const selCls = "bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none";

/** The universal Style tab. Every control writes to the node's `props.style`. */
export const StyleControls = ({ getStyle, setStyle }: Props) => {
  const display = getStyle("display", "block");

  return (
    <div className="divide-y divide-gray-100">
      {/* LAYOUT */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-3">Layout</h3>
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-50 border border-gray-200 rounded-md mb-4">
          {(["block", "flex", "grid", "none"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setStyle("display", d)}
              className={`flex justify-center py-1 rounded border capitalize text-[11px] ${
                display === d ? "bg-white shadow-sm border-gray-200 text-gray-700" : "border-transparent text-gray-500 hover:bg-gray-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {display === "flex" && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Direction</span>
              <select value={getStyle("flexDirection", "row")} onChange={(e) => setStyle("flexDirection", e.target.value)} className={`${selCls} w-28`}>
                <option value="row">Row</option>
                <option value="column">Column</option>
                <option value="row-reverse">Row reverse</option>
                <option value="column-reverse">Column reverse</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Justify</span>
              <select value={getStyle("justifyContent", "flex-start")} onChange={(e) => setStyle("justifyContent", e.target.value)} className={`${selCls} w-28`}>
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Space between</option>
                <option value="space-around">Space around</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Align</span>
              <select value={getStyle("alignItems", "stretch")} onChange={(e) => setStyle("alignItems", e.target.value)} className={`${selCls} w-28`}>
                <option value="stretch">Stretch</option>
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Wrap</span>
              <select value={getStyle("flexWrap", "nowrap")} onChange={(e) => setStyle("flexWrap", e.target.value)} className={`${selCls} w-28`}>
                <option value="nowrap">No wrap</option>
                <option value="wrap">Wrap</option>
              </select>
            </div>
          </div>
        )}

        {(display === "flex" || display === "grid") && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Gap</span>
            <input type="text" value={getStyle("gap", "0px")} onChange={(e) => setStyle("gap", e.target.value)} className={rowInput} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Position</span>
          <select value={getStyle("position", "relative")} onChange={(e) => setStyle("position", e.target.value)} className={`${selCls} w-28`}>
            <option value="static">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>
      </div>

      {/* SPACING — visual box model */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-4">Spacing</h3>
        <div className="relative w-full h-40 bg-gray-50 border border-gray-200 rounded-md p-6 select-none">
          <div className="absolute top-2 left-3 text-[9px] text-gray-400 font-medium tracking-widest">MARGIN</div>
          <input type="text" value={getStyle("marginTop", "0")} onChange={(e) => setStyle("marginTop", e.target.value)} className="absolute top-2 left-1/2 -translate-x-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-white rounded hover:bg-gray-200" />
          <input type="text" value={getStyle("marginBottom", "0")} onChange={(e) => setStyle("marginBottom", e.target.value)} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-white rounded hover:bg-gray-200" />
          <input type="text" value={getStyle("marginLeft", "0")} onChange={(e) => setStyle("marginLeft", e.target.value)} className="absolute top-1/2 left-2 -translate-y-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-white rounded hover:bg-gray-200" />
          <input type="text" value={getStyle("marginRight", "0")} onChange={(e) => setStyle("marginRight", e.target.value)} className="absolute top-1/2 right-2 -translate-y-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-white rounded hover:bg-gray-200" />
          <div className="w-full h-full bg-white border border-dashed border-gray-300 rounded relative">
            <div className="absolute top-1 left-2 text-[9px] text-gray-400 font-medium tracking-widest">PADDING</div>
            <input type="text" value={getStyle("paddingTop", "0")} onChange={(e) => setStyle("paddingTop", e.target.value)} className="absolute top-1 left-1/2 -translate-x-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-gray-50 rounded hover:bg-gray-100" />
            <input type="text" value={getStyle("paddingBottom", "0")} onChange={(e) => setStyle("paddingBottom", e.target.value)} className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-gray-50 rounded hover:bg-gray-100" />
            <input type="text" value={getStyle("paddingLeft", "0")} onChange={(e) => setStyle("paddingLeft", e.target.value)} className="absolute top-1/2 left-1 -translate-y-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-gray-50 rounded hover:bg-gray-100" />
            <input type="text" value={getStyle("paddingRight", "0")} onChange={(e) => setStyle("paddingRight", e.target.value)} className="absolute top-1/2 right-1 -translate-y-1/2 w-8 text-center bg-transparent text-[10px] text-gray-600 focus:outline-none focus:bg-gray-50 rounded hover:bg-gray-100" />
            <div className="absolute inset-8 bg-blue-50 border border-blue-100 rounded-sm opacity-50" />
          </div>
        </div>
      </div>

      {/* SIZE */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-3">Size</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {([
            ["Width", "width", "auto"],
            ["Height", "height", "auto"],
            ["Min W", "minWidth", "0"],
            ["Min H", "minHeight", "0"],
            ["Max W", "maxWidth", "none"],
            ["Max H", "maxHeight", "none"],
          ] as const).map(([label, prop, def]) => (
            <div key={prop} className="flex items-center justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-400 text-[10px] uppercase">{label}</span>
              <input type="text" value={getStyle(prop, def)} onChange={(e) => setStyle(prop, e.target.value)} className="w-16 bg-gray-50 text-right text-gray-700 outline-none rounded px-1" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-500">Overflow</span>
          <select value={getStyle("overflow", "visible")} onChange={(e) => setStyle("overflow", e.target.value)} className={`${selCls} w-28`}>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="auto">Auto</option>
            <option value="scroll">Scroll</option>
          </select>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-500">Object fit</span>
          <select value={getStyle("objectFit", "fill")} onChange={(e) => setStyle("objectFit", e.target.value)} className={`${selCls} w-28`}>
            <option value="fill">Fill</option>
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* TYPOGRAPHY */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-3">Typography</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Font</span>
            <select value={getStyle("fontFamily", FONTS[0].value)} onChange={(e) => setStyle("fontFamily", e.target.value)} className={`${selCls} w-40 truncate`}>
              {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-400 text-[10px] uppercase">Size</span>
              <input type="text" value={getStyle("fontSize", "16px")} onChange={(e) => setStyle("fontSize", e.target.value)} className="w-12 text-right bg-transparent text-gray-700 outline-none" />
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-400 text-[10px] uppercase">Weight</span>
              <select value={getStyle("fontWeight", "400")} onChange={(e) => setStyle("fontWeight", e.target.value)} className="w-16 bg-transparent text-right text-gray-700 outline-none cursor-pointer">
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="800">Extrabold</option>
              </select>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-400 text-[10px] uppercase">Line H</span>
              <input type="text" value={getStyle("lineHeight", "1.5")} onChange={(e) => setStyle("lineHeight", e.target.value)} className="w-12 text-right bg-transparent text-gray-700 outline-none" />
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-400 text-[10px] uppercase">Spacing</span>
              <input type="text" value={getStyle("letterSpacing", "0")} onChange={(e) => setStyle("letterSpacing", e.target.value)} className="w-12 text-right bg-transparent text-gray-700 outline-none" />
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-500">Color</span>
            <input type="color" value={asHex(getStyle("color", "#111827"), "#111827")} onChange={(e) => setStyle("color", e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer" />
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-50 border border-gray-200 rounded-md">
            {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]] as const).map(([val, Icon]) => (
              <button key={val} onClick={() => setStyle("textAlign", val)} className={`flex justify-center py-1 rounded border ${getStyle("textAlign", "left") === val ? "bg-white shadow-sm border-gray-200 text-gray-700" : "border-transparent text-gray-500 hover:bg-gray-200"}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Transform</span>
            <select value={getStyle("textTransform", "none")} onChange={(e) => setStyle("textTransform", e.target.value)} className={`${selCls} w-28`}>
              <option value="none">None</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        </div>
      </div>

      {/* BACKGROUND */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-3">Background</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Color</span>
          <div className="flex items-center gap-2">
            <input type="color" value={asHex(getStyle("backgroundColor", "#ffffff"), "#ffffff")} onChange={(e) => setStyle("backgroundColor", e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer" />
            <button onClick={() => setStyle("backgroundColor", "transparent")} className="text-[10px] text-gray-400 hover:text-gray-700 border border-gray-200 rounded px-1.5 py-0.5">Clear</button>
          </div>
        </div>
      </div>

      {/* BORDER */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-3">Border</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-400 text-[10px] uppercase">Radius</span>
            <input type="text" value={getStyle("borderRadius", "0px")} onChange={(e) => setStyle("borderRadius", e.target.value)} className="w-16 bg-gray-50 text-right text-gray-700 outline-none rounded px-1" />
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-400 text-[10px] uppercase">Width</span>
            <input type="text" value={getStyle("borderWidth", "0px")} onChange={(e) => { setStyle("borderWidth", e.target.value); setStyle("borderStyle", "solid"); }} className="w-16 bg-gray-50 text-right text-gray-700 outline-none rounded px-1" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Color</span>
            <input type="color" value={asHex(getStyle("borderColor", "#e5e7eb"), "#e5e7eb")} onChange={(e) => setStyle("borderColor", e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* EFFECTS */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-800 mb-3">Effects</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Opacity</span>
            <input type="range" min={0} max={1} step={0.05} value={parseFloat(getStyle("opacity", "1"))} onChange={(e) => setStyle("opacity", e.target.value)} className="w-32 accent-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Shadow</span>
            <select
              value={getStyle("boxShadow", "none")}
              onChange={(e) => setStyle("boxShadow", e.target.value)}
              className={`${selCls} w-32`}
            >
              <option value="none">None</option>
              <option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
              <option value="0 4px 12px rgba(0,0,0,0.15)">Medium</option>
              <option value="0 12px 32px rgba(0,0,0,0.2)">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
