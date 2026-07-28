import { requireAdmin } from "@/lib/admin/auth";
import { setApplicationStatus } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red/10 text-red",
};

export default async function ApplicationsPage() {
  const { supabase } = await requireAdmin();
  const { data: apps } = await supabase
    .from("membership_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">Membership Applications</h1>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {(apps ?? []).length === 0 && (
          <p className="p-8 text-center text-gray-400 text-sm">No applications yet.</p>
        )}
        {(apps ?? []).map((a) => (
          <div key={a.id} className="px-5 py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {a.name}{" "}
                  <span className={`ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status] ?? ""}`}>
                    {a.status}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {a.email}
                  {a.department ? ` · ${a.department}` : ""}
                  {a.year_of_study ? ` · ${a.year_of_study}` : ""}
                </p>
                {a.motivation && <p className="text-sm text-gray-600 mt-2 max-w-2xl">{a.motivation}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={setApplicationStatus.bind(null, a.id, "approved")}>
                  <button className="text-xs font-bold uppercase tracking-widest text-green-700 hover:underline">Approve</button>
                </form>
                <form action={setApplicationStatus.bind(null, a.id, "rejected")}>
                  <button className="text-xs font-bold uppercase tracking-widest text-red hover:underline">Reject</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 max-w-2xl">
        Approving records the decision. To grant event-pricing benefits, flip the applicant&apos;s
        <strong> Member </strong> flag under <strong>Members</strong> once they have an account.
      </p>
    </div>
  );
}
