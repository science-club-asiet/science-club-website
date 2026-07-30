"use client";

import { useActionState } from "react";
import { Render, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "@/lib/puck/config";
import { submitPuckForm } from "@/lib/admin/puckActions";

/** Public render of a Puck-built form, wrapped in a submitting <form>. */
export function PuckFormRender({ formId, data, eventId }: { formId: string; data: Data; eventId?: string }) {
  const [state, action, pending] = useActionState(submitPuckForm.bind(null, formId), null);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red/30 p-10 text-center">
        <p className="font-oswald text-2xl font-bold uppercase text-navy">Thank you!</p>
        <p className="text-gray-500 mt-2">Your response was recorded.</p>
      </div>
    );
  }

  return (
    <form action={action}>
      <input name="_hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {eventId && <input type="hidden" name="_event_id" value={eventId} />}
      <Render config={puckConfig} data={data} />
      {state?.error && <p className="text-red text-sm mt-2">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 bg-navy text-white py-3 px-10 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-red transition-colors disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
