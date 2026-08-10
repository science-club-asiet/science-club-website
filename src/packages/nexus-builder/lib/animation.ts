"use client";

import { useEffect } from "react";

export type AnimationType = "none" | "fade" | "up" | "down" | "left" | "right" | "zoom";
export type AnimationTrigger = "scroll" | "load";
export type AnimationConfig = {
  type: AnimationType;
  duration?: number; // ms
  delay?: number; // ms
  trigger?: AnimationTrigger;
};

/**
 * Global CSS for entrance animations. Elements start hidden and reveal when the
 * runtime marks them in-view. SSR-safe: a <noscript> fallback (emitted by the
 * renderer) shows everything if JS is off, and reduced-motion disables it.
 */
export const ANIMATION_CSS = `
[data-nx-anim]{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(0.22,1,0.36,1);will-change:opacity,transform}
[data-nx-anim="up"]{transform:translateY(28px)}
[data-nx-anim="down"]{transform:translateY(-28px)}
[data-nx-anim="left"]{transform:translateX(28px)}
[data-nx-anim="right"]{transform:translateX(-28px)}
[data-nx-anim="zoom"]{transform:scale(0.92)}
[data-nx-anim][data-inview="true"]{opacity:1;transform:none}
@media (prefers-reduced-motion: reduce){[data-nx-anim]{opacity:1 !important;transform:none !important;transition:none !important}}
`.trim();

export const ANIMATION_NOSCRIPT_CSS = `[data-nx-anim]{opacity:1 !important;transform:none !important}`;

/** DOM props (data attrs + inline transition timing) for an animated node. */
export function animationProps(config?: AnimationConfig): Record<string, unknown> {
  if (!config || !config.type || config.type === "none") return {};
  return {
    "data-nx-anim": config.type,
    "data-nx-trigger": config.trigger ?? "scroll",
    style: {
      transitionDuration: `${config.duration ?? 600}ms`,
      transitionDelay: `${config.delay ?? 0}ms`,
    },
  };
}

/**
 * Reveals animated nodes. `load` triggers fire next frame; `scroll` triggers
 * fire via IntersectionObserver. Read-only w.r.t. scroll, so it never fights
 * Lenis (AGENTS.md). Rendered once by the public renderer.
 */
export function NexusAnimationRuntime() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-nx-anim]"));
    if (!els.length) return;

    for (const el of els) {
      if (el.getAttribute("data-nx-trigger") === "load") {
        requestAnimationFrame(() => el.setAttribute("data-inview", "true"));
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-inview", "true");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    for (const el of els) {
      if (el.getAttribute("data-nx-trigger") !== "load" && el.getAttribute("data-inview") !== "true") {
        io.observe(el);
      }
    }
    return () => io.disconnect();
  }, []);

  return null;
}
