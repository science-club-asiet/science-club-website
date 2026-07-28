import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/admin/auth";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  const res = RESOURCES[resource];
  if (!res) notFound();

  const { supabase } = await requireAdmin();
  const { data: row } = await supabase.from(res.table).select("*").eq("id", id).single();
  if (!row) notFound();

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">Edit — {res.label}</h1>
      <ResourceForm resource={res} id={id} initial={row} />
    </div>
  );
}
