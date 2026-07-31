import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getItems, deleteItem } from "@/lib/admin/cmsActions";
import { PageHeader, Card, EmptyState, btnPrimaryCls, btnGhostCls, rowLinkCls, badgeCls } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function CollectionItemsPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();
  const items = await getItems(c.collection.id);
  const titleField = c.fields[0]?.name ?? "title";

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={c.collection.name}
        subtitle={`${items.length} ${items.length === 1 ? "entry" : "entries"}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/admin/cms/${slug}/fields`} className={btnGhostCls}>Edit fields</Link>
            <Link href={`/admin/cms/${slug}/new`} className={btnPrimaryCls}>Add entry</Link>
          </div>
        }
      />

      <Card>
        {!items.length ? (
          <div className="p-2"><EmptyState title="No entries yet" hint="Add your first entry — it appears instantly on any page using this collection." /></div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors">
              <Link href={`/admin/cms/${slug}/${it.id}`} className="flex-1 min-w-[160px] font-medium truncate hover:text-red">
                {String(it.data[titleField] ?? "Untitled")}
              </Link>
              <span className={badgeCls(it.is_published)}>{it.is_published ? "Published" : "Draft"}</span>
              <Link href={`/admin/cms/${slug}/${it.id}`} className={rowLinkCls}>Edit</Link>
              <form action={deleteItem.bind(null, it.id)}>
                <button className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-red">Delete</button>
              </form>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
