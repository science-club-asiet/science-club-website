"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveResourceAction, type SaveState } from "@/lib/admin/actions";
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
  "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:border-red transition-colors";

function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const common = { id: field.name, name: field.name };
  switch (field.type) {
    case "textarea":
    case "richtext":
      return <textarea {...common} rows={field.type === "richtext" ? 8 : 3} defaultValue={(value as string) ?? ""} className={base} />;
    case "number":
      return <input {...common} type="number" step="any" defaultValue={value == null ? "" : String(value)} className={base} />;
    case "boolean":
      return <input {...common} type="checkbox" defaultChecked={Boolean(value)} className="h-5 w-5 accent-red" />;
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
  const boundAction = saveResourceAction.bind(null, resource.key, id);
  const [state, formAction, pending] = useActionState<SaveState, FormData>(boundAction, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
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
          className="bg-navy text-white px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-red transition-colors disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <Link href={`/admin/${resource.key}`} className="text-sm text-gray-500 hover:text-navy">
          Cancel
        </Link>
      </div>
    </form>
  );
}
