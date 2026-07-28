import { requireAdmin } from "@/lib/admin/auth";
import { setMembership, setRole } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

const ROLES = ["member", "execom", "admin", "owner"];

export default async function MembersPage() {
  const { supabase, profile } = await requireAdmin();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  const isOwner = profile?.role === "owner";

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-2">Members</h1>
      <p className="text-gray-500 text-sm mb-8">
        {isOwner ? "You can change roles and membership." : "You can toggle membership; only the owner changes roles."}
      </p>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {(members ?? []).map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-[180px]">
              <p className="font-medium">{m.full_name || "—"}</p>
              <p className="text-sm text-gray-500 truncate">{m.email}</p>
            </div>

            {isOwner ? (
              <form action={setRole.bind(null, m.id)} className="flex items-center gap-2">
                <select name="role" defaultValue={m.role} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button className="text-xs font-bold uppercase tracking-widest text-navy/60 hover:text-red">Set</button>
              </form>
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 w-20">{m.role}</span>
            )}

            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${m.is_member ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {m.is_member ? "Member" : "Not member"}
            </span>

            <form action={setMembership.bind(null, m.id, !m.is_member)}>
              <button className="text-xs font-bold uppercase tracking-widest text-navy/60 hover:text-red w-28 text-right">
                {m.is_member ? "Revoke" : "Make member"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
