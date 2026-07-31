import { notFound } from "next/navigation";
import { getCollectionBySlug, getItem } from "@/lib/admin/cmsActions";
import { PageHeader } from "@/components/ui/primitives";
import { ItemEditor } from "@/components/admin/cms/ItemEditor";

export const dynamic = "force-dynamic";

export default async function EditItemPage({ params }: { params: Promise<{ collection: string; itemId: string }> }) {
  const { collection: slug, itemId } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();
  const item = await getItem(itemId);
  if (!item) notFound();
  return (
    <div className="max-w-2xl">
      <PageHeader title={`Edit ${c.collection.singular ?? "entry"}`} subtitle={c.collection.name} />
      <ItemEditor collectionId={c.collection.id} collectionSlug={slug} fields={c.fields} item={item} />
    </div>
  );
}
