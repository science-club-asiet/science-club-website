"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Atom, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_SECTIONS } from "./navConfig";
import { SignOutButton } from "./SignOutButton";
import { cn } from "@/lib/utils";

const WEBSITE_PATHS = [
  "/admin/website", "/admin/site", "/admin/teams", "/admin/pillars", "/admin/goals",
  "/admin/impact_stories", "/admin/story_eras", "/admin/perks", "/admin/faqs", "/admin/achievements",
];

export function AdminSidebar({
  onCreate,
  email,
  role,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: {
  onCreate: () => void;
  email: string;
  role: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/website") return WEBSITE_PATHS.some((p) => pathname.startsWith(p));
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      <div className={cn("px-4 py-5 flex items-center justify-between border-b border-gray-100 lg:border-none", isCollapsed && "lg:px-2 lg:justify-center")}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center shrink-0 shadow-sm">
            <Atom className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-oswald font-bold uppercase text-sm leading-none text-navy">Science Club</p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Admin OS</p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-navy" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className={cn("px-3 pt-3 pb-3", isCollapsed && "lg:px-2")}>
        <button
          type="button"
          onClick={() => {
            onCreate();
            if (onClose) onClose();
          }}
          title="Create New Item"
          className={cn(
            "w-full flex items-center justify-center gap-2 bg-red text-white rounded-xl py-2.5 text-sm font-medium hover:bg-navy transition-all duration-300 shadow-sm cursor-pointer",
            isCollapsed && "lg:px-0 lg:py-2.5"
          )}
        >
          <Plus className="w-4 h-4 shrink-0 text-white" />
          {!isCollapsed && <span>Create</span>}
        </button>
      </div>

      <nav className={cn("flex-1 overflow-y-auto px-3 space-y-3", isCollapsed && "lg:px-2")}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "pt-2 border-t border-gray-100" : ""}>
            {section.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={item.label}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 mb-0.5",
                    isCollapsed && "lg:px-0 lg:justify-center",
                    active
                      ? "bg-navy text-white font-semibold shadow-sm"
                      : "text-navy/70 hover:bg-gray-100 hover:text-navy"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={cn("px-4 py-4 border-t border-gray-100 shrink-0 bg-white", isCollapsed && "lg:px-2 lg:py-3")}>
        {!isCollapsed ? (
          <>
            <p className="text-xs font-medium truncate text-navy">{email}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{role}</span>
              <SignOutButton />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <SignOutButton />
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex shrink-0 border-r border-gray-200 bg-white flex-col h-screen sticky top-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isCollapsed ? "w-[68px]" : "w-[248px]"
        )}
      >
        {navContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-[280px] max-w-[85vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
