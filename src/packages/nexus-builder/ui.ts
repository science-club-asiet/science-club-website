/**
 * One design language for the whole builder chrome. Quiet, modern, "design tool"
 * register (Linear / Framer / Webflow-light) — neutral grays, hairline borders,
 * a single blue accent that matches the on-canvas selection. Import these instead
 * of hand-writing classes so every panel/control looks like one product.
 *
 * Accent stays blue (#2563eb) — it's the editor's interaction color, distinct
 * from the site's brand (navy/red), which belongs to the user's content only.
 */

// Surfaces
export const CANVAS_BG = "bg-[#f5f6f8]";
export const PANEL = "bg-white";
export const HAIR = "border-[#e7e9ee]"; // hairline divider/border color
export const HAIR_B = "border-b border-[#e7e9ee]";
export const HAIR_R = "border-r border-[#e7e9ee]";
export const HAIR_L = "border-l border-[#e7e9ee]";

// Text
export const T_PRIMARY = "text-gray-900";
export const T_SECONDARY = "text-gray-500";
export const T_MUTED = "text-gray-400";
export const LABEL = "text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400";

// Form controls (inputs, selects) — consistent 30px height
export const CONTROL =
  "h-[30px] w-full rounded-md border border-gray-200 bg-gray-50/80 px-2 text-[12px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition";
export const CONTROL_SM =
  "h-[26px] rounded-md border border-gray-200 bg-gray-50/80 px-1.5 text-[11px] text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition";

// Buttons
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 h-[30px] px-3 rounded-md bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 h-[30px] px-3 rounded-md border border-gray-200 bg-white text-gray-700 text-[12px] font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors";
export const ICON_BTN =
  "inline-flex items-center justify-center h-[30px] w-[30px] rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

// Segmented control (device switcher, alignment, display…)
export const SEG_WRAP = "inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5";
export const segBtn = (active: boolean) =>
  `inline-flex items-center justify-center rounded-md text-[12px] transition-colors ${
    active ? "bg-white text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.06)]" : "text-gray-400 hover:text-gray-700"
  }`;

// A row inside a panel: label on the left, control on the right
export const ROW = "flex items-center justify-between gap-3 min-h-[30px]";

// Section header (collapsible section title)
export const SECTION_TITLE =
  "w-full flex items-center justify-between px-3.5 py-2.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50/70 transition-colors";

export const ACCENT = "#2563eb";
