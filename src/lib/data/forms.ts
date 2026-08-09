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
  imageUrl?: string | null;
  allowOther?: boolean;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string | null;
  scaleMaxLabel?: string | null;
  maxFiles?: number;
  maxFileSize?: string;
  uploadFolder?: string | null;
};

export type PublicForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  confirmationMessage?: string;
  closedMessage?: string;
  isActive: boolean;
  closeAt?: string | null;
  maxResponses?: number | null;
  showSubmitAnother?: boolean;
  fields: PublicFormField[];
  layout?: unknown;
  nexus_data?: unknown;
};

/** An active form + its fields, for public rendering at /forms/[slug]. */
export async function getFormBySlug(slug: string): Promise<PublicForm | null> {
  const sb = createPublicClient();
  const { data: form } = await sb
    .from("forms")
    .select("*")
    .eq("slug", slug)
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
    confirmationMessage: form.confirmation_message ?? "Thank you! Your response has been recorded.",
    closedMessage: form.closed_message ?? "This form is no longer accepting responses.",
    isActive: form.is_active !== false,
    closeAt: form.close_at ?? null,
    maxResponses: form.max_responses ?? null,
    showSubmitAnother: form.show_submit_another !== false,
    layout: form.layout ?? null,
    nexus_data: form.nexus_data ?? null,
    fields: (fields ?? []).map((f) => ({
      id: f.id,
      label: f.label,
      fieldKey: f.field_key,
      fieldType: f.field_type,
      required: f.required,
      placeholder: f.placeholder ?? "",
      helpText: f.help_text ?? "",
      options: (f.options as string[]) ?? [],
      imageUrl: f.image_url ?? null,
      allowOther: Boolean(f.allow_other),
      scaleMin: f.scale_min ?? 1,
      scaleMax: f.scale_max ?? 5,
      scaleMinLabel: f.scale_min_label ?? null,
      scaleMaxLabel: f.scale_max_label ?? null,
      maxFiles: f.max_files ?? 1,
      maxFileSize: f.max_file_size ?? "10MB",
      uploadFolder: f.upload_folder ?? "forms",
    })),
  };
}
