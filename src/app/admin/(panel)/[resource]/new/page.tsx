import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/admin/auth";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { TemplatePicker } from "@/components/admin/TemplatePicker";
import { getTemplateById } from "@/lib/admin/template-actions";
import { AdminBackButton } from "@/components/admin/AdminBackButton";

export const dynamic = "force-dynamic";

const WEBSITE_RESOURCE_KEYS = new Set(["pillars", "goals", "impact_stories", "story_eras", "perks", "faqs", "achievements"]);

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

  const isWebsiteResource = WEBSITE_RESOURCE_KEYS.has(res.key);
  const backHref = isWebsiteResource ? "/admin/website" : `/admin/${res.key}`;
  const backLabel = isWebsiteResource ? "Back to Website Hub" : `Back to ${res.label}`;

  return (
    <div>
      <AdminBackButton href={backHref} label={backLabel} />
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">New — {res.label}</h1>
      <TemplatePicker kind={resource} />
      <ResourceForm resource={res} id={null} initial={initial} />
    </div>
  );
}
