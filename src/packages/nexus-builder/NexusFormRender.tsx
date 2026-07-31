"use client";

import React, { useActionState } from "react";
import { FormActionContext } from "./registry/forms";
import { NexusRenderer } from "./NexusRenderer";
import { submitNexusForm } from "@/lib/admin/nexusActions";

/**
 * Public wrapper for a Nexus-built form: provides the bound server action to the
 * <form> nodes via context and shows success / error feedback.
 */
export function NexusFormRender({
  data,
  formId,
  eventId,
}: {
  data: unknown;
  formId: string;
  eventId?: string;
}) {
  const [state, formAction] = useActionState(
    submitNexusForm.bind(null, formId, eventId ?? null),
    null as { error?: string; ok?: boolean } | null
  );

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
        Thanks — your response was submitted.
      </div>
    );
  }

  return (
    <FormActionContext.Provider value={{ action: formAction }}>
      {state?.error && <p className="text-red-600 text-sm mb-4">{state.error}</p>}
      <NexusRenderer data={data} />
    </FormActionContext.Provider>
  );
}
