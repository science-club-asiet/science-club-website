import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { FormBuilder } from "@/components/admin/FormBuilder";
import type { BuilderField } from "@/lib/admin/formTypes";
import { DuplicateFormButton } from "@/components/admin/forms/DuplicateFormButton";
import { ArrowLeft, ExternalLink, Inbox, Sparkles, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

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
    image_url: f.image_url ?? null,
    validation_rule: f.validation_rule ?? {},
    allow_other: f.allow_other ?? false,
    shuffle_options: f.shuffle_options ?? false,
    scale_min: f.scale_min ?? 1,
    scale_max: f.scale_max ?? 5,
    scale_min_label: f.scale_min_label ?? null,
    scale_max_label: f.scale_max_label ?? null,
    grid_rows: f.grid_rows ?? [],
    grid_columns: f.grid_columns ?? [],
    file_types: f.file_types ?? [],
    max_file_size: f.max_file_size ?? "10MB",
    max_files: f.max_files ?? 1,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-inter pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/forms"
            className="p-2 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-navy">
                {form.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider flex items-center gap-1 ${
                  form.is_active !== false ? "bg-green-100 text-green-700" : "bg-red/10 text-red"
                }`}
              >
                {form.is_active !== false ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-green-600" /> Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red" /> Inactive
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">slug: /forms/{form.slug}</p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <DuplicateFormButton
            formId={id}
            className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          />

          <Link
            href={`/admin/forms/${id}/submissions`}
            className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Inbox className="w-3.5 h-3.5 text-navy/70" /> Submissions
          </Link>

          <Link
            href={`/admin/pagebuilder/form/${id}`}
            className="bg-navy hover:bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-red" /> Visual Builder
          </Link>

          {form.slug && (
            <a
              href={`/forms/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-navy/70" /> View Public
            </a>
          )}
        </div>
      </div>

      {/* Main Form Builder Engine (Full Width Layout) */}
      <FormBuilder formId={id} initialForm={form} initialFields={fields} />
    </div>
  );
}
