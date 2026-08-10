"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";
import { DialogProvider } from "@/components/ui/ModalDialog";
import AdminPanelLoading from "@/app/admin/(panel)/loading";
import { useAdminStore } from "@/lib/admin/adminStore";

export function AdminShell({
  children,
  email,
  role,
  term,
  availableTerms,
  activeTerm,
}: {
  children: React.ReactNode;
  email: string;
  role: string;
  term: string;
  availableTerms: string[];
  activeTerm: string;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const setSession = useAdminStore((s) => s.setSession);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sc_admin_sidebar_collapsed");
      if (saved === "true") setSidebarCollapsed(true);
    } catch {}
  }, []);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sc_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    setSession({ email, role, term, availableTerms, activeTerm });
  }, [email, role, term, availableTerms, activeTerm, setSession]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    <div className="min-h-screen bg-[#FAFAF9] text-navy font-inter flex flex-col lg:flex-row">
      <AdminSidebar
        onCreate={() => {
          setMobileMenuOpen(false);
          setPaletteOpen(true);
        }}
        email={email}
        role={role}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        <AdminTopbar
          term={term}
          availableTerms={availableTerms}
          activeTerm={activeTerm}
          onSearch={() => setPaletteOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        />
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8">
          <Suspense fallback={<AdminPanelLoading />}>{children}</Suspense>
        </main>
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <ToastProvider />
      <DialogProvider />
    </div>
  );
}
