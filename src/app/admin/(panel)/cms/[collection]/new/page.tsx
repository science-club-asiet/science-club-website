import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/admin/cmsActions";
import { PageHeader } from "@/components/ui/primitives";
import { ItemEditor } from "@/components/admin/cms/ItemEditor";

export const dynamic = "force-dynamic";

export default async function NewItemPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();
  return (
    <div className="max-w-2xl">
      <PageHeader title={`New ${c.collection.singular ?? "entry"}`} subtitle={c.collection.name} />
      <ItemEditor collectionId={c.collection.id} collectionSlug={slug} fields={c.fields} />
    </div>
  );
}
