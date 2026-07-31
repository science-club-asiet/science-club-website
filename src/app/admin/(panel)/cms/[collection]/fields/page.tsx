import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/admin/cmsActions";
import { PageHeader } from "@/components/ui/primitives";
import { CollectionEditor } from "@/components/admin/cms/CollectionEditor";

export const dynamic = "force-dynamic";

export default async function EditFieldsPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();
  return (
    <div className="max-w-3xl">
      <PageHeader title={`${c.collection.name} — fields`} subtitle="Add, remove or reorder the fields for this collection." />
      <CollectionEditor mode="edit" collectionId={c.collection.id} collectionSlug={slug} initialName={c.collection.name} initialFields={c.fields} />
    </div>
  );
}
