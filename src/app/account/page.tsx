import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

const IST = "Asia/Kolkata";
function fmt(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, is_member")
    .eq("id", user.id)
    .single();

  const { data: regs } = await supabase
    .from("event_registrations")
    .select("id, price_paid, attended, registered_at, events(title, event_date, category)")
    .eq("profile_id", user.id)
    .order("registered_at", { ascending: false });

  const isStaff = profile && ["admin", "owner"].includes(profile.role);

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-navy font-inter px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <span className="font-oswald uppercase tracking-[0.3em] text-red text-xs font-bold">My Account</span>
            <h1 className="font-oswald text-4xl font-bold uppercase mt-2">
              {profile?.full_name || profile?.email}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {profile?.is_member ? "Member" : "Not a member yet"} · role {profile?.role}
              {isStaff && <> · <Link href="/admin" className="text-red font-semibold">Admin panel</Link></>}
            </p>
          </div>
          <SignOutButton />
        </div>

        <h2 className="font-oswald text-xl font-bold uppercase mb-4">My registrations</h2>
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {(regs ?? []).length === 0 && (
            <p className="p-8 text-center text-gray-400 text-sm">
              No registrations yet. <Link href="/events" className="text-red">Browse events →</Link>
            </p>
          )}
          {(regs ?? []).map((r) => {
            const ev = r.events as unknown as { title: string; event_date: string | null; category: string } | null;
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ev?.title ?? "Event"}</p>
                  <p className="text-sm text-gray-500">{fmt(ev?.event_date ?? null)}</p>
                </div>
                <span className="text-sm text-gray-500">₹{Number(r.price_paid).toFixed(0)}</span>
                {r.attended && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Attended
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
