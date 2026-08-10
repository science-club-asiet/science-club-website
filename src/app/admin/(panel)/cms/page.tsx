import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteCollection } from "@/lib/admin/cmsActions";
import { PageHeader, Card, EmptyState, btnPrimaryCls, rowLinkCls } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function CmsHome() {
  const { supabase } = await requireAdmin();
  const { data: collections, error } = await supabase.from("collections").select("*").order("created_at");

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="CMS"
        subtitle="Define content types (Collections), add entries instantly, then bind them into pages with a Collection List."
        actions={<Link href="/admin/cms/new" className={btnPrimaryCls}>New collection</Link>}
      />

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm p-4 mb-6">
          Run migration <code className="font-mono">0010_cms.sql</code> in your Supabase SQL editor to enable the CMS.
        </div>
      )}

      <Card>
        {!collections?.length ? (
          <div className="p-2"><EmptyState title="No collections yet" hint="Create one — e.g. Jobs, Team, Testimonials — then add entries." /></div>
        ) : (
          collections.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors">
              <div className="flex-1 min-w-[160px]">
                <Link href={`/admin/cms/${c.slug}`} className="font-medium truncate hover:text-red">{c.name}</Link>
                <p className="text-xs text-gray-400 font-mono">/{c.slug}</p>
              </div>
              <Link href={`/admin/cms/${c.slug}`} className={rowLinkCls}>Entries</Link>
              <Link href={`/admin/cms/${c.slug}/fields`} className={rowLinkCls}>Fields</Link>
              <Link href={`/admin/pagebuilder/page/new`} className="text-xs font-semibold uppercase tracking-widest text-red/80 hover:text-red">Visual Builder</Link>
              <form action={deleteCollection.bind(null, c.id)}>
                <button className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-red">Delete</button>
              </form>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
