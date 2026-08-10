"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  tip: string;
  children: ReactNode;
  className?: string;
  /** Position of the tooltip bubble. Default: "top" */
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Lightweight CSS-only Tooltip.
 * Replaces all native `title=` browser tooltips with a styled label.
 * Zero JS — purely :hover-driven via Tailwind group utilities.
 *
 * Usage:
 *   <Tooltip tip="Delete section">
 *     <button>...</button>
 *   </Tooltip>
 */
export function Tooltip({ tip, children, className, side = "top" }: TooltipProps) {
  const bubble =
    "absolute z-[400] pointer-events-none whitespace-nowrap rounded-md bg-navy text-white text-[10px] font-inter font-semibold tracking-wider px-2.5 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150";

  const positions: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrows: Record<string, string> = {
    top: "absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-navy",
    bottom: "absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-navy",
    left: "absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-navy",
    right: "absolute top-1/2 -translate-y-1/2 right-full border-4 border-transparent border-r-navy",
  };

  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span className={cn(bubble, positions[side])}>
        {tip}
        <span className={arrows[side]} />
      </span>
    </span>
  );
}
