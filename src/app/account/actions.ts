"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type MembershipSettings = {
  membership_fee: number;
  upi_id: string;
  upi_name: string;
};

const DEFAULT_SETTINGS: MembershipSettings = {
  membership_fee: 299,
  upi_id: "scienceclub@okaxis",
  upi_name: "Science Club ASIET",
};

/**
 * Fetches dynamic membership fee and payment settings from site_content.
 */
export async function getMembershipSettings(): Promise<MembershipSettings> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_content")
      .select("value")
      .eq("key", "membership_settings")
      .single();

    if (data?.value && typeof data.value === "object") {
      const val = data.value as Record<string, unknown>;
      return {
        membership_fee: Number(val.membership_fee ?? DEFAULT_SETTINGS.membership_fee),
        upi_id: String(val.upi_id ?? DEFAULT_SETTINGS.upi_id),
        upi_name: String(val.upi_name ?? DEFAULT_SETTINGS.upi_name),
      };
    }
  } catch (err) {
    console.error("[getMembershipSettings]", err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Upgrades the authenticated user to a Paid Member (is_member = true).
 * Uses the admin service-role client to bypass RLS column update restrictions.
 */
export async function upgradeToPaidMembershipAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthenticated" };
  }

  const admin = createAdminClient();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const { error } = await admin
    .from("profiles")
    .update({
      is_member: true,
      membership_expires_at: oneYearFromNow.toISOString().split("T")[0],
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
