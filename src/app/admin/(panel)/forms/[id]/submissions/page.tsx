import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { FormResponsesView } from "@/components/admin/forms/FormResponsesView";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: form } = await supabase.from("forms").select("title").eq("id", id).single();
  if (!form) notFound();

  const { data: fieldsData } = await supabase
    .from("form_fields")
    .select("field_key, label, field_type, options")
    .eq("form_id", id)
    .order("display_order");

  const { data: subsData } = await supabase
    .from("form_submissions")
    .select("id, data, created_at")
    .eq("form_id", id)
    .order("created_at", { ascending: false });

  const fields = (fieldsData ?? []).map((f) => ({
    field_key: f.field_key,
    label: f.label,
    field_type: f.field_type,
    options: (f.options as string[]) ?? [],
  }));

  const submissions = (subsData ?? []).map((s) => ({
    id: s.id,
    data: (s.data as Record<string, unknown>) ?? {},
    created_at: s.created_at,
  }));

  return (
    <FormResponsesView
      formId={id}
      formTitle={form.title}
      submissions={submissions}
      fields={fields}
    />
  );
}
