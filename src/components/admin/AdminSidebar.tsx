"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Atom } from "lucide-react";
import { NAV_SECTIONS } from "./navConfig";
import { SignOutButton } from "./SignOutButton";
import { cn } from "@/lib/utils";

// Content resources that live under the Website workspace (keeps it highlighted).
const WEBSITE_PATHS = [
  "/admin/website", "/admin/site", "/admin/teams", "/admin/pillars", "/admin/goals",
  "/admin/impact_stories", "/admin/story_eras", "/admin/perks", "/admin/faqs", "/admin/achievements",
];

export function AdminSidebar({ onCreate, email, role }: { onCreate: () => void; email: string; role: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/website") return WEBSITE_PATHS.some((p) => pathname.startsWith(p));
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[248px] shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center">
          <Atom className="w-5 h-5" />
        </div>
        <div>
          <p className="font-oswald font-bold uppercase text-sm leading-none">Science Club</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Admin OS</p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-between gap-2 bg-red text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-navy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] hover:shadow-md"
        >
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create</span>
          <kbd className="text-[10px] bg-white/20 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "pt-2 mt-2 border-t border-gray-100" : ""}>
            {section.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] mb-0.5",
                    active ? "bg-navy text-white font-medium shadow-sm" : "text-navy/70 hover:bg-gray-100 hover:text-navy"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" /> {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs font-medium truncate">{email}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{role}</span>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
