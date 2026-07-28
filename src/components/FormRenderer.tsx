"use client";

import { useActionState } from "react";
import { submitFormAction } from "@/lib/admin/formActions";
import type { PublicForm, PublicFormField } from "@/lib/data/forms";

const base =
  "w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-navy focus:outline-none focus:border-red transition-colors";

function Field({ f }: { f: PublicFormField }) {
  const common = { id: f.fieldKey, name: f.fieldKey, required: f.required, placeholder: f.placeholder };
  switch (f.fieldType) {
    case "textarea":
      return <textarea {...common} rows={4} className={base} />;
    case "select":
      return (
        <select {...common} className={base} defaultValue="">
          <option value="" disabled>Choose…</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "multiselect":
      return (
        <div className="flex flex-col gap-2">
          {f.options.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={f.fieldKey} value={o} className="accent-red" /> {o}
            </label>
          ))}
        </div>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-2">
          {f.options.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="radio" name={f.fieldKey} value={o} required={f.required} className="accent-red" /> {o}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={f.fieldKey} className="accent-red" /> {f.label}
        </label>
      );
    case "number":
      return <input {...common} type="number" className={base} />;
    case "email":
      return <input {...common} type="email" className={base} />;
    case "phone":
      return <input {...common} type="tel" className={base} />;
    case "date":
      return <input {...common} type="date" className={base} />;
    default:
      return <input {...common} type="text" className={base} />;
  }
}

export function FormRenderer({ form, eventId }: { form: PublicForm; eventId?: string }) {
  const [state, formAction, pending] = useActionState(submitFormAction.bind(null, form.id), null);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red/30 p-10 text-center">
        <p className="font-oswald text-2xl font-bold uppercase text-navy">Thank you!</p>
        <p className="text-gray-500 mt-2">Your response was recorded.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      <input name="_hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {eventId && <input type="hidden" name="_event_id" value={eventId} />}

      {form.fields.map((f) => (
        <div key={f.id} className="flex flex-col gap-1.5">
          {f.fieldType !== "checkbox" && (
            <label htmlFor={f.fieldKey} className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {f.label}
              {f.required && <span className="text-red"> *</span>}
            </label>
          )}
          <Field f={f} />
          {f.helpText && <span className="text-xs text-gray-400">{f.helpText}</span>}
        </div>
      ))}

      {state?.error && <p className="text-red text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-navy text-white py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-red transition-colors disabled:opacity-60 w-fit px-10"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
