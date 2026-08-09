/**
 * Builder design system — refined-light. One source of visual truth for the
 * builder chrome + inspector so controls stay perfectly consistent. These are
 * Tailwind class strings (the project is Tailwind v4). Purely presentational;
 * no logic.
 */

// Surfaces
export const panel = "bg-white";
export const hairline = "border-[#ECEEF2]";
export const hairlineB = "border-b border-[#ECEEF2]";
export const hoverRow = "hover:bg-[#F8F9FB]";

// Text
export const label = "text-[11px] font-medium text-[#6B7280]";
export const labelStrong = "text-[11px] font-semibold text-[#374151]";
export const muted = "text-[#9CA3AF]";
export const value = "text-[12px] text-[#111827]";

// The 28px control base (fields, selects, buttons).
export const control =
  "h-7 rounded-md border border-[#E3E6EB] bg-[#F6F7F9] text-[12px] text-[#111827] " +
  "transition-colors focus:outline-none focus:border-[#2563EB] focus:bg-white " +
  "placeholder:text-[#9CA3AF]";

export const field = `${control} w-full px-2`;
export const fieldSm = `${control} px-1.5 text-right`;

export const selectCls = `${control} w-full px-2 cursor-pointer appearance-none`;

// Segmented control (icon/label segments)
export const segWrap = "flex items-center gap-0.5 p-0.5 rounded-md bg-[#F1F3F6] border border-[#E3E6EB]";
export const segItem = "flex-1 h-6 flex items-center justify-center rounded text-[11px] text-[#6B7280] transition-colors hover:text-[#111827]";
export const segItemOn = "bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)]";

// Icon buttons (header actions, etc.)
export const iconBtn = "w-7 h-7 flex items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F1F3F6] hover:text-[#111827] transition-colors";

// Section header (collapsible)
export const sectionHeader =
  "w-full flex items-center justify-between px-3 h-9 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6B7280] hover:text-[#111827] transition-colors";
export const sectionBody = "px-3 pb-3 pt-0.5 space-y-2.5";

export const accent = "#2563EB";
