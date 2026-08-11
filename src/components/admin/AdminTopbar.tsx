"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ChevronDown, Check, Loader2, Globe, Menu, ArrowLeft } from "lucide-react";
import { setAdminTermCookie, setSiteCurrentTerm } from "@/lib/admin/session-actions";
import { toast } from "@/components/ui/Toast";

export function AdminTopbar({
  term,
  availableTerms,
  activeTerm,
  onSearch,
  onToggleMobileMenu,
}: {
  term: string;
  availableTerms: string[];
  activeTerm: string;
  onSearch: () => void;
  onToggleMobileMenu?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSwitch = async (t: string) => {
    setOpen(false);
    setLoading(true);
    try {
      await setAdminTermCookie(t);
      router.refresh();
    } catch {
      toast("Failed to switch session", "error");
    }
    setLoading(false);
  };

  const onSetDefault = async () => {
    setOpen(false);
    setLoading(true);
    try {
      await setSiteCurrentTerm(term);
      toast("Set as active term", "success");
      router.refresh();
    } catch {
      toast("Failed to update site active term", "error");
    }
    setLoading(false);
  };

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur flex items-center justify-between gap-2 px-3 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-navy/70 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Open Admin Navigation Menu"
            aria-label="Open Admin Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <span className="font-oswald font-bold uppercase text-xs sm:text-sm text-navy truncate">
          Science Club
        </span>

        {/* Term Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-[11px] sm:text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-2.5 sm:px-3 py-1 font-medium text-navy/70 transition-colors shrink-0 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Session</span> {term}{" "}
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              <p className="px-3 pb-1 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Available terms
              </p>
              {availableTerms.map((t) => (
                <button
                  key={t}
                  onClick={() => onSwitch(t)}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm text-navy hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  {t === term ? (
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 shrink-0" />
                  )}
                  <span className="flex-1">{t}</span>
                  {t === activeTerm && (
                    <span className="text-[9px] bg-red/10 text-red px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                      Active
                    </span>
                  )}
                </button>
              ))}
              {term !== activeTerm && (
                <>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={onSetDefault}
                    className="w-full text-left px-3 py-2 text-xs text-navy hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-gray-400" />
                    Set &apos;{term}&apos; as active term
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Shortcuts back to Main Website & Member Portal */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-oswald font-bold uppercase text-navy hover:text-red bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0"
          title="Return to Main Website"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-red" />
          <span className="hidden sm:inline">Main Site</span>
        </Link>

        <Link
          href="/account"
          className="hidden md:flex items-center gap-1.5 text-xs font-oswald font-bold uppercase text-navy hover:text-red bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0"
          title="Go to Member Portal Dashboard"
        >
          <span>Member Portal</span>
        </Link>
      </div>

      {/* Right Side: Command Search & Notifications */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearch}
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1.5 hover:bg-gray-100 hover:border-gray-300 hover:text-navy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-sm max-w-[140px] sm:max-w-[240px] cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="flex-1 text-left truncate text-[11px] sm:text-xs">
            Search...
          </span>
        </button>

        <button
          className="text-gray-400 hover:text-navy transition-all p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
