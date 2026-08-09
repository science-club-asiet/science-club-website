import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPage, deletePage, setPagePublished } from "@/lib/admin/pageActions";
import { PageHeader, Card, EmptyState, inputCls, btnPrimaryCls, rowLinkCls, badgeCls } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function PagesAdmin() {
  const supabase = await createClient();
  const { data: pages, error } = await supabase.from("pages").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Pages" subtitle="Build any page visually — content, form fields and live sections (Execom, Events, News)." />

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm p-4 mb-6">
          Run migration <code className="font-mono">0008_puck_layout.sql</code> in Supabase to enable Pages.
        </div>
      )}

      <Card className="p-4 mb-6">
        <form action={createPage} className="flex flex-wrap gap-2">
          <input name="title" required placeholder="New page title" className={`${inputCls} flex-1 min-w-[220px]`} />
          <input name="slug" placeholder="slug (optional)" className={`${inputCls} sm:w-44`} />
          <button className={btnPrimaryCls}>Create &amp; design</button>
        </form>
      </Card>

      <Card>
        {(pages ?? []).length === 0 ? (
          <div className="p-2"><EmptyState title="No pages yet" hint="Create one above to start building." /></div>
        ) : (pages ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors">
            <div className="flex-1 min-w-[160px]">
              <p className="font-medium truncate">{p.title}</p>
              <p className="text-xs text-gray-400 font-mono">/p/{p.slug}</p>
            </div>
            <span className={badgeCls(p.is_published)}>{p.is_published ? "Published" : "Draft"}</span>
            <form action={setPagePublished.bind(null, p.id, !p.is_published)}>
              <button className={rowLinkCls}>{p.is_published ? "Unpublish" : "Publish"}</button>
            </form>
            <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className={rowLinkCls}>View</a>
            <Link href={`/admin/pagebuilder/page/${p.id}`} className="text-xs font-bold uppercase tracking-widest text-red hover:underline">Design</Link>
            <form action={deletePage.bind(null, p.id)}>
              <button className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-red">Delete</button>
            </form>
          </div>
        ))}
      </Card>
    </div>
  );
}
