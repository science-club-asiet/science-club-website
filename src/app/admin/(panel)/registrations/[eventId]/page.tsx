import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { setAttendance } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { supabase } = await requireAdmin();

  const { data: event } = await supabase
    .from("events")
    .select("title, event_date")
    .eq("id", eventId)
    .single();
  if (!event) notFound();

  const { data: regs } = await supabase
    .from("event_registrations")
    .select("id, attended, price_paid, registered_at, profiles(full_name, email)")
    .eq("event_id", eventId)
    .order("registered_at", { ascending: true });

  const attendedCount = (regs ?? []).filter((r) => r.attended).length;

  return (
    <div>
      <Link href="/admin/events" className="text-xs font-semibold uppercase tracking-widest text-navy/50 hover:text-red">
        ← Events
      </Link>
      <div className="flex items-center justify-between gap-4 mt-3 mb-8">
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase">{event.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {(regs ?? []).length} registered · {attendedCount} attended
          </p>
        </div>
        <a
          href={`/api/admin/events/${eventId}/export`}
          className="bg-navy text-white px-5 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {(regs ?? []).length === 0 && (
          <p className="p-8 text-center text-gray-400 text-sm">No registrations yet.</p>
        )}
        {(regs ?? []).map((r) => {
          const p = r.profiles as unknown as { full_name: string | null; email: string | null } | null;
          return (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p?.full_name || p?.email || "—"}</p>
                {p?.full_name && <p className="text-sm text-gray-500 truncate">{p.email}</p>}
              </div>
              <span className="text-sm text-gray-500">₹{Number(r.price_paid).toFixed(0)}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${r.attended ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {r.attended ? "Attended" : "Registered"}
              </span>
              <form action={setAttendance.bind(null, eventId, r.id, !r.attended)}>
                <button className="text-xs font-bold uppercase tracking-widest text-navy/60 hover:text-red w-28 text-right">
                  {r.attended ? "Mark absent" : "Mark attended"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
