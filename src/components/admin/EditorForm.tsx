"use client";

import { useActionState } from "react";
import type { EditorField } from "@/lib/admin/singletons";
import type { EditorState } from "@/lib/admin/actions";
import { toast } from "@/components/ui/Toast";
import { useEffect } from "react";

const base =
  "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy transition-all duration-200 hover:border-gray-300 shadow-sm";

export function EditorForm({
  action,
  fields,
  initial,
  title,
}: {
  action: (prev: EditorState, fd: FormData) => Promise<EditorState>;
  fields: EditorField[];
  initial: Record<string, unknown>;
  title: string;
}) {
  const [state, formAction, pending] = useActionState<EditorState, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) {
      toast("Saved successfully", "success");
    } else if (state?.error) {
      toast(state.error, "error");
    }
  }, [state]);

  return (
    <form action={formAction} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-oswald text-lg font-bold uppercase mb-4">{title}</h3>
      <div className="space-y-4">
        {fields.map((f) => {
          const v = initial?.[f.name];
          if (f.type === "boolean") {
            return (
              <label key={f.name} className="flex items-center gap-2.5">
                <input type="checkbox" name={f.name} defaultChecked={Boolean(v)} className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy/20 transition-all cursor-pointer" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{f.label}</span>
              </label>
            );
          }
          const val = f.type === "json" ? (v ? JSON.stringify(v, null, 2) : "") : v == null ? "" : String(v);
          return (
            <label key={f.name} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{f.label}</span>
              {f.type === "textarea" ? (
                <textarea name={f.name} rows={3} defaultValue={val} className={base} />
              ) : f.type === "json" ? (
                <textarea name={f.name} rows={5} defaultValue={val} className={`${base} font-mono text-xs`} />
              ) : f.type === "select" ? (
                <select name={f.name} defaultValue={val} className={base}>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"}
                  defaultValue={val}
                  className={base}
                />
              )}
              {f.help && <span className="text-xs text-gray-400">{f.help}</span>}
            </label>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-5">
        <button
          type="submit"
          disabled={pending}
          className="bg-navy text-white px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-navy/90 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
