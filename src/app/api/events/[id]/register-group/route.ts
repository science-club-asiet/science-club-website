import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ParticipantInput = {
  memberId?: string;
  fullName: string;
  email: string;
};

/**
 * POST /api/events/[id]/register-group
 * Registers one or more participants for an event. Dynamically checks membership
 * status of each participant by Member ID to compute exact total prices server-side.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { participants?: ParticipantInput[]; utrNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const participants = body.participants || [];
  const utrNumber = body.utrNumber?.trim() || "";

  if (participants.length === 0) {
    return NextResponse.json({ error: "no_participants" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  // Fetch event details
  const { data: event } = await admin
    .from("events")
    .select("id, title, member_price, non_member_price, is_published, status, seats_remaining, allowed_departments, allowed_years")
    .eq("id", id)
    .single();

  if (!event || !event.is_published || event.status === "closed" || event.status === "finished") {
    return NextResponse.json({ error: "event_unavailable" }, { status: 400 });
  }

  const memberPrice = Number(event.member_price ?? 0);
  const nonMemberPrice = Number(event.non_member_price ?? 0);
  const allowedDepts = Array.isArray(event.allowed_departments) ? (event.allowed_departments as string[]) : [];
  const allowedYears = Array.isArray(event.allowed_years) ? (event.allowed_years as string[]) : [];

  const registeredUsers: Array<{ profileId: string; pricePaid: number; memberId: string }> = [];
  const guestUsers: Array<{ fullName: string; email: string; pricePaid: number }> = [];

  let grandTotal = 0;

  // Process each participant
  for (const p of participants) {
    let resolvedProfile: { id: string; is_member: boolean; member_id: string; department?: string; year_of_study?: string } | null = null;

    if (p.memberId?.trim()) {
      const normId = p.memberId.trim().toUpperCase();
      const { data: prof } = await admin
        .from("profiles")
        .select("id, is_member, member_id, department, year_of_study")
        .or(`member_id.ilike.${normId},id.eq.${p.memberId.trim()}`)
        .maybeSingle();

      if (prof) {
        resolvedProfile = prof;
      }
    } else if (user && registeredUsers.length === 0) {
      // First slot fallback to current logged-in user if no explicit memberId was typed
      const { data: prof } = await admin
        .from("profiles")
        .select("id, is_member, member_id, department, year_of_study")
        .eq("id", user.id)
        .maybeSingle();

      if (prof) {
        resolvedProfile = prof;
      }
    }

    // Check Department Restriction
    if (allowedDepts.length > 0) {
      const pDept = (resolvedProfile?.department || "").trim().toLowerCase();
      const isDeptOk = allowedDepts.some((d) => {
        const dNorm = d.trim().toLowerCase();
        return pDept === dNorm || pDept.includes(dNorm) || dNorm.includes(pDept);
      });

      if (!isDeptOk) {
        return NextResponse.json({
          error: `${p.fullName || "Participant"} is ineligible. This event is exclusive to: ${allowedDepts.join(", ")}`,
        }, { status: 400 });
      }
    }

    // Check Year Restriction
    if (allowedYears.length > 0) {
      const pYear = (resolvedProfile?.year_of_study || "").trim().toLowerCase();
      const isYearOk = allowedYears.some((y) => {
        const yNorm = y.trim().toLowerCase();
        return pYear === yNorm || pYear.includes(yNorm) || yNorm.includes(pYear);
      });

      if (!isYearOk) {
        return NextResponse.json({
          error: `${p.fullName || "Participant"} is ineligible. This event is exclusive to: ${allowedYears.join(", ")}`,
        }, { status: 400 });
      }
    }

    if (resolvedProfile) {
      const price = resolvedProfile.is_member ? memberPrice : nonMemberPrice;
      grandTotal += price;
      registeredUsers.push({
        profileId: resolvedProfile.id,
        pricePaid: price,
        memberId: resolvedProfile.member_id || p.memberId || "",
      });
    } else {
      const price = nonMemberPrice;
      grandTotal += price;
      guestUsers.push({
        fullName: p.fullName,
        email: p.email,
        pricePaid: price,
      });
    }
  }

  // Insert event_registrations rows for all resolved profiles
  const insertedIds: string[] = [];
  for (const reg of registeredUsers) {
    const { data, error } = await admin
      .from("event_registrations")
      .upsert(
        {
          event_id: id,
          profile_id: reg.profileId,
          price_paid: reg.pricePaid,
          form_data: {
            utr_number: utrNumber,
            group_registration: true,
            total_group_participants: participants.length,
            grand_total: grandTotal,
            guests: guestUsers,
          },
        },
        { onConflict: "event_id,profile_id" }
      )
      .select("id")
      .single();

    if (!error && data) {
      insertedIds.push(data.id);
    }
  }

  // Decrement remaining seats if tracked
  if (typeof event.seats_remaining === "number" && event.seats_remaining > 0) {
    const newSeats = Math.max(0, event.seats_remaining - participants.length);
    await admin.from("events").update({ seats_remaining: newSeats }).eq("id", id);
  }

  return NextResponse.json({
    status: "ok",
    totalPaid: grandTotal,
    registeredCount: registeredUsers.length,
    guestCount: guestUsers.length,
    registrationIds: insertedIds,
  });
}
