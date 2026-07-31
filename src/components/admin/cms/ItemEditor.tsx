"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveItem, type CollectionField, type CollectionItem } from "@/lib/admin/cmsActions";
import { InspectorImage } from "@/components/admin/builder/InspectorImage";
import { inputCls, labelCls, btnPrimaryCls, Card } from "@/components/ui/primitives";

export function ItemEditor({
  collectionId,
  collectionSlug,
  fields,
  item,
}: {
  collectionId: string;
  collectionSlug: string;
  fields: CollectionField[];
  item?: CollectionItem | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any>>(item?.data ?? {});
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [published, setPublished] = useState(item?.is_published ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    setSaving(true); setErr("");
    const res = await saveItem({ id: item?.id, collectionId, slug, data, isPublished: published });
    if (res.error) { setErr(res.error); setSaving(false); return; }
    router.push(`/admin/cms/${collectionSlug}`);
    router.refresh();
  };

  const renderField = (f: CollectionField) => {
    const v = data[f.name];
    switch (f.type) {
      case "textarea":
      case "richtext":
        return <textarea rows={f.type === "richtext" ? 6 : 3} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className={inputCls} />;
      case "number":
        return <input type="number" value={v ?? ""} onChange={(e) => set(f.name, e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />;
      case "boolean":
        return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}</label>;
      case "select":
        return (
          <select value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className={inputCls}>
            <option value="">—</option>
            {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case "image":
        return <InspectorImage value={v ?? ""} onChange={(url) => set(f.name, url)} />;
      case "date":
        return <input type="datetime-local" value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className={inputCls} />;
      case "tags":
        return <input value={Array.isArray(v) ? v.join(", ") : (v ?? "")} onChange={(e) => set(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="comma, separated" className={inputCls} />;
      case "json":
        return <textarea rows={4} value={typeof v === "string" ? v : JSON.stringify(v ?? "", null, 2)} onChange={(e) => { try { set(f.name, JSON.parse(e.target.value)); } catch { set(f.name, e.target.value); } }} className={`${inputCls} font-mono text-xs`} />;
      default:
        return <input value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className={inputCls} />;
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <Card className="p-5 space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            {f.type !== "boolean" && <label className={`${labelCls} block mb-1`}>{f.label}{f.required ? " *" : ""}</label>}
            {renderField(f)}
          </div>
        ))}
      </Card>

      <Card className="p-5 space-y-4">
        <div>
          <label className={`${labelCls} block mb-1`}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title" className={`${inputCls} font-mono text-xs`} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
        </label>
      </Card>

      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-3">
        <button onClick={submit} disabled={saving} className={btnPrimaryCls}>{saving ? "Saving…" : "Save entry"}</button>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
      </div>
    </div>
  );
}
