import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const IST = "Asia/Kolkata";
function fmt(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: form } = await supabase.from("forms").select("title").eq("id", id).single();
  if (!form) notFound();

  const { data: subs } = await supabase
    .from("form_submissions")
    .select("id, data, created_at")
    .eq("form_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href={`/admin/forms/${id}`} className="text-xs font-semibold uppercase tracking-widest text-navy/50 hover:text-red">← {form.title}</Link>
      <h1 className="font-oswald text-3xl font-bold uppercase mt-3 mb-2">Submissions</h1>
      <p className="text-gray-500 text-sm mb-8">{(subs ?? []).length} total</p>

      <div className="space-y-3">
        {(subs ?? []).length === 0 && <p className="text-gray-400 text-sm">No submissions yet.</p>}
        {(subs ?? []).map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-400 mb-3">{fmt(s.created_at)}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {Object.entries((s.data as Record<string, unknown>) ?? {}).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{k}</dt>
                  <dd className="text-navy break-words">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
