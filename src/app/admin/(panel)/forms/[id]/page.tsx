import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { updateFormSettings } from "@/lib/admin/formActions";
import { EditorForm } from "@/components/admin/EditorForm";
import { FormBuilder } from "@/components/admin/FormBuilder";
import type { EditorField } from "@/lib/admin/singletons";
import type { BuilderField } from "@/lib/admin/formTypes";

export const dynamic = "force-dynamic";

const SETTINGS_FIELDS: EditorField[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "slug", label: "Slug", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "purpose", label: "Purpose", type: "select", options: ["generic", "membership", "event"] },
  { name: "is_active", label: "Active (accepting responses)", type: "boolean" },
];

export default async function FormEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: form } = await supabase.from("forms").select("*").eq("id", id).single();
  if (!form) notFound();

  const { data: fieldsData } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", id)
    .order("display_order");

  const fields: BuilderField[] = (fieldsData ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    field_key: f.field_key,
    field_type: f.field_type,
    required: f.required,
    placeholder: f.placeholder ?? "",
    help_text: f.help_text ?? "",
    options: (f.options as string[]) ?? [],
    display_order: f.display_order,
  }));

  return (
    <div>
      <Link href="/admin/forms" className="text-xs font-semibold uppercase tracking-widest text-navy/50 hover:text-red">← Forms</Link>
      <div className="flex items-center justify-between gap-4 mt-3 mb-8">
        <h1 className="font-oswald text-3xl font-bold uppercase">{form.title}</h1>
        <div className="flex items-center gap-4">
          <a href={`/forms/${form.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">View public</a>
          <Link href={`/admin/forms/${id}/submissions`} className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">Submissions</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-8 items-start">
        <EditorForm title="Settings" fields={SETTINGS_FIELDS} initial={form} action={updateFormSettings.bind(null, id)} />
        <div>
          <h2 className="font-oswald text-lg font-bold uppercase mb-4">Fields</h2>
          <FormBuilder formId={id} initialFields={fields} />
        </div>
      </div>
    </div>
  );
}
