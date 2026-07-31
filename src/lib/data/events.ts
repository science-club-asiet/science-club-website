import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { ScienceEvent, EventType, EventStatus, AgendaItem } from "@/lib/events";
import type { Block } from "@/lib/blocks/types";

const IST = "Asia/Kolkata";

function istParts(iso: string) {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("en-GB", { timeZone: IST, day: "2-digit" }).format(d),
    month: new Intl.DateTimeFormat("en-US", { timeZone: IST, month: "short" }).format(d).toUpperCase(),
    year: new Intl.DateTimeFormat("en-US", { timeZone: IST, year: "numeric" }).format(d),
    time: new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "2-digit", minute: "2-digit", hour12: true }).format(d).toUpperCase(),
  };
}

/** DB row → the ScienceEvent shape the UI components already consume. */
function mapRow(r: Record<string, unknown>): ScienceEvent {
  const iso = r.event_date as string | null;
  const p = iso ? istParts(iso) : null;
  const status: EventStatus =
    iso && new Date(iso).getTime() > Date.now() ? "UPCOMING" : "COMPLETED";
  const agenda = r.agenda as AgendaItem[] | null;
  const prereqs = r.prerequisites as string[] | null;

  return {
    id: r.id as string,
    title: r.title as string,
    dateDay: p?.day ?? "",
    dateMonth: p?.month ?? "",
    dateYear: p?.year,
    type: String(r.category ?? "talk").toUpperCase() as EventType,
    status,
    img: (r.cover_image_url as string) ?? "",
    description: (r.description as string) ?? "",
    speaker: (r.speaker as string) ?? undefined,
    speakerRole: (r.speaker_role as string) ?? undefined,
    location: (r.location as string) ?? undefined,
    time: p?.time,
    memberPrice: Number(r.member_price ?? 0),
    nonMemberPrice: Number(r.non_member_price ?? 0),
    seatsRemaining: (r.seats_remaining as number) ?? undefined,
    agenda: Array.isArray(agenda) && agenda.length ? agenda : undefined,
    prerequisites: Array.isArray(prereqs) && prereqs.length ? prereqs : undefined,
  };
}

/**
 * All published events, ordered the way the UI expects: upcoming events first
 * (soonest first), then past events (most recent first).
 */
export async function getEvents(): Promise<ScienceEvent[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("events").select("*").eq("is_published", true);
  if (error) {
    console.error("[getEvents]", error.message);
    return [];
  }

  const now = Date.now();
  const rows = (data ?? []).slice().sort((a, b) => {
    const da = new Date(a.event_date as string).getTime();
    const db = new Date(b.event_date as string).getTime();
    const au = da > now;
    const bu = db > now;
    if (au && bu) return da - db; // both upcoming → soonest first
    if (!au && !bu) return db - da; // both past → most recent first
    return au ? -1 : 1; // upcoming before past
  });

  return rows.map(mapRow);
}

/** A single published event + its block tree, for the public /events/[slug] page. */
export async function getEventPage(slug: string): Promise<{ event: ScienceEvent; blocks: Block[]; layout?: unknown; nexus_data?: unknown } | null> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("events").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error || !data) return null;
  return { event: mapRow(data), blocks: Array.isArray(data.blocks) ? (data.blocks as Block[]) : [], layout: data.layout ?? null, nexus_data: data.nexus_data ?? null };
}
