"use server";

import { requireAdmin } from "./auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const TABLE: Record<string, string> = { 
  event: "events", 
  post: "posts", 
  form: "forms", 
  page: "pages" 
};

export async function saveNexusData(kind: string, id: string, nexusData: unknown) {
  const { supabase } = await requireAdmin();
  const table = TABLE[kind];
  
  if (!table) {
    throw new Error(`Invalid entity kind: ${kind}`);
  }

  const { error } = await supabase
    .from(table)
    .update({ nexus_data: nexusData })
    .eq("id", id);

  if (error) {
    console.error("Failed to save Nexus layout:", error);
    throw new Error("Failed to save layout");
  }

  // Revalidate relevant paths based on kind
  if (kind === "page") revalidatePath(`/${id}`);
  if (kind === "event") revalidatePath(`/events/${id}`);
  if (kind === "post") revalidatePath(`/news/${id}`);
  if (kind === "form") revalidatePath(`/forms/${id}`);

  return { success: true };
}

/**
 * Public submission for a Nexus-built form: collects every named input into a
 * JSON payload and inserts a `form_submissions` row. `formId`/`eventId` are
 * bound by the client wrapper; `_`-prefixed fields (honeypot) are ignored.
 */
export async function submitNexusForm(
  formId: string,
  eventId: string | null,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  if (String(formData.get("_hp") ?? "").trim()) return { ok: true }; // honeypot

  const supabase = await createClient();

  const data: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("_")) continue;
    if (k in data) {
      const cur = data[k];
      data[k] = Array.isArray(cur) ? [...cur, v] : [cur, v];
    } else {
      data[k] = v;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("form_submissions")
    .insert({ form_id: formId, event_id: eventId, profile_id: user?.id ?? null, data });

  if (error) return { error: error.message };
  return { ok: true };
}
