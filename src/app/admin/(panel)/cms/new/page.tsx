import { PageHeader } from "@/components/ui/primitives";
import { CollectionEditor } from "@/components/admin/cms/CollectionEditor";
import { AdminBackButton } from "@/components/admin/AdminBackButton";

export const dynamic = "force-dynamic";

export default function NewCollectionPage() {
  return (
    <div className="max-w-3xl">
      <AdminBackButton href="/admin/cms" label="Back to Collections" />
      <PageHeader title="New collection" subtitle="Name it and define its fields (e.g. Jobs → Title, Location, Description)." />
      <CollectionEditor mode="create" />
    </div>
  );
}
