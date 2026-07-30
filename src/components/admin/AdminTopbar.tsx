"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, Check, Loader2, Globe } from "lucide-react";
import { setAdminTermCookie, setSiteCurrentTerm } from "@/lib/admin/session-actions";
import { toast } from "@/components/ui/Toast";

export function AdminTopbar({ 
  term, availableTerms, activeTerm, onSearch 
}: { 
  term: string; availableTerms: string[]; activeTerm: string; onSearch: () => void 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSwitch = async (t: string) => {
    setOpen(false);
    setLoading(true);
    try {
      await setAdminTermCookie(t);
    } catch (e: unknown) {
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
    } catch (e: unknown) {
      toast("Failed to update site active term", "error");
    }
    setLoading(false);
  };

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur flex items-center gap-3 px-6 sticky top-0 z-20">
      <span className="font-oswald font-bold uppercase text-sm">Science Club</span>
      
      <div className="relative">
        <button 
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 font-medium text-navy/70 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Session {term} <ChevronDown className="w-3 h-3" /></>}
        </button>
        
        {open && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            <p className="px-3 pb-1 text-[10px] uppercase tracking-widest font-bold text-gray-400">Available terms</p>
            {availableTerms.map(t => (
              <button
                key={t}
                onClick={() => onSwitch(t)}
                className="w-full text-left px-3 py-2 text-sm text-navy hover:bg-gray-50 flex items-center gap-2"
              >
                {t === term ? <Check className="w-4 h-4 text-green-600 shrink-0" /> : <div className="w-4 h-4 shrink-0" />}
                <span className="flex-1">{t}</span>
                {t === activeTerm && <span className="text-[10px] bg-red/10 text-red px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">Active</span>}
              </button>
            ))}
            {term !== activeTerm && (
              <>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={onSetDefault}
                  className="w-full text-left px-3 py-2 text-xs text-navy hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  Set &apos;{term}&apos; as active term
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onSearch}
        className="ml-auto flex items-center gap-2 text-sm text-gray-500 bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 hover:border-gray-300 hover:text-navy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-sm w-64 max-w-[40vw]"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="text-[10px] border border-gray-200 bg-white rounded px-1.5 py-0.5 shadow-sm text-gray-400 font-medium">⌘K</kbd>
      </button>

      <button className="text-gray-400 hover:text-navy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px]" aria-label="Notifications">
        <Bell className="w-5 h-5" />
      </button>
      
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </header>
  );
}
