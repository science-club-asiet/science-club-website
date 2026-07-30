import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type PublicFormField = {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  required: boolean;
  placeholder: string;
  helpText: string;
  options: string[];
};
export type PublicForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  fields: PublicFormField[];
  layout?: unknown; // Puck layout tree (visual builder), when present
};

/** An active form + its fields, for public rendering at /forms/[slug]. */
export async function getFormBySlug(slug: string): Promise<PublicForm | null> {
  const sb = createPublicClient();
  const { data: form } = await sb
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!form) return null;

  const { data: fields } = await sb
    .from("form_fields")
    .select("*")
    .eq("form_id", form.id)
    .order("display_order");

  return {
    id: form.id,
    title: form.title,
    slug: form.slug,
    description: form.description ?? "",
    layout: form.layout ?? null,
    fields: (fields ?? []).map((f) => ({
      id: f.id,
      label: f.label,
      fieldKey: f.field_key,
      fieldType: f.field_type,
      required: f.required,
      placeholder: f.placeholder ?? "",
      helpText: f.help_text ?? "",
      options: (f.options as string[]) ?? [],
    })),
  };
}
