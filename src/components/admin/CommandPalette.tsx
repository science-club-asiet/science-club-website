"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, CornerDownLeft, PlayCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { NAV_SECTIONS, CREATE_ITEMS } from "./navConfig";
import { playbookOrganizeWorkshop, playbookNewMemberIntake, playbookPublishResearch } from "@/lib/admin/playbook-actions";
import { searchAdmin } from "@/lib/admin/search-actions";
import { toast } from "@/components/ui/Toast";

type Cmd = {
  id: string;
  label: string;
  group: "Playbooks" | "Create" | "Go to" | "Events" | "Posts" | "Members";
  href?: string;
  action?: () => Promise<string>;
};

const COMMANDS: Cmd[] = [
  { id: "pb-workshop", label: "Organize Workshop", group: "Playbooks", action: playbookOrganizeWorkshop },
  { id: "pb-intake", label: "New Member Intake", group: "Playbooks", action: playbookNewMemberIntake },
  { id: "pb-research", label: "Publish Research", group: "Playbooks", action: playbookPublishResearch },
  ...CREATE_ITEMS.map((c) => ({ id: `create-${c.href}`, label: `New ${c.label}`, group: "Create" as const, href: c.href })),
  ...NAV_SECTIONS.flat().map((n) => ({ id: `go-${n.href}`, label: n.label, group: "Go to" as const, href: n.href })),
];

/** Mounted only while open (parent gates it), so state resets fresh each time. */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [liveResults, setLiveResults] = useState<Cmd[]>([]);
  const [active, setActive] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let activeEffect = true;
    if (!debouncedQuery) {
      queueMicrotask(() => {
        if (activeEffect) setLiveResults([]);
      });
      return () => { activeEffect = false; };
    }
    searchAdmin(debouncedQuery).then((res) => {
      if (activeEffect) {
        setLiveResults(res.map((r) => ({ ...r, group: r.group as Cmd["group"] })));
      }
    });
    return () => { activeEffect = false; };
  }, [debouncedQuery]);

  const results = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const staticRes = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()));
    return [...staticRes, ...liveResults];
  }, [query, liveResults]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const go = async (c?: Cmd) => {
    if (!c) return;
    if (c.action) {
      setIsExecuting(true);
      try {
        const url = await c.action();
        onClose();
        router.push(url);
      } catch (err: unknown) {
        toast("Failed to execute playbook: " + (err as Error).message, "error");
        setIsExecuting(false);
      }
    } else if (c.href) {
      onClose();
      router.push(c.href);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4 bg-navy/30 backdrop-blur-sm" onClick={() => !isExecuting && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 border-b border-gray-100 bg-gray-50/50">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search or jump to…"
            disabled={isExecuting}
            className="flex-1 py-4 text-sm text-navy outline-none bg-transparent placeholder:text-gray-400 font-medium disabled:opacity-50"
          />
          {isExecuting ? (
            <Loader2 className="w-4 h-4 text-navy animate-spin" />
          ) : (
            <kbd className="text-[10px] text-gray-400 font-medium bg-white border border-gray-200 shadow-sm rounded px-1.5 py-0.5">ESC</kbd>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-400">No matches.</p>}
          {results.map((c, i) => {
            const showHeader = i === 0 || results[i - 1].group !== c.group;
            return (
              <div key={c.id}>
                {showHeader && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.group}</p>
                )}
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(c)}
                  disabled={isExecuting}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${i === active ? "bg-navy/5 text-navy font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-navy"} disabled:opacity-50`}
                >
                  {c.group === "Playbooks" ? <PlayCircle className={`w-4 h-4 shrink-0 ${i === active ? "text-red" : "opacity-60"}`} /> :
                   c.group === "Create" ? <Plus className={`w-4 h-4 shrink-0 ${i === active ? "text-red" : "opacity-60"}`} /> : <CornerDownLeft className="w-4 h-4 shrink-0 opacity-40" />}
                  <span className="flex-1">{c.label}</span>
                  {i === active && <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mr-1">Enter</span>}
                  {i === active && <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
