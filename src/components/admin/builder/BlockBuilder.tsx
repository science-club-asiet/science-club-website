"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, ChevronLeft, Check, Loader2, Eye, Copy, Undo2, Redo2, Monitor, Tablet, Smartphone } from "lucide-react";
import { BLOCK_REGISTRY, BLOCK_TYPES } from "@/lib/blocks/registry";
import { InspectorImage } from "./InspectorImage";
import { saveBlocksAction } from "@/lib/admin/blockActions";
import type { Block, InspectorField } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

let counter = 0;
const uid = () => `b_${Date.now().toString(36)}_${counter++}`;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const list = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);
const inp = "w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy transition-all duration-200 hover:border-gray-300 shadow-sm";

function toLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── Canvas block (live preview + selection frame) ───────────────────────────
function CanvasBlock({ block, selected, onSelect, onDelete, onDuplicate }: {
  block: Block; selected: boolean; onSelect: (id: string) => void; onDelete: (id: string) => void; onDuplicate: (id: string) => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_REGISTRY[block.type];
  if (!def) return null;
  const C = def.Component;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onSelect(block.id)}
      className={cn("relative group rounded-xl transition-all duration-200", selected ? "ring-2 ring-red shadow-sm" : "ring-1 ring-transparent hover:ring-gray-200")}
    >
      <div className={cn("absolute -top-3 right-3 z-10 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm px-1.5 py-0.5", selected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        <button {...attributes} {...listeners} className="p-1 text-gray-400 cursor-grab active:cursor-grabbing touch-none" aria-label="Drag"><GripVertical className="w-3.5 h-3.5" /></button>
        <span className="text-[10px] uppercase font-bold text-gray-400 px-1">{def.label}</span>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }} className="p-1 text-gray-400 hover:text-navy" aria-label="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} className="p-1 text-gray-400 hover:text-red" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="pointer-events-none">
        <C props={block.props} />
      </div>
    </div>
  );
}

// ── Inspector field editors ─────────────────────────────────────────────────
function ListEditor({ field, value, onChange }: {
  field: Extract<InspectorField, { type: "list" }>; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void;
}) {
  const setItem = (i: number, patch: Record<string, unknown>) => onChange(value.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {value.map((it, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">{field.itemLabel} {i + 1}</span>
            <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red"><Trash2 className="w-3 h-3" /></button>
          </div>
          {field.itemFields.map((f) => (
            <div key={f.key}>
              <label className="text-[10px] text-gray-400 block mb-0.5">{f.label}</label>
              {f.type === "image" ? (
                <InspectorImage value={str(it[f.key])} onChange={(v) => setItem(i, { [f.key]: v })} />
              ) : f.type === "textarea" ? (
                <textarea value={str(it[f.key])} onChange={(e) => setItem(i, { [f.key]: e.target.value })} rows={2} className={inp} />
              ) : (
                <input value={str(it[f.key])} onChange={(e) => setItem(i, { [f.key]: e.target.value })} className={inp} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => onChange([...value, { ...field.defaultItem }])} className="w-full text-xs border border-dashed border-gray-300 rounded-lg py-1.5 hover:border-red text-gray-500">
        <Plus className="w-3 h-3 inline -mt-0.5" /> Add {field.itemLabel}
      </button>
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: InspectorField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "textarea": return <textarea value={str(value)} onChange={(e) => onChange(e.target.value)} rows={4} className={inp} />;
    case "boolean": return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy/20 transition-all cursor-pointer" />;
    case "date": return <input type="datetime-local" value={toLocal(str(value))} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} className={inp} />;
    case "image": return <InspectorImage value={str(value)} onChange={onChange} />;
    case "list": return <ListEditor field={field} value={list(value)} onChange={onChange} />;
    default: return <input value={str(value)} onChange={(e) => onChange(e.target.value)} className={inp} />;
  }
}

// ── Builder ─────────────────────────────────────────────────────────────────
export function BlockBuilder({ kind, id, title, initialBlocks, previewHref, backHref }: {
  kind: string; id: string; title: string; initialBlocks: Block[]; previewHref?: string; backHref: string;
}) {
  const [history, setHistory] = useState<Block[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const blocks = history[historyIndex] ?? [];
  const [selected, setSelected] = useState<string | null>(initialBlocks[0]?.id ?? null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const persist = useCallback((next: Block[]) => {
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveBlocksAction(kind, id, next);
      setState(res.error ? "idle" : "saved");
      if (res.error) {
        toast(`Save failed: ${res.error}`, "error");
      } else {
        toast("Blocks saved", "success");
        setTimeout(() => setState("idle"), 1500);
      }
    }, 600);
  }, [kind, id]);

  const update = (next: Block[]) => { 
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    persist(next);
  };
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      persist(history[historyIndex - 1]);
    }
  }, [historyIndex, history, persist]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      persist(history[historyIndex + 1]);
    }
  }, [historyIndex, history, persist]);

  // Hook up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const addBlock = (type: string) => {
    const b: Block = { id: uid(), type, props: structuredClone(BLOCK_REGISTRY[type].defaultProps) };
    update([...blocks, b]);
    setSelected(b.id);
  };
  const duplicateBlock = (bid: string) => {
    const idx = blocks.findIndex((b) => b.id === bid);
    if (idx === -1) return;
    const b = blocks[idx];
    const clone: Block = { id: uid(), type: b.type, props: structuredClone(b.props) };
    const next = [...blocks];
    next.splice(idx + 1, 0, clone);
    update(next);
    setSelected(clone.id);
  };
  const deleteBlock = (bid: string) => {
    const next = blocks.filter((b) => b.id !== bid);
    update(next);
    if (selected === bid) setSelected(next[0]?.id ?? null);
  };
  const patchProps = (bid: string, patch: Record<string, unknown>) =>
    update(blocks.map((b) => (b.id === bid ? { ...b, props: { ...b.props, ...patch } } : b)));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    update(arrayMove(blocks, blocks.findIndex((b) => b.id === active.id), blocks.findIndex((b) => b.id === over.id)));
  };

  const sel = blocks.find((b) => b.id === selected) ?? null;
  const selDef = sel ? BLOCK_REGISTRY[sel.type] : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAF9] text-navy font-inter flex flex-col">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center gap-4 px-4 shadow-sm relative z-10">
        <Link href={backHref} className="flex items-center gap-1 text-sm text-navy/60 hover:text-red transition-colors">
          <ChevronLeft className="w-4 h-4" /> Done
        </Link>
        <span className="font-oswald font-bold uppercase text-sm truncate">{title}</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          {state === "saving" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : state === "saved" ? <><Check className="w-3.5 h-3.5 text-green-600" /> Saved</> : "Autosaves"}
        </span>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg ml-auto mr-4">
          <button onClick={() => setPreviewMode("desktop")} className={cn("p-1.5 rounded-md text-gray-500 hover:text-navy", previewMode === "desktop" && "bg-white text-navy shadow-sm")} title="Desktop"><Monitor className="w-4 h-4" /></button>
          <button onClick={() => setPreviewMode("tablet")} className={cn("p-1.5 rounded-md text-gray-500 hover:text-navy", previewMode === "tablet" && "bg-white text-navy shadow-sm")} title="Tablet"><Tablet className="w-4 h-4" /></button>
          <button onClick={() => setPreviewMode("mobile")} className={cn("p-1.5 rounded-md text-gray-500 hover:text-navy", previewMode === "mobile" && "bg-white text-navy shadow-sm")} title="Mobile"><Smartphone className="w-4 h-4" /></button>
        </div>
        
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4 mr-4">
          <button onClick={undo} disabled={historyIndex === 0} className="p-1.5 text-gray-500 hover:text-navy disabled:opacity-30 disabled:hover:text-gray-500" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-1.5 text-gray-500 hover:text-navy disabled:opacity-30 disabled:hover:text-gray-500" title="Redo (Ctrl+Shift+Z)"><Redo2 className="w-4 h-4" /></button>
        </div>

        {previewHref && (
          <a href={previewHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red hover:text-red">
            <Eye className="w-4 h-4" /> Preview
          </a>
        )}
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Block library */}
        <aside className="w-52 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Blocks</p>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_TYPES.map((t) => {
              const def = BLOCK_REGISTRY[t];
              const Icon = def.icon;
              return (
                <button key={t} onClick={() => addBlock(t)} className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 p-2.5 hover:border-red hover:text-red transition-colors text-[11px] font-medium">
                  <Icon className="w-4 h-4" /> {def.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 min-w-0 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className={cn("mx-auto p-8 space-y-4 transition-all duration-300", previewMode === "desktop" ? "max-w-3xl" : previewMode === "tablet" ? "max-w-md" : "max-w-sm")} onClick={(e) => e.stopPropagation()}>
            {blocks.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center text-gray-400">
                Add blocks from the left to start building this page.
              </div>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((b) => (
                  <CanvasBlock key={b.id} block={b} selected={selected === b.id} onSelect={setSelected} onDelete={deleteBlock} onDuplicate={duplicateBlock} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </main>

        {/* Inspector */}
        <aside className="w-80 shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4">
          {!sel || !selDef ? (
            <p className="text-sm text-gray-400 text-center mt-10">Select a block to edit it.</p>
          ) : (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{selDef.label} block</p>
              <div className="space-y-4">
                {selDef.fields.map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-1.5">{f.label}</label>
                    <FieldEditor field={f} value={sel.props[f.key]} onChange={(v) => patchProps(sel.id, { [f.key]: v })} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
