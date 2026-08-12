import Link from "next/link";
import { getSessionProfile } from "@/lib/admin/auth";
import { Calendar, ClipboardList, Plus, ArrowRight, type LucideIcon } from "lucide-react";
import { Card, EmptyState, btnGhostCls } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

const IST = "Asia/Kolkata";
const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: IST, day: "2-digit", month: "short" }).format(new Date(iso));

function Panel({ title, href, icon: Icon, count, children }: {
  title: string; href: string; icon: LucideIcon; count: number; children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
        <Icon className="w-4 h-4 text-navy/45" />
        <h2 className="font-oswald text-sm font-bold uppercase tracking-wide">{title}</h2>
        {count > 0 && <span className="text-[10px] font-bold bg-red/10 text-red rounded-full px-2 py-0.5">{count}</span>}
        <Link href={href} className="ml-auto text-navy/35 hover:text-red transition-colors"><ArrowRight className="w-4 h-4" /></Link>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </Card>
  );
}
function Row({ title, sub, right }: { title: string; sub?: string; right?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
      {right && <span className="text-xs text-gray-400 shrink-0">{right}</span>}
    </div>
  );
}

export default async function Home() {
  const { profile, supabase } = await getSessionProfile();
  const nowIso = new Date().toISOString();

  const [upcoming, draftPosts, draftEvents] = await Promise.all([
    supabase.from("events").select("id, title, event_date").gt("event_date", nowIso).order("event_date", { ascending: true }).limit(5),
    supabase.from("posts").select("id, title").eq("status", "draft").limit(4),
    supabase.from("events").select("id, title").eq("is_published", false).limit(4),
  ]);

  const events = upcoming.data ?? [];
  const drafts = [
    ...(draftPosts.data ?? []).map((d) => ({ id: d.id, title: d.title, type: "Post" })),
    ...(draftEvents.data ?? []).map((d) => ({ id: d.id, title: d.title, type: "Event" })),
  ];
  const firstName = profile?.full_name?.split(" ")[0];
  const quick: [string, string][] = [
    ["Event", "/admin/events/new"], ["Post", "/admin/posts/new"],
    ["Form", "/admin/forms/new"], ["Page", "/admin/pages"],
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-oswald text-3xl font-bold uppercase tracking-tight">Good to see you{firstName ? `, ${firstName}` : ""}</h1>
      <p className="text-gray-500 text-sm mt-1 mb-7">Here&apos;s what needs your attention.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {quick.map(([label, href]) => (
          <Link key={href} href={href} className={btnGhostCls}><Plus className="w-3.5 h-3.5" /> {label}</Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Upcoming events" href="/admin/events" icon={Calendar} count={events.length}>
          {events.length === 0 ? <div className="p-3"><EmptyState title="No upcoming events" /></div> :
            events.map((e) => <Row key={e.id} title={e.title} right={fmt(e.event_date)} />)}
        </Panel>
        <Panel title="Drafts to finish" href="/admin/posts" icon={ClipboardList} count={drafts.length}>
          {drafts.length === 0 ? <div className="p-3"><EmptyState title="No drafts" /></div> :
            drafts.map((d) => <Row key={d.type + d.id} title={d.title} sub={d.type} right="Draft" />)}
        </Panel>
      </div>
    </div>
  );
}
