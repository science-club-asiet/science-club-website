import { requireAdmin } from "@/lib/admin/auth";
import MemberList, { MemberRow } from "@/components/admin/members/MemberList";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { supabase } = await requireAdmin();
  
  // Fetch profiles with a count of attended event registrations
  // Using an inner join to only count attended ones for each profile
  const { data: members } = await supabase
    .from("profiles")
    .select(`
      *,
      event_registrations (count)
    `)
    // Normally we'd do a filtered join `.eq('event_registrations.attended', true)`
    // but PostgREST syntax for filtered joins isn't straightforward in standard select().
    // So we'll fetch all registrations and filter in JS if needed, or if we just
    // want all registrations we can use the count. Let's fetch the data directly.
    .order("created_at", { ascending: true });

  // A safer approach that strictly gets "attended" events is a secondary query or
  // just fetching all registrations and grouping by user. Since it's a CRM, 
  // let's fetch all attended registrations to be exact.
  const { data: attendedRegs } = await supabase
    .from("event_registrations")
    .select("user_id")
    .eq("attended", true);

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
