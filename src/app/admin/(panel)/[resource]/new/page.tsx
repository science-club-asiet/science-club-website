import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/admin/auth";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { TemplatePicker } from "@/components/admin/TemplatePicker";
import { getTemplateById } from "@/lib/admin/template-actions";

export const dynamic = "force-dynamic";

export default async function NewResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ templateId?: string }>;
}) {
  const { resource } = await params;
  const { templateId } = await searchParams;
  const res = RESOURCES[resource];
  if (!res) notFound();
  await requireAdmin();

  let initial = {};
  if (templateId) {
    const template = await getTemplateById(templateId);
    if (template) initial = template.payload;
  }

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">New — {res.label}</h1>
      <TemplatePicker kind={resource} />
      <ResourceForm resource={res} id={null} initial={initial} />
    </div>
  );
}
