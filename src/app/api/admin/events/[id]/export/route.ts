import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function csvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * GET /api/admin/events/[id]/export
 * Headerless attendee CSV for docugen: name, event title, date, certificate id.
 * Only attended registrations are included; missing certificate ids are minted
 * and persisted on first export.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!prof || (prof.role !== "admin" && prof.role !== "owner")) {
    return new Response("Forbidden", { status: 403 });
  }

  const admin = createAdminClient();
  const { data: event } = await admin.from("events").select("title, event_date").eq("id", id).single();
  const { data: regs } = await admin
    .from("event_registrations")
    .select("id, certificate_id, profiles(full_name, email)")
    .eq("event_id", id)
    .eq("attended", true);

  const date = event?.event_date ? new Date(event.event_date).toISOString().slice(0, 10) : "";
  const lines: string[] = [];

  for (const r of regs ?? []) {
    let cert = r.certificate_id as string | null;
    if (!cert) {
      cert = `SC-${new Date().getFullYear()}-${String(r.id).slice(0, 8).toUpperCase()}`;
      await admin.from("event_registrations").update({ certificate_id: cert }).eq("id", r.id);
    }
    const p = r.profiles as unknown as { full_name: string | null; email: string | null } | null;
    const name = p?.full_name || p?.email || "";
    lines.push([name, event?.title ?? "", date, cert].map(csvCell).join(","));
  }

  const filename = `${(event?.title ?? "event").toLowerCase().replace(/\s+/g, "-")}-attendees.csv`;
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
