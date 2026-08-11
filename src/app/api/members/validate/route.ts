import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/members/validate?id=SC-2026-12345
 * Validates a given Member ID (or profile UUID) and returns safe profile details
 * for event registration autofill and dynamic pricing calculation.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id")?.trim();

  if (!rawId) {
    return NextResponse.json({ success: false, error: "missing_id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const normalizedId = rawId.toUpperCase();

  // Search by member_id or profile UUID
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, full_name, email, department, year_of_study, is_member, member_id")
    .or(`member_id.ilike.${normalizedId},id.eq.${rawId}`)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: profile.id,
      memberId: profile.member_id || normalizedId,
      fullName: profile.full_name || "",
      email: profile.email || "",
      department: profile.department || "",
      yearOfStudy: profile.year_of_study || "",
      isMember: Boolean(profile.is_member),
    },
  });
}
