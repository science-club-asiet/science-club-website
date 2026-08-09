import { useRef } from "react";

/**
 * Figma/Webflow-style scrubbable numeric input: press and drag horizontally on
 * the field to change its value; a plain click still focuses it for typing.
 * Shift = ×10, Alt = ×0.1. Returns props to spread onto the input.
 *
 * `value` is the current number; `onChange` receives the new number. Formatting
 * (units, etc.) is the caller's job.
 */
export function useScrub({
  value,
  onChange,
  step = 1,
  min,
  max,
  precision = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  precision?: number;
}) {
  const s = useRef({ startX: 0, startVal: 0, scrubbing: false, pointerId: -1 });

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    s.current = { startX: e.clientX, startVal: Number.isFinite(value) ? value : 0, scrubbing: false, pointerId: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (s.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.current.startX;
    if (!s.current.scrubbing) {
      if (Math.abs(dx) < 3) return; // below threshold → treat as a click
      s.current.scrubbing = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      (document.activeElement as HTMLElement | null)?.blur?.();
      document.body.style.userSelect = "none";
    }
    const mult = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    let v = s.current.startVal + dx * step * mult;
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    v = precision > 0 ? parseFloat(v.toFixed(precision)) : Math.round(v);
    onChange(v);
    e.preventDefault();
  };

  const end = (e: React.PointerEvent<HTMLElement>) => {
    if (s.current.pointerId !== e.pointerId) return;
    if (s.current.scrubbing) {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      document.body.style.userSelect = "";
    }
    s.current.scrubbing = false;
    s.current.pointerId = -1;
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: end,
    onPointerCancel: end,
    style: { cursor: "ew-resize" as const, touchAction: "none" as const },
  };
}
