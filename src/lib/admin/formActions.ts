"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { BuilderField } from "@/lib/admin/formTypes";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function mapField(d: Record<string, unknown>): BuilderField {
  return {
    id: d.id as string,
    label: d.label as string,
    field_key: d.field_key as string,
    field_type: d.field_type as string,
    required: Boolean(d.required),
    placeholder: (d.placeholder as string) ?? "",
    help_text: (d.help_text as string) ?? "",
    options: (d.options as string[]) ?? [],
    display_order: (d.display_order as number) ?? 0,
  };
}

// ─── Form settings ──────────────────────────────────────────────────────────

export async function createForm(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "Untitled form";
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const purpose = String(formData.get("purpose") ?? "generic");
  const { data, error } = await supabase
    .from("forms")
    .insert({ title, slug, purpose, created_by: user!.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/forms");
  redirect(`/admin/forms/${data.id}`);
}

export async function updateFormSettings(
  id: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("forms")
    .update({
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      purpose: String(formData.get("purpose") ?? "generic"),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/forms/${id}`);
  revalidatePath("/admin/forms");
  return { ok: true };
}

export async function deleteForm(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("forms").delete().eq("id", id);
  revalidatePath("/admin/forms");
  redirect("/admin/forms");
}

// ─── Fields ─────────────────────────────────────────────────────────────────

export async function addFieldAction(formId: string, fieldType: string): Promise<BuilderField> {
  const { supabase } = await requireAdmin();
  const { data: last } = await supabase
    .from("form_fields")
    .select("display_order")
    .eq("form_id", formId)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = (last?.[0]?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("form_fields")
    .insert({
      form_id: formId,
      label: "Untitled field",
      field_key: `field_${Date.now().toString(36)}`,
      field_type: fieldType,
      display_order: nextOrder,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/forms/${formId}`);
  return mapField(data);
}

export async function updateFieldAction(
  formId: string,
  fieldId: string,
  patch: Partial<Omit<BuilderField, "id" | "display_order">>
): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("form_fields").update(patch).eq("id", fieldId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/forms/${formId}`);
  return {};
}

export async function deleteFieldAction(formId: string, fieldId: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("form_fields").delete().eq("id", fieldId);
  revalidatePath(`/admin/forms/${formId}`);
}

export async function reorderFieldsAction(formId: string, orderedIds: string[]): Promise<void> {
  const { supabase } = await requireAdmin();
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("form_fields").update({ display_order: i }).eq("id", id))
  );
  revalidatePath(`/admin/forms/${formId}`);
}

// ─── Public submission ──────────────────────────────────────────────────────

export async function submitFormAction(
  formId: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  if (String(formData.get("_hp") ?? "").trim()) return { ok: true }; // honeypot

  const supabase = await createClient(); // anon or authed cookie client
  const { data: fields } = await supabase
    .from("form_fields")
    .select("field_key, field_type")
    .eq("form_id", formId);

  const data: Record<string, unknown> = {};
  for (const f of fields ?? []) {
    if (f.field_type === "multiselect") data[f.field_key] = formData.getAll(f.field_key).map(String);
    else if (f.field_type === "checkbox") data[f.field_key] = formData.get(f.field_key) === "on";
    else data[f.field_key] = String(formData.get(f.field_key) ?? "");
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
