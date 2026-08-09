import { createClient } from "@/lib/supabase/server";
import MemberList, { MemberRow } from "@/components/admin/members/MemberList";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = await createClient();
  
  // Fetch members profiles and attended registrations in parallel
  const [{ data: members }, { data: attendedRegs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, department, year_of_study, role, is_member, tags, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("event_registrations")
      .select("user_id")
      .eq("attended", true),
  ]);

  const attendedCounts = (attendedRegs ?? []).reduce((acc: Record<string, number>, reg) => {
    acc[reg.user_id] = (acc[reg.user_id] || 0) + 1;
    return acc;
  }, {});

  // Map to the MemberRow shape
  type SupabaseProfile = { id: string; full_name: string | null; email: string; department: string | null; year_of_study: string | null; role: string; is_member: boolean; tags: string[] | null };
  const memberRows: MemberRow[] = (members ?? []).map((m: SupabaseProfile) => ({
    id: m.id,
    full_name: m.full_name,
    email: m.email,
    department: m.department,
    year_of_study: m.year_of_study,
    role: m.role,
    is_member: m.is_member,
    tags: m.tags || [],
    events_attended: attendedCounts[m.id] || 0
  }));

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-2">Members</h1>
      <p className="text-gray-500 text-sm mb-8">
        Manage members, view participation, and assign roles.
      </p>

      <MemberList members={memberRows} />
    </div>
  );
}
