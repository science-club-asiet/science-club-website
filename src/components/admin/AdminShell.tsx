"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";

export function AdminShell({
  children, email, role, term, availableTerms, activeTerm,
}: {
  children: React.ReactNode;
  email: string;
  role: string;
  term: string;
  availableTerms: string[];
  activeTerm: string;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-navy font-inter flex">
      <AdminSidebar onCreate={() => setPaletteOpen(true)} email={email} role={role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar term={term} availableTerms={availableTerms} activeTerm={activeTerm} onSearch={() => setPaletteOpen(true)} />
        <main className="flex-1 min-w-0 p-6 lg:p-10">{children}</main>
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <ToastProvider />
    </div>
  );
}
