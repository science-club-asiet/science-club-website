import React from "react";
import { useNode } from "@craftjs/core";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { InspectorImage } from "@/components/admin/builder/InspectorImage";
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
  value: any;
  setValue: (v: any) => void;
}) {
  switch (field.kind) {
    case "text":
    case "link":
      return (
        <label className="block">
          <span className={labelCls}>{field.label}</span>
          <input
            type="text"
            value={value ?? ""}
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
            value={value ?? ""}
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
            value={value ?? ""}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => setValue(e.target.value === "" ? undefined : Number(e.target.value))}
            className={inputCls}
          />
        </label>
      );
    case "color":
      return (
        <label className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{field.label}</span>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) => setValue(e.target.value)}
            className="w-6 h-6 p-0 border-0 cursor-pointer"
          />
        </label>
      );
    case "toggle":
      return (
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-500 text-xs">{field.label}</span>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setValue(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </label>
      );
    case "select":
      return (
        <label className="block">
          <span className={labelCls}>{field.label}</span>
          <select
            value={value ?? ""}
            onChange={(e) => {
              const opt = field.options.find((o) => String(o.value) === e.target.value);
              setValue(opt ? opt.value : e.target.value);
            }}
            className={inputCls}
          >
            {field.options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    case "image":
      return (
        <div>
          <span className={labelCls}>{field.label}</span>
          <InspectorImage value={value ?? ""} onChange={setValue} />
        </div>
      );
    case "array":
      return <ArrayField field={field} value={value ?? []} setValue={setValue} />;
    default:
      return null;
  }
}

function ArrayField({
  field,
  value,
  setValue,
}: {
  field: Extract<FieldSchema, { kind: "array" }>;
  value: any[];
  setValue: (v: any[]) => void;
}) {
  const items: any[] = Array.isArray(value) ? value : [];

  const blankItem = () => {
    const obj: Record<string, any> = {};
    for (const f of field.item) obj[f.name] = f.kind === "toggle" ? false : "";
    return obj;
  };

  const update = (i: number, patch: any) => {
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

  const setValue = (name: string, v: any) =>
    actions.setProp((p: any) => {
      p[name] = v;
    });

  return (
    <div className="space-y-4">
      {schema.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={props?.[field.name]}
          setValue={(v) => setValue(field.name, v)}
        />
      ))}
    </div>
  );
}
