"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { createCollection, saveCollectionFields, type CollectionField } from "@/lib/admin/cmsActions";
import type { FieldType } from "@/lib/admin/resources";
import { inputCls, labelCls, btnPrimaryCls, Card } from "@/components/ui/primitives";

const TYPES: FieldType[] = ["text", "textarea", "richtext", "number", "boolean", "select", "image", "date", "tags", "json"];

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export function CollectionEditor({
  mode,
  collectionId,
  collectionSlug,
  initialName = "",
  initialFields,
}: {
  mode: "create" | "edit";
  collectionId?: string;
  collectionSlug?: string;
  initialName?: string;
  initialFields?: CollectionField[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [fields, setFields] = useState<CollectionField[]>(
    initialFields?.length
      ? initialFields
      : [{ label: "Title", name: "title", type: "text", required: true, options: null, sort_order: 0 }]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const update = (i: number, patch: Partial<CollectionField>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addField = () =>
    setFields((f) => [...f, { label: "", name: "", type: "text", required: false, options: null, sort_order: f.length }]);
  const remove = (i: number) => setFields((f) => f.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setFields((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.length) return f;
      const next = [...f];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const submit = async () => {
    setErr("");
    if (!name.trim()) return setErr("Collection name is required.");
    if (!fields.length) return setErr("Add at least one field.");
    setSaving(true);
    const clean = fields.map((f) => ({ ...f, name: slugify(f.name || f.label), label: f.label || f.name }));
    if (mode === "create") {
      const res = await createCollection({ name, fields: clean });
      if (res.error) { setErr(res.error); setSaving(false); return; }
      router.push(`/admin/cms/${res.slug}`);
    } else {
      const res = await saveCollectionFields(collectionId!, clean);
      if (res.error) { setErr(res.error); setSaving(false); return; }
      router.push(`/admin/cms/${collectionSlug}`);
    }
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {mode === "create" && (
        <Card className="p-4">
          <label className={labelCls}>Collection name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jobs" className={`${inputCls} mt-1`} autoFocus />
          {name && <p className="text-xs text-gray-400 mt-1">Slug: <code className="font-mono">{slugify(name)}</code></p>}
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={labelCls}>Fields</span>
          <button onClick={addField} className="text-xs font-semibold text-red flex items-center gap-1 hover:underline">
            <Plus size={14} /> Add field
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50/60">
              <input value={f.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className={`${inputCls} flex-1 min-w-[120px]`} />
              <input value={f.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="key" className={`${inputCls} w-28 font-mono text-xs`} />
              <select value={f.type} onChange={(e) => update(i, { type: e.target.value as FieldType })} className={`${inputCls} w-32`}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {f.type === "select" && (
                <input
                  value={(f.options ?? []).join(", ")}
                  onChange={(e) => update(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="option1, option2" className={`${inputCls} w-40`}
                />
              )}
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input type="checkbox" checked={f.required} onChange={(e) => update(i, { required: e.target.checked })} /> req
              </label>
              <div className="flex items-center gap-1 text-gray-400">
                <button onClick={() => move(i, -1)} className="hover:text-gray-700"><ChevronUp size={14} /></button>
                <button onClick={() => move(i, 1)} className="hover:text-gray-700"><ChevronDown size={14} /></button>
                <button onClick={() => remove(i)} className="hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-3">
        <button onClick={submit} disabled={saving} className={btnPrimaryCls}>
          {saving ? "Saving…" : mode === "create" ? "Create collection" : "Save fields"}
        </button>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
      </div>
    </div>
  );
}
