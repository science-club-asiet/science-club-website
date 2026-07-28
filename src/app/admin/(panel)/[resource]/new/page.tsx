import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/admin/auth";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const dynamic = "force-dynamic";

export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const res = RESOURCES[resource];
  if (!res) notFound();
  await requireAdmin();

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">New — {res.label}</h1>
      <ResourceForm resource={res} id={null} initial={{}} />
    </div>
  );
}
