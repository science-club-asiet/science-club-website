import { createContext, useContext } from "react";

/**
 * Responsive model (Webflow-style, desktop-first cascade):
 *   - `props.style` holds the base (desktop) styles — applies at all widths.
 *   - `props.responsive.tablet` overrides at ≤991px.
 *   - `props.responsive.mobile` overrides at ≤767px.
 * Smaller breakpoints inherit larger ones (max-width media queries stack), so at
 * 375px both tablet and mobile overrides apply (mobile wins).
 */
export type Breakpoint = "desktop" | "tablet" | "mobile";

export type ResponsiveStyles = {
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
};

export const BREAKPOINTS: { id: Breakpoint; label: string; maxWidth?: number; canvas: string }[] = [
  { id: "desktop", label: "Desktop", canvas: "100%" },
  { id: "tablet", label: "Tablet", maxWidth: 991, canvas: "768px" },
  { id: "mobile", label: "Mobile", maxWidth: 767, canvas: "375px" },
];

/** Map the canvas device-switcher width to a breakpoint. */
export function bpFromWidth(width: string): Breakpoint {
  return BREAKPOINTS.find((b) => b.canvas === width)?.id ?? "desktop";
}

/** The effective inline style at a breakpoint (base + cascaded overrides). */
export function mergeStyle(
  base: Record<string, any> = {},
  responsive: ResponsiveStyles | undefined,
  bp: Breakpoint
): Record<string, any> {
  if (!responsive || bp === "desktop") return base ?? {};
  if (bp === "tablet") return { ...base, ...(responsive.tablet ?? {}) };
  return { ...base, ...(responsive.tablet ?? {}), ...(responsive.mobile ?? {}) };
}

const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const toDecl = (obj: Record<string, any>) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${camelToKebab(k)}:${v} !important`)
    .join(";");

/**
 * Media-query CSS for one node's responsive overrides, scoped by
 * `[data-nx="<id>"]`. `!important` beats the base inline style the element
 * still renders. Returns "" when there's nothing to override.
 */
export function responsiveCss(id: string, responsive: ResponsiveStyles | undefined): string {
  if (!responsive) return "";
  let css = "";
  for (const bp of BREAKPOINTS) {
    if (bp.id === "desktop" || !bp.maxWidth) continue;
    const decls = responsive[bp.id];
    if (decls && Object.keys(decls).length) {
      const body = toDecl(decls);
      if (body) css += `@media (max-width:${bp.maxWidth}px){[data-nx="${id}"]{${body}}}`;
    }
  }
  return css;
}

export const hasResponsive = (responsive: ResponsiveStyles | undefined) =>
  !!responsive && (!!responsive.tablet || !!responsive.mobile);

export type HideOn = { desktop?: boolean; tablet?: boolean; mobile?: boolean };

export const hasHideOn = (h: HideOn | undefined) => !!h && (!!h.desktop || !!h.tablet || !!h.mobile);
export const isHiddenOn = (h: HideOn | undefined, bp: Breakpoint) => !!h && !!h[bp];

/** Per-breakpoint hide CSS (Webflow bands), scoped by `[data-nx="<id>"]`. */
export function visibilityCss(id: string, h: HideOn | undefined): string {
  if (!h) return "";
  let css = "";
  if (h.desktop) css += `@media (min-width:992px){[data-nx="${id}"]{display:none !important}}`;
  if (h.tablet) css += `@media (max-width:991px) and (min-width:768px){[data-nx="${id}"]{display:none !important}}`;
  if (h.mobile) css += `@media (max-width:767px){[data-nx="${id}"]{display:none !important}}`;
  return css;
}

/** Active editor breakpoint, provided by NexusEditor from the device switcher. */
export const BreakpointContext = createContext<Breakpoint>("desktop");
export const useBreakpoint = () => useContext(BreakpointContext);
