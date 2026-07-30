"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

const TABLE: Record<string, string> = { event: "events", post: "posts", form: "forms", page: "pages" };

/** Persist a Puck layout tree onto any buildable entity. */
export async function savePuckData(kind: string, id: string, data: unknown): Promise<{ error?: string }> {
  const table = TABLE[kind];
  if (!table) return { error: "Unknown kind" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).update({ layout: data }).eq("id", id);
  if (error) return { error: error.message };
  if (kind === "event") revalidatePath("/events");
  if (kind === "post") revalidatePath("/news");
  if (kind === "page") revalidatePath("/p");
  return {};
}

/** Public submission for a Puck-built form: collect every named input. */
export async function submitPuckForm(
  formId: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
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

  const eventId = formData.get("_event_id") ? String(formData.get("_event_id")) : null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("form_submissions")
    .insert({ form_id: formId, event_id: eventId, profile_id: user?.id ?? null, data });
  if (error) return { error: error.message };
  return { ok: true };
}
