"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { saveResourceAction, type SaveState } from "@/lib/admin/actions";
import { saveTemplateAction } from "@/lib/admin/template-actions";
import type { Resource, Field } from "@/lib/admin/resources";
import { ImageUploader } from "@/components/admin/ImageUploader";

function toDatetimeLocal(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const base =
  "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy transition-all duration-200 hover:border-gray-300 shadow-sm";

function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const common = { id: field.name, name: field.name };
  switch (field.type) {
    case "textarea":
    case "richtext":
      return <textarea {...common} rows={field.type === "richtext" ? 8 : 3} defaultValue={(value as string) ?? ""} className={base} />;
    case "number":
      return <input {...common} type="number" step="any" defaultValue={value == null ? "" : String(value)} className={base} />;
    case "boolean":
      return <input {...common} type="checkbox" defaultChecked={Boolean(value)} className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy/20 transition-all cursor-pointer" />;
    case "select":
      return (
        <select {...common} defaultValue={(value as string) ?? field.options?.[0] ?? ""} className={base}>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "date":
      return <input {...common} type="datetime-local" defaultValue={toDatetimeLocal(value)} className={base} />;
    case "tags":
      return <textarea {...common} rows={3} defaultValue={Array.isArray(value) ? value.join("\n") : ""} className={base} />;
    case "json":
      return <textarea {...common} rows={6} defaultValue={value ? JSON.stringify(value, null, 2) : ""} className={`${base} font-mono text-xs`} />;
    case "image":
      return <ImageUploader name={field.name} initial={(value as string) ?? ""} />;
    default:
      return <input {...common} type="text" defaultValue={(value as string) ?? ""} className={base} />;
  }
}

export function ResourceForm({
  resource,
  id,
  initial,
}: {
  resource: Resource;
  id: string | null;
  initial: Record<string, unknown>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = saveResourceAction.bind(null, resource.key, id);
  const [state, formAction, pending] = useActionState<SaveState, FormData>(boundAction, null);
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templatePending, startTemplateTransition] = useTransition();

  const handleSaveTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    const metaFd = new FormData(e.currentTarget);
    const formFd = new FormData(formRef.current);
    
    // Build payload from the resource form
    const payload: Record<string, unknown> = {};
    for (const f of resource.fields) {
      if (f.type === "boolean") payload[f.name] = formFd.get(f.name) === "on";
      else if (f.type === "json") {
        try { payload[f.name] = JSON.parse((formFd.get(f.name) as string) || "null"); } catch { payload[f.name] = null; }
      }
      else payload[f.name] = formFd.get(f.name);
    }
    
    startTemplateTransition(async () => {
      try {
        await saveTemplateAction(
          resource.key, // kind matches resource.key for simplicity
          metaFd.get("name") as string,
          metaFd.get("description") as string,
          payload
        );
        setShowTemplateModal(false);
        alert("Template saved!");
      } catch (err: unknown) {
        alert("Failed to save template: " + (err as Error).message);
      }
    });
  };

  return (
    <>
    <form ref={formRef} action={formAction} className="max-w-2xl space-y-5">
      {resource.fields.map((f) => (
        <div key={f.name} className={f.type === "boolean" ? "flex items-center gap-3" : "flex flex-col gap-1.5"}>
          <label htmlFor={f.name} className="text-xs font-semibold uppercase tracking-widest text-gray-500 order-first">
            {f.label}
          </label>
          <FieldInput field={f} value={initial?.[f.name]} />
          {f.help && <span className="text-xs text-gray-400">{f.help}</span>}
        </div>
      ))}

      {state?.error && <p className="text-red text-sm">{state.error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-navy text-white px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-navy/90 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setShowTemplateModal(true)}
          className="bg-white border border-gray-200 text-navy px-4 py-2.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-gray-50 transition-all duration-300"
        >
          Save as Template
        </button>
        <Link href={`/admin/${resource.key}`} className="text-sm text-gray-500 hover:text-navy">
          Cancel
        </Link>
      </div>
    </form>

    {showTemplateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setShowTemplateModal(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-oswald uppercase font-bold text-lg text-navy">Save as Template</h3>
            <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-red">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Template Name</label>
              <input name="name" required className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:border-red" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Description</label>
              <textarea name="description" rows={2} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:border-red" />
            </div>
            <div className="pt-2">
              <button disabled={templatePending} type="submit" className="w-full bg-navy text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red transition-colors disabled:opacity-50">
                {templatePending ? "Saving..." : "Save Template"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
