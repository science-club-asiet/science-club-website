import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import * as t from "./tokens";

/** Collapsible inspector section. `show=false` hides it (styleGroups gating). */
export function Section({
  title,
  children,
  defaultOpen = true,
  show = true,
  right,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  show?: boolean;
  right?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!show) return null;
  return (
    <div className="border-b border-[#ECEEF2]">
      <div className="flex items-center pr-1.5">
        <button onClick={() => setOpen((o) => !o)} className={`${t.sectionHeader} flex-1`}>
          <span>{title}</span>
          <ChevronDown size={13} className={`text-[#9CA3AF] transition-transform duration-150 ${open ? "" : "-rotate-90"}`} />
        </button>
        {right && open && <div className="shrink-0">{right}</div>}
      </div>
      {open && <div className={t.sectionBody}>{children}</div>}
    </div>
  );
}

/** Label column + control, aligned across every row. */
export function Row({
  label,
  children,
  align = "center",
}: {
  label?: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className={`flex gap-2 ${align === "center" ? "items-center" : "items-start"}`}>
      {label !== undefined && <span className={`w-[68px] shrink-0 ${t.label} ${align === "start" ? "pt-1.5" : ""}`}>{label}</span>}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5">{children}</div>
    </div>
  );
}

export function IconButton({
  onClick, title, active, children,
}: {
  onClick?: () => void; title?: string; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} title={title} className={`${t.iconBtn} ${active ? "bg-[#EFF4FF] text-[#2563EB]" : ""}`}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value, onChange, options, className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label?: string; icon?: React.ReactNode; title?: string }[];
  className?: string;
}) {
  return (
    <div className={`${t.segWrap} ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title ?? o.label}
          onClick={() => onChange(o.value)}
          className={`${t.segItem} ${value === o.value ? t.segItemOn : ""}`}
        >
          {o.icon ?? o.label}
        </button>
      ))}
    </div>
  );
}

/** Lightweight popover with an outside-click scrim; children get a `close` fn. */
export function Popover({
  trigger, children, align = "right", width = 200,
}: {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}>{trigger}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-50 mt-1.5 ${align === "right" ? "right-0" : "left-0"} bg-white border border-[#E3E6EB] rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.16)] p-3`}
            style={{ width }}
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}
