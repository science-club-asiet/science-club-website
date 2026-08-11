import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountClient, type ProfileData, type RegistrationData } from "./AccountClient";
import { getMembershipSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: regs }, settings] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, department, year_of_study, role, is_member, member_id, membership_expires_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("event_registrations")
      .select("id, price_paid, attended, certificate_id, registered_at, events(title, event_date, category)")
      .eq("profile_id", user.id)
      .order("registered_at", { ascending: false }),
    getMembershipSettings(),
  ]);

  return (
    <AccountClient
      profile={(profile as ProfileData) ?? null}
      registrations={(regs as unknown as RegistrationData[]) ?? []}
      settings={settings}
    />
  );
}
