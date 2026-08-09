import React from "react";
import { useNode } from "@craftjs/core";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { InspectorImage } from "@/components/admin/builder/InspectorImage";
import { ICONS, ICON_NAMES } from "../registry/icons";
import { Row } from "../ui/primitives";
import { TextField, TextArea, NumberField, SelectField, ColorField, Toggle } from "../ui/fields";
import * as t from "../ui/tokens";
import type { FieldSchema } from "../registry/types";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className={`block ${t.label} mb-1`}>{children}</span>
);

function Field({ field, value, setValue }: { field: FieldSchema; value: any; setValue: (v: any) => void }) {
  switch (field.kind) {
    case "text":
    case "link":
      return <Row label={field.label}><TextField className="w-40" value={value ?? ""} placeholder={field.placeholder} onChange={setValue} /></Row>;
    case "textarea":
      return <div><FieldLabel>{field.label}</FieldLabel><TextArea value={value ?? ""} placeholder={field.placeholder} onChange={setValue} /></div>;
    case "number":
      return <Row label={field.label}><NumberField className="w-24" value={value == null ? "" : String(value)} min={field.min} max={field.max} step={field.step} onChange={(v) => setValue(v === "" ? undefined : Number(v))} /></Row>;
    case "color":
      return <Row label={field.label}><ColorField value={value ?? ""} onChange={setValue} /></Row>;
    case "toggle":
      return <Row label={field.label}><Toggle checked={!!value} onChange={setValue} /></Row>;
    case "select":
      return <Row label={field.label}><SelectField className="w-40" value={value ?? ""} onChange={(v) => { const opt = field.options.find((o) => String(o.value) === v); setValue(opt ? opt.value : v); }} options={field.options.map((o) => ({ label: o.label, value: String(o.value) }))} /></Row>;
    case "image":
      return <div><FieldLabel>{field.label}</FieldLabel><InspectorImage value={value ?? ""} onChange={setValue} /></div>;
    case "icon":
      return (
        <div>
          <FieldLabel>{field.label}</FieldLabel>
          <div className="grid grid-cols-8 gap-1 max-h-36 overflow-y-auto p-1.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-md">
            {ICON_NAMES.map((name) => {
              const Ico = ICONS[name];
              const on = value === name;
              return <button key={name} title={name} onClick={() => setValue(name)} className={`flex items-center justify-center aspect-square rounded ${on ? "bg-[#2563EB] text-white" : "text-[#6B7280] hover:bg-white"}`}><Ico size={14} /></button>;
            })}
          </div>
        </div>
      );
    case "linkTarget":
      return <LinkTargetControl label={field.label} />;
    case "visibility":
      return <VisibilityControl label={field.label} />;
    case "array":
      return <ArrayField field={field} value={value ?? []} setValue={setValue} />;
    default:
      return null;
  }
}

function LinkTargetControl({ label }: { label: string }) {
  const { url, target, rel, actions } = useNode((node) => ({
    url: node.data.props.url as string | undefined, target: node.data.props.target as string | undefined, rel: node.data.props.rel as string | undefined,
  }));
  const u = url ?? "";
  const type = u.startsWith("mailto:") ? "email" : u.startsWith("tel:") ? "phone" : u.startsWith("#") ? "section" : u.startsWith("/") ? "page" : "url";
  const raw = type === "email" ? u.replace(/^mailto:/, "") : type === "phone" ? u.replace(/^tel:/, "") : u;
  const setUrl = (v: string) => actions.setProp((p: any) => (p.url = v));
  const onType = (ty: string) => setUrl(ty === "email" ? "mailto:" : ty === "phone" ? "tel:" : ty === "section" ? "#" : ty === "page" ? "/" : "");
  const onValue = (v: string) => setUrl(type === "email" ? `mailto:${v}` : type === "phone" ? `tel:${v}` : v);
  const ph = type === "email" ? "name@example.com" : type === "phone" ? "+1 555 000 0000" : type === "section" ? "#section-id" : type === "page" ? "/about" : "https://…";
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <SelectField value={type} onChange={onType} options={[
        { label: "External URL", value: "url" }, { label: "Page (path)", value: "page" }, { label: "Section anchor", value: "section" }, { label: "Email", value: "email" }, { label: "Phone", value: "phone" }]} />
      <TextField value={raw} placeholder={ph} onChange={onValue} />
      <Row label="New tab"><Toggle checked={target === "_blank"} onChange={(c) => actions.setProp((p: any) => (p.target = c ? "_blank" : "_self"))} /></Row>
      <Row label="Nofollow"><Toggle checked={(rel ?? "").includes("nofollow")} onChange={(c) => actions.setProp((p: any) => (p.rel = c ? "nofollow noopener" : ""))} /></Row>
    </div>
  );
}

function VisibilityControl({ label }: { label: string }) {
  const { hideOn, actions } = useNode((node) => ({ hideOn: (node.data.props.hideOn as Record<string, boolean>) || {} }));
  const bps = [{ id: "desktop", label: "Desktop" }, { id: "tablet", label: "Tablet" }, { id: "mobile", label: "Mobile" }];
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-3 gap-1.5">
        {bps.map((b) => {
          const hidden = !!hideOn[b.id];
          return <button key={b.id} onClick={() => actions.setProp((p: any) => { p.hideOn = { ...(p.hideOn || {}), [b.id]: !hidden }; })}
            className={`h-7 rounded-md border text-[10px] font-medium transition-colors ${hidden ? "bg-red-50 border-red-200 text-red-600" : "bg-[#F6F7F9] border-[#E3E6EB] text-[#6B7280] hover:bg-white"}`}>{b.label}</button>;
        })}
      </div>
      <p className="text-[10px] text-[#9CA3AF] mt-1">Red = hidden on that breakpoint.</p>
    </div>
  );
}

function ArrayField({ field, value, setValue }: { field: Extract<FieldSchema, { kind: "array" }>; value: any[]; setValue: (v: any[]) => void }) {
  const items: any[] = Array.isArray(value) ? value : [];
  const blank = () => { const o: Record<string, any> = {}; for (const f of field.item) o[f.name] = f.kind === "toggle" ? false : ""; return o; };
  const update = (i: number, patch: any) => setValue(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setValue(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= items.length) return; const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; setValue(next); };
  return (
    <div>
      <FieldLabel>{field.label}</FieldLabel>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-[#E3E6EB] rounded-lg p-2 bg-[#FBFCFD]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-[#9CA3AF]">{field.itemLabel ?? "Item"} {i + 1}</span>
              <div className="flex items-center gap-1 text-[#9CA3AF]">
                <button onClick={() => move(i, -1)} className="hover:text-[#374151]"><ChevronUp size={13} /></button>
                <button onClick={() => move(i, 1)} className="hover:text-[#374151]"><ChevronDown size={13} /></button>
                <button onClick={() => remove(i)} className="hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="space-y-2">
              {field.item.map((sub) => <Field key={sub.name} field={sub} value={item?.[sub.name]} setValue={(v) => update(i, { [sub.name]: v })} />)}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setValue([...items, blank()])} className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] font-medium text-[#2563EB] border border-dashed border-[#B9CEFF] rounded-md h-7 hover:bg-[#EFF4FF]">
        <Plus size={13} /> Add {field.itemLabel ?? "item"}
      </button>
    </div>
  );
}

export function SettingsFields({ schema }: { schema: FieldSchema[] }) {
  const { props, actions } = useNode((node) => ({ props: node.data.props }));
  const setValue = (name: string, v: any) => actions.setProp((p: any) => { p[name] = v; });
  return (
    <div className="space-y-3">
      {schema.map((field) => (
        <Field key={field.name} field={field} value={props?.[field.name]} setValue={(v) => setValue(field.name, v)} />
      ))}
    </div>
  );
}
