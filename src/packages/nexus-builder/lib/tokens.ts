/**
 * Design tokens. Brand colours reference the site's existing CSS variables
 * (defined in globals.css), so builder content stays visually linked to the
 * theme — rebrand the site and every page built here follows. `preview` is the
 * resolved hex used to paint swatches (a color input can't render a var()).
 */
export type ColorToken = { name: string; value: string; preview: string };

export const COLOR_TOKENS: ColorToken[] = [
  { name: "Navy", value: "var(--brand-navy)", preview: "#001C58" },
  { name: "Red", value: "var(--brand-red)", preview: "#DA291C" },
  { name: "Gold", value: "var(--brand-gold)", preview: "#C8A059" },
  { name: "Ink", value: "#111827", preview: "#111827" },
  { name: "Muted", value: "#6b7280", preview: "#6b7280" },
  { name: "Line", value: "#e5e7eb", preview: "#e5e7eb" },
  { name: "White", value: "#ffffff", preview: "#ffffff" },
  { name: "Transparent", value: "transparent", preview: "transparent" },
];

/** Spacing scale (px) — a consistent rhythm for padding/margins/gaps. */
export const SPACING_SCALE = ["0", "4", "8", "12", "16", "24", "32", "48", "64", "80"];

/** Type scale (px). */
export const FONT_SCALE = ["12", "14", "16", "18", "20", "24", "30", "36", "48", "60"];
