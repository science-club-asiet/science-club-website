import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── Shared class tokens (Linear/Notion-style: crisp, subtle, token-based) ────
export const inputCls =
  "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all duration-200 hover:border-gray-300 shadow-sm";
export const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-gray-500";
export const cardCls = "rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]";
export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 bg-red text-white rounded-full px-5 py-2.5 text-xs font-oswald uppercase tracking-widest font-bold hover:bg-navy transition-colors disabled:opacity-60 shadow-sm";
export const btnGhostCls =
  "inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-navy rounded-full px-5 py-2.5 text-xs font-oswald uppercase tracking-widest font-bold hover:border-red hover:text-red transition-colors";
export const rowLinkCls = "text-xs font-semibold uppercase tracking-widest text-navy/55 hover:text-red transition-colors";

export function badgeCls(on?: boolean) {
  return cn(
    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border",
    on ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
  );
}

// ── Components ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-oswald text-3xl font-bold uppercase tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {help && <span className="text-xs text-gray-400 mt-1 block">{help}</span>}
    </label>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(cardCls, className)}>{children}</div>;
}
