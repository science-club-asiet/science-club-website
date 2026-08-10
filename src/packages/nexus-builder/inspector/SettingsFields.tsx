import React from "react";
import { useNode } from "@craftjs/core";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { InspectorImage } from "@/components/admin/builder/InspectorImage";
import { ICONS, ICON_NAMES } from "../registry/icons";
import type { FieldSchema } from "../registry/types";

const labelCls = "block text-[10px] text-gray-400 uppercase font-semibold mb-1 tracking-wider";
const inputCls =
  "w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500";

/** One control, bound to `props[field.name]` on the current node. */
function Field({
  field,
  value,
  setValue,
}: {
  field: FieldSchema;
  value: unknown;
  setValue: (v: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
    case "link":
      return (
        <label className="block">
          <span className={labelCls}>{field.label}</span>
          <input
            type="text"
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setValue(e.target.value)}
            className={inputCls}
          />
        </label>
      );
    case "textarea":
      return (
        <label className="block">
          <span className={labelCls}>{field.label}</span>
          <textarea
            rows={3}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setValue(e.target.value)}
            className={`${inputCls} resize-y`}
          />
        </label>
      );
    case "number":
      return (
        <label className="block">
          <span className={labelCls}>
            {field.label}
            {field.unit ? ` (${field.unit})` : ""}
          </span>
          <input
            type="number"
            value={(value as number | string) ?? ""}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
            className={inputCls}
          />
        </label>
      );
    case "toggle":
      return (
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs text-gray-700 font-medium">{field.label}</span>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setValue(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
          />
        </label>
      );
    case "select":
      return (
        <label className="block">
          <span className={labelCls}>{field.label}</span>
          <select
            value={(value as string | number) ?? ""}
            onChange={(e) => {
              const opt = field.options.find((o) => String(o.value) === e.target.value);
              setValue(opt ? opt.value : e.target.value);
            }}
            className={`${inputCls} cursor-pointer`}
          >
            {field.options.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      );
    case "color":
      return (
        <label className="flex items-center justify-between py-1">
          <span className="text-gray-500 text-xs">{field.label}</span>
          <input
            type="color"
            value={typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) => setValue(e.target.value)}
            className="w-6 h-6 p-0 border-0 cursor-pointer"
          />
        </label>
      );
    case "image":
      return (
        <div>
          <span className={labelCls}>{field.label}</span>
          <InspectorImage
            value={(value as string) ?? ""}
            onChange={(url) => setValue(url)}
          />
        </div>
      );
    case "icon":
      return (
        <div>
          <span className={labelCls}>{field.label}</span>
          <div className="space-y-2">
            <select
              value={(value as string) ?? "Sparkles"}
              onChange={(e) => setValue(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {/* Quick picker for the top 12 most-used icons */}
            <div className="grid grid-cols-6 gap-1 bg-gray-50 p-1.5 rounded border border-gray-200">
              {ICON_NAMES.slice(0, 12).map((name) => {
                const IconComp = ICONS[name];
                const active = value === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setValue(name)}
                    title={name}
                    className={`flex items-center justify-center p-1.5 rounded transition-colors ${
                      active ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <IconComp size={14} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    case "linkTarget":
      return <LinkTargetControl label={field.label} />;
    case "visibility":
      return <VisibilityControl label={field.label} />;
    case "array":
      return (
        <ArrayField
          field={field}
          value={(value as unknown[]) ?? []}
          setValue={setValue}
        />
      );
    default:
      return null;
  }
}

/** Webflow-style link picker: type + value + open-in-new + nofollow. Manages the
 * node's `url` / `target` / `rel` props together. */
function LinkTargetControl({ label }: { label: string }) {
  const { url, target, rel, actions } = useNode((node) => ({
    url: node.data.props.url as string | undefined,
    target: node.data.props.target as string | undefined,
    rel: node.data.props.rel as string | undefined,
  }));
  const u = url ?? "";
  const type = u.startsWith("mailto:") ? "email" : u.startsWith("tel:") ? "phone" : u.startsWith("#") ? "section" : u.startsWith("/") ? "page" : "url";
  const raw = type === "email" ? u.replace(/^mailto:/, "") : type === "phone" ? u.replace(/^tel:/, "") : u;

  const setUrl = (v: string) => actions.setProp((p: Record<string, unknown>) => (p.url = v));
  const onType = (t: string) =>
    setUrl(t === "email" ? "mailto:" : t === "phone" ? "tel:" : t === "section" ? "#" : t === "page" ? "/" : "");
  const onValue = (v: string) => setUrl(type === "email" ? `mailto:${v}` : type === "phone" ? `tel:${v}` : v);

  const placeholder =
    type === "email" ? "name@example.com" : type === "phone" ? "+1 555 000 0000" :
    type === "section" ? "#section-id" : type === "page" ? "/about" : "https://…";

  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="space-y-2">
        <select value={type} onChange={(e) => onType(e.target.value)} className={inputCls}>
          <option value="url">External URL</option>
          <option value="page">Page (path)</option>
          <option value="section">Section anchor</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>
        <input type="text" value={raw} placeholder={placeholder} onChange={(e) => onValue(e.target.value)} className={inputCls} />
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-500 text-xs">Open in new tab</span>
          <input type="checkbox" checked={target === "_blank"} onChange={(e) => actions.setProp((p: Record<string, unknown>) => (p.target = e.target.checked ? "_blank" : "_self"))} className="w-4 h-4 accent-blue-600" />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-500 text-xs">Nofollow</span>
          <input type="checkbox" checked={(rel ?? "").includes("nofollow")} onChange={(e) => actions.setProp((p: Record<string, unknown>) => (p.rel = e.target.checked ? "nofollow noopener" : ""))} className="w-4 h-4 accent-blue-600" />
        </label>
      </div>
    </div>
  );
}

/** Per-breakpoint hide toggles → `props.hideOn`. */
function VisibilityControl({ label }: { label: string }) {
  const { hideOn, actions } = useNode((node) => ({ hideOn: (node.data.props.hideOn as Record<string, boolean>) || {} }));
  const bps: { id: string; label: string }[] = [
    { id: "desktop", label: "Desktop" }, { id: "tablet", label: "Tablet" }, { id: "mobile", label: "Mobile" },
  ];
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="grid grid-cols-3 gap-1.5">
        {bps.map((b) => {
          const hidden = !!hideOn[b.id];
          return (
            <button
              key={b.id}
              onClick={() => actions.setProp((p: Record<string, unknown>) => { p.hideOn = { ...((p.hideOn as Record<string, boolean>) || {}), [b.id]: !hidden }; })}
              className={`py-1.5 rounded border text-[10px] font-medium ${hidden ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
              title={hidden ? `Hidden on ${b.label}` : `Visible on ${b.label}`}
            >
              {b.label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Red = hidden on that breakpoint.</p>
    </div>
  );
}

function ArrayField({
  field,
  value,
  setValue,
}: {
  field: Extract<FieldSchema, { kind: "array" }>;
  value: unknown[];
  setValue: (v: unknown[]) => void;
}) {
  const items: Record<string, unknown>[] = (Array.isArray(value) ? value : []) as Record<string, unknown>[];

  const blankItem = () => {
    const obj: Record<string, unknown> = {};
    for (const f of field.item) obj[f.name] = f.kind === "toggle" ? false : "";
    return obj;
  };

  const update = (i: number, patch: Record<string, unknown>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    setValue(next);
  };
  const remove = (i: number) => setValue(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setValue(next);
  };

  return (
    <div>
      <span className={labelCls}>{field.label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-md p-2 bg-gray-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-gray-400">
                {field.itemLabel ?? "Item"} {i + 1}
              </span>
              <div className="flex items-center gap-1 text-gray-400">
                <button onClick={() => move(i, -1)} className="hover:text-gray-700" title="Move up">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => move(i, 1)} className="hover:text-gray-700" title="Move down">
                  <ChevronDown size={13} />
                </button>
                <button onClick={() => remove(i)} className="hover:text-red-500" title="Remove">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {field.item.map((sub) => (
                <Field
                  key={sub.name}
                  field={sub}
                  value={item?.[sub.name]}
                  setValue={(v) => update(i, { [sub.name]: v })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setValue([...items, blankItem()])}
        className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] font-medium text-blue-600 border border-dashed border-blue-300 rounded-md py-1.5 hover:bg-blue-50"
      >
        <Plus size={13} /> Add {field.itemLabel ?? "item"}
      </button>
    </div>
  );
}

/**
 * Renders a component's whole Settings tab from its schema. Attached as a
 * node's `related.settings`, so `useNode` here is bound to that node's context.
 */
export function SettingsFields({ schema }: { schema: FieldSchema[] }) {
  const { props, actions } = useNode((node) => ({ props: node.data.props }));

  const setValue = (name: string, v: unknown) =>
    actions.setProp((p: Record<string, unknown>) => {
      p[name] = v;
    });

  return (
    <div className="space-y-4">
      {schema.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={(props as Record<string, unknown>)?.[field.name]}
          setValue={(v) => setValue(field.name, v)}
        />
      ))}
    </div>
  );
}
