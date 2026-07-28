import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/events/[id]/register
 * Registers the logged-in user for an event. The price is computed HERE from
 * profiles.is_member — never trusted from the client — and written with the
 * service-role client (direct client inserts into event_registrations are
 * blocked by RLS for exactly this reason).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const admin = createAdminClient();
  const [{ data: event }, { data: profile }] = await Promise.all([
    admin.from("events").select("id, member_price, non_member_price, is_published, event_date").eq("id", id).single(),
    admin.from("profiles").select("is_member").eq("id", user.id).single(),
  ]);

  if (!event || !event.is_published) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (event.event_date && new Date(event.event_date).getTime() < Date.now()) {
    return NextResponse.json({ error: "closed" }, { status: 409 });
  }

  const price = profile?.is_member ? Number(event.member_price) : Number(event.non_member_price);

  const { error } = await admin.from("event_registrations").insert({
    event_id: id,
    profile_id: user.id,
    price_paid: price,
  });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ status: "already" });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ status: "ok", price });
}
