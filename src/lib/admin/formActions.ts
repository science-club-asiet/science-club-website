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
    image_url: (d.image_url as string) ?? null,
    validation_rule: (d.validation_rule as Record<string, unknown>) ?? {},
    allow_other: Boolean(d.allow_other),
    shuffle_options: Boolean(d.shuffle_options),
    scale_min: (d.scale_min as number) ?? 1,
    scale_max: (d.scale_max as number) ?? 5,
    scale_min_label: (d.scale_min_label as string) ?? null,
    scale_max_label: (d.scale_max_label as string) ?? null,
    grid_rows: (d.grid_rows as string[]) ?? [],
    grid_columns: (d.grid_columns as string[]) ?? [],
    file_types: (d.file_types as string[]) ?? [],
    max_file_size: (d.max_file_size as string) ?? "10MB",
    max_files: (d.max_files as number) ?? 1,
    upload_folder: (d.upload_folder as string) ?? "forms",
  };
}

// ─── Form settings ──────────────────────────────────────────────────────────

export async function createForm(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "Untitled form";
  const baseSlug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const purpose = String(formData.get("purpose") ?? "generic");
  const category = String(formData.get("category") ?? "General").trim() || "General";
  const isTemplate = formData.get("is_template") === "on" || formData.get("is_template") === "true";

  let slug = baseSlug;
  let inserted = await supabase
    .from("forms")
    .insert({ title, slug, purpose, category, is_template: isTemplate, created_by: user!.id })
    .select("id")
    .single();

  if (inserted.error?.code === "23505") {
    slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    inserted = await supabase
      .from("forms")
      .insert({ title, slug, purpose, category, is_template: isTemplate, created_by: user!.id })
      .select("id")
      .single();
  }
  if (inserted.error) throw new Error(inserted.error.message);
  revalidatePath("/admin/forms");
  redirect(`/admin/forms/${inserted.data.id}`);
}

export async function updateFormSettings(
  id: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const { supabase } = await requireAdmin();
  const maxResponsesVal = formData.get("max_responses") ? Number(formData.get("max_responses")) : null;
  const closeAtVal = formData.get("close_at") ? String(formData.get("close_at")) : null;

  const { error } = await supabase
    .from("forms")
    .update({
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      purpose: String(formData.get("purpose") ?? "generic"),
      category: String(formData.get("category") ?? "General").trim() || "General",
      is_template: formData.get("is_template") === "on",
      is_active: formData.get("is_active") === "on",
      confirmation_message: String(formData.get("confirmation_message") ?? "Thank you! Your response has been recorded."),
      closed_message: String(formData.get("closed_message") ?? "This form is no longer accepting responses."),
      close_at: closeAtVal || null,
      max_responses: maxResponsesVal && !isNaN(maxResponsesVal) ? maxResponsesVal : null,
      limit_one_per_user: formData.get("limit_one_per_user") === "on",
      show_submit_another: formData.get("show_submit_another") === "on",
      collect_email_type: String(formData.get("collect_email_type") ?? "DO_NOT_COLLECT"),
      header_image_url: String(formData.get("header_image_url") ?? "") || null,
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

export async function duplicateFormAction(formId: string): Promise<{ error?: string; id?: string }> {
  const { supabase, user } = await requireAdmin();

  // Fetch original form
  const { data: originalForm, error: fe } = await supabase.from("forms").select("*").eq("id", formId).single();
  if (fe || !originalForm) return { error: fe?.message || "Form not found" };

  const title = `${originalForm.title} (Copy)`;
  const baseSlug = `${originalForm.slug || slugify(originalForm.title)}-copy`;
  let slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  const { data: newForm, error: ie } = await supabase
    .from("forms")
    .insert({
      title,
      slug,
      description: originalForm.description,
      purpose: originalForm.purpose,
      category: originalForm.category || "General",
      is_template: Boolean(originalForm.is_template),
      is_active: originalForm.is_active,
      confirmation_message: originalForm.confirmation_message,
      closed_message: originalForm.closed_message,
      close_at: originalForm.close_at,
      max_responses: originalForm.max_responses,
      limit_one_per_user: originalForm.limit_one_per_user,
      show_submit_another: originalForm.show_submit_another,
      collect_email_type: originalForm.collect_email_type,
      header_image_url: originalForm.header_image_url,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (ie || !newForm) return { error: ie?.message || "Failed to create duplicated form" };

  // Copy original fields
  const { data: originalFields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("display_order");

  if (originalFields && originalFields.length > 0) {
    const newFieldsRows = originalFields.map((f, i) => ({
      form_id: newForm.id,
      label: f.label,
      field_key: f.field_key,
      field_type: f.field_type,
      required: f.required,
      placeholder: f.placeholder,
      help_text: f.help_text,
      options: f.options,
      image_url: f.image_url,
      validation_rule: f.validation_rule,
      allow_other: f.allow_other,
      shuffle_options: f.shuffle_options,
      scale_min: f.scale_min,
      scale_max: f.scale_max,
      scale_min_label: f.scale_min_label,
      scale_max_label: f.scale_max_label,
      grid_rows: f.grid_rows,
      grid_columns: f.grid_columns,
      file_types: f.file_types,
      max_file_size: f.max_file_size,
      max_files: f.max_files,
      display_order: i,
    }));
    await supabase.from("form_fields").insert(newFieldsRows);
  }

  revalidatePath("/admin/forms");
  return { id: newForm.id };
}

/** Instantiates a Template preset into an active live Form */
export async function instantiateTemplateAction(templateId: string): Promise<{ error?: string; id?: string }> {
  const { supabase, user } = await requireAdmin();

  const { data: tmpl, error: fe } = await supabase.from("forms").select("*").eq("id", templateId).single();
  if (fe || !tmpl) return { error: fe?.message || "Template not found" };

  const cleanTitle = tmpl.title.replace(/\s*\(Template\)/i, "").trim();
  const title = `${cleanTitle} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  const baseSlug = slugify(cleanTitle);
  let slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  const { data: newForm, error: ie } = await supabase
    .from("forms")
    .insert({
      title,
      slug,
      description: tmpl.description,
      purpose: tmpl.purpose || "generic",
      category: tmpl.category || "General",
      is_template: false, // Live form!
      is_active: true,
      confirmation_message: tmpl.confirmation_message,
      closed_message: tmpl.closed_message,
      collect_email_type: tmpl.collect_email_type,
      header_image_url: tmpl.header_image_url,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (ie || !newForm) return { error: ie?.message || "Failed to create form from template" };

  // Copy template fields
  const { data: tmplFields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", templateId)
    .order("display_order");

  if (tmplFields && tmplFields.length > 0) {
    const newFieldsRows = tmplFields.map((f, i) => ({
      form_id: newForm.id,
      label: f.label,
      field_key: f.field_key,
      field_type: f.field_type,
      required: f.required,
      placeholder: f.placeholder,
      help_text: f.help_text,
      options: f.options,
      image_url: f.image_url,
      validation_rule: f.validation_rule,
      allow_other: f.allow_other,
      shuffle_options: f.shuffle_options,
      scale_min: f.scale_min,
      scale_max: f.scale_max,
      scale_min_label: f.scale_min_label,
      scale_max_label: f.scale_max_label,
      grid_rows: f.grid_rows,
      grid_columns: f.grid_columns,
      file_types: f.file_types,
      max_file_size: f.max_file_size,
      max_files: f.max_files,
      display_order: i,
    }));
    await supabase.from("form_fields").insert(newFieldsRows);
  }

  revalidatePath("/admin/forms");
  return { id: newForm.id };
}

/** Saves an existing form as a reusable preset Template */
export async function saveFormAsTemplateAction(formId: string): Promise<{ error?: string; id?: string }> {
  const { supabase, user } = await requireAdmin();

  const { data: originalForm, error: fe } = await supabase.from("forms").select("*").eq("id", formId).single();
  if (fe || !originalForm) return { error: fe?.message || "Form not found" };

  const title = `${originalForm.title} (Template)`;
  const baseSlug = `template-${originalForm.slug || slugify(originalForm.title)}`;
  let slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  const { data: newTmpl, error: ie } = await supabase
    .from("forms")
    .insert({
      title,
      slug,
      description: originalForm.description,
      purpose: originalForm.purpose,
      category: originalForm.category || "General",
      is_template: true, // Marked as Template!
      is_active: false,
      confirmation_message: originalForm.confirmation_message,
      closed_message: originalForm.closed_message,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (ie || !newTmpl) return { error: ie?.message || "Failed to create template" };

  // Copy original fields to template
  const { data: originalFields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("display_order");

  if (originalFields && originalFields.length > 0) {
    const newFieldsRows = originalFields.map((f, i) => ({
      form_id: newTmpl.id,
      label: f.label,
      field_key: f.field_key,
      field_type: f.field_type,
      required: f.required,
      placeholder: f.placeholder,
      help_text: f.help_text,
      options: f.options,
      image_url: f.image_url,
      validation_rule: f.validation_rule,
      allow_other: f.allow_other,
      shuffle_options: f.shuffle_options,
      scale_min: f.scale_min,
      scale_max: f.scale_max,
      scale_min_label: f.scale_min_label,
      scale_max_label: f.scale_max_label,
      grid_rows: f.grid_rows,
      grid_columns: f.grid_columns,
      file_types: f.file_types,
      max_file_size: f.max_file_size,
      max_files: f.max_files,
      display_order: i,
    }));
    await supabase.from("form_fields").insert(newFieldsRows);
  }

  revalidatePath("/admin/forms");
  return { id: newTmpl.id };
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
      label: fieldType === "section" ? "Untitled Section" : "Untitled Question",
      field_key: `field_${Date.now().toString(36)}`,
      field_type: fieldType,
      display_order: nextOrder,
      options: ["Option 1", "Option 2"],
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/forms/${formId}`);
  return mapField(data);
}

export async function duplicateFieldAction(formId: string, fieldId: string): Promise<BuilderField> {
  const { supabase } = await requireAdmin();
  let source: any = null;

  if (fieldId && !fieldId.startsWith("temp_")) {
    const { data } = await supabase.from("form_fields").select("*").eq("id", fieldId).maybeSingle();
    source = data;
  }

  // Fallback if fieldId was a client-side temp_ ID
  if (!source) {
    const { data: latest } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("display_order", { ascending: false })
      .limit(1);
    source = latest?.[0];
  }

  if (!source) {
    return addFieldAction(formId, "text");
  }

  const { data: last } = await supabase
    .from("form_fields")
    .select("display_order")
    .eq("form_id", formId)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = (last?.[0]?.display_order ?? source.display_order) + 1;

  const { data, error } = await supabase
    .from("form_fields")
    .insert({
      form_id: formId,
      label: `${source.label} (Copy)`,
      field_key: `field_${Date.now().toString(36).slice(-6)}_${Math.random().toString(36).slice(2, 5)}`,
      field_type: source.field_type,
      required: Boolean(source.required),
      placeholder: source.placeholder || "",
      help_text: source.help_text || "",
      options: source.options || [],
      image_url: source.image_url || null,
      validation_rule: source.validation_rule || {},
      allow_other: Boolean(source.allow_other),
      shuffle_options: Boolean(source.shuffle_options),
      scale_min: source.scale_min ?? 1,
      scale_max: source.scale_max ?? 5,
      scale_min_label: source.scale_min_label || null,
      scale_max_label: source.scale_max_label || null,
      grid_rows: source.grid_rows || [],
      grid_columns: source.grid_columns || [],
      file_types: source.file_types || [],
      max_file_size: source.max_file_size || "10MB",
      max_files: source.max_files ?? 1,
      upload_folder: source.upload_folder || "forms",
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
}

// ─── Public submission ──────────────────────────────────────────────────────

export async function submitFormAction(
  formId: string,
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  if (String(formData.get("_hp") ?? "").trim()) return { ok: true }; // honeypot

  const supabase = await createClient();

  // Check form active & submission caps / close deadline
  const { data: form } = await supabase
    .from("forms")
    .select("is_active, close_at, max_responses, limit_one_per_user")
    .eq("id", formId)
    .single();

  if (!form || form.is_active === false) {
    return { error: "This form is no longer accepting responses." };
  }

  if (form.close_at && new Date() > new Date(form.close_at)) {
    return { error: "Registration deadline has passed for this form." };
  }

  if (form.max_responses) {
    const { count } = await supabase
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .eq("form_id", formId);
    if ((count ?? 0) >= form.max_responses) {
      return { error: "This form has reached its maximum response limit." };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (form.limit_one_per_user && user) {
    const { count } = await supabase
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .eq("form_id", formId)
      .eq("profile_id", user.id);
    if ((count ?? 0) > 0) {
      return { error: "You have already submitted a response to this form." };
    }
  }

  const { data: fields } = await supabase
    .from("form_fields")
    .select("field_key, field_type, required, validation_rule")
    .eq("form_id", formId);

  const data: Record<string, unknown> = {};
  for (const f of fields ?? []) {
    if (f.field_type === "section" || f.field_type === "image") continue;
    if (f.field_type === "multiselect" || f.field_type === "grid_checkbox") {
      data[f.field_key] = formData.getAll(f.field_key).map(String);
    } else if (f.field_type === "checkbox") {
      data[f.field_key] = formData.get(f.field_key) === "on";
    } else {
      data[f.field_key] = String(formData.get(f.field_key) ?? "");
    }
  }

  const eventId = formData.get("_event_id") ? String(formData.get("_event_id")) : null;

  const { error } = await supabase
    .from("form_submissions")
    .insert({ form_id: formId, event_id: eventId, profile_id: user?.id ?? null, data });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function syncFormWithNexusAction(formId: string): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireAdmin();
  const { data: form } = await supabase.from("forms").select("slug").eq("id", formId).single();
  if (form?.slug) revalidatePath(`/forms/${form.slug}`);
  revalidatePath(`/admin/forms/${formId}`);
  revalidatePath(`/admin/pagebuilder/form/${formId}`);
  return { success: true };
}

export async function deleteSubmissionAction(formId: string, submissionId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("form_submissions")
    .delete()
    .eq("id", submissionId)
    .eq("form_id", formId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/forms/${formId}/submissions`);
  return { ok: true };
}

// ─── Categories & Seed Templates ──────────────────────────────────────────

export async function createFormCategoryAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) throw new Error("Category name is required");

  const slug = slugify(name);
  await supabase.from("form_categories").insert({ name, slug, description });
  revalidatePath("/admin/forms");
}

export async function deleteFormCategoryAction(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("form_categories").delete().eq("id", id);
  revalidatePath("/admin/forms");
}

export async function seedDefaultTemplatesAction(): Promise<void> {
  const { supabase, user } = await requireAdmin();

  // Check if any templates exist in public.forms
  const { data: existing } = await supabase.from("forms").select("id").eq("is_template", true).limit(1);
  if (existing && existing.length > 0) return;

  const defaultTemplates = [
    {
      title: "Event Registration Preset",
      slug: `preset-event-registration-${Date.now()}`,
      category: "Registrations",
      description: "Standard registration form for workshops, tech talks, and seminars",
      fields: [
        { label: "Full Name", field_key: "full_name", field_type: "text", required: true, display_order: 0 },
        { label: "Email Address", field_key: "email_address", field_type: "text", required: true, display_order: 1 },
        { label: "Contact Number", field_key: "phone_number", field_type: "text", required: false, display_order: 2 },
        { label: "Department / Branch", field_key: "department_branch", field_type: "text", required: true, display_order: 3 },
        { label: "Year of Study", field_key: "year_of_study", field_type: "select", options: ["1st Year", "2nd Year", "3rd Year", "4th Year"], required: true, display_order: 4 },
        { label: "Expectations / Questions", field_key: "expectations", field_type: "textarea", required: false, display_order: 5 },
      ],
    },
    {
      title: "Membership Application Preset",
      slug: `preset-membership-application-${Date.now()}`,
      category: "Recruitment",
      description: "Annual recruitment form for new club members and Execom",
      fields: [
        { label: "Full Name", field_key: "full_name", field_type: "text", required: true, display_order: 0 },
        { label: "Email Address", field_key: "email_address", field_type: "text", required: true, display_order: 1 },
        { label: "Roll / Admission Number", field_key: "roll_number", field_type: "text", required: true, display_order: 2 },
        { label: "Department", field_key: "department", field_type: "text", required: true, display_order: 3 },
        { label: "Areas of Interest", field_key: "interests", field_type: "multiselect", options: ["Robotics & IoT", "Artificial Intelligence", "Web / App Dev", "Astronomy & Physics", "Competitive Coding"], required: true, display_order: 4 },
        { label: "Why do you want to join Science Club?", field_key: "motivation", field_type: "textarea", required: true, display_order: 5 },
      ],
    },
    {
      title: "Event Feedback & Rating Survey Preset",
      slug: `preset-event-feedback-${Date.now()}`,
      category: "Feedback",
      description: "Post-event attendee survey with 1-5 scale rating",
      fields: [
        { label: "Attendee Name (Optional)", field_key: "attendee_name", field_type: "text", required: false, display_order: 0 },
        { label: "Event Attended", field_key: "event_name", field_type: "text", required: true, display_order: 1 },
        { label: "Overall Event Rating", field_key: "overall_rating", field_type: "scale", scale_min: 1, scale_max: 5, scale_min_label: "Poor", scale_max_label: "Excellent", required: true, display_order: 2 },
        { label: "What was the highlight of the event?", field_key: "highlight", field_type: "textarea", required: false, display_order: 3 },
        { label: "Suggestions for future events", field_key: "suggestions", field_type: "textarea", required: false, display_order: 4 },
      ],
    },
    {
      title: "Workshop RSVP & Hackathon Team Entry Preset",
      slug: `preset-workshop-rsvp-${Date.now()}`,
      category: "Registrations",
      description: "RSVP form for team-based workshops and mini-hackathons",
      fields: [
        { label: "Team Name", field_key: "team_name", field_type: "text", required: true, display_order: 0 },
        { label: "Team Lead Name", field_key: "lead_name", field_type: "text", required: true, display_order: 1 },
        { label: "Team Lead Email", field_key: "lead_email", field_type: "text", required: true, display_order: 2 },
        { label: "Team Size", field_key: "team_size", field_type: "select", options: ["Solo (1)", "Pair (2)", "Team of 3", "Team of 4"], required: true, display_order: 3 },
        { label: "GitHub / Portfolio Link", field_key: "portfolio_link", field_type: "text", required: false, display_order: 4 },
      ],
    },
  ];

  for (const tmpl of defaultTemplates) {
    const { data: insertedForm } = await supabase
      .from("forms")
      .insert({
        title: tmpl.title,
        slug: tmpl.slug,
        category: tmpl.category,
        description: tmpl.description,
        is_template: true,
        is_active: false,
        created_by: user?.id,
      })
      .select("id")
      .single();

    if (insertedForm) {
      const fieldRows = tmpl.fields.map((f) => ({
        form_id: insertedForm.id,
        ...f,
      }));
      await supabase.from("form_fields").insert(fieldRows);
    }
  }
}
