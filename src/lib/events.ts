// View-model types for events. The DB rows (see supabase/) are mapped into this
// shape by src/lib/data/events.ts, so the presentational components stay
// unchanged. `type` mirrors the DB `event_category`; `status` is derived from
// `event_date` at read time.

export type EventType = "TALK" | "WORKSHOP" | "GAME" | "TRIP";
export type EventStatus = "UPCOMING" | "COMPLETED";

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
}

export interface EventWinner {
  rank: string;
  name: string;
  prize?: string;
}

export interface ScienceEvent {
  id: string;
  title: string;
  dateDay: string;
  dateMonth: string;
  dateYear?: string;
  type: EventType;
  status: EventStatus;
  img: string;
  description: string;
  speaker?: string;
  speakerRole?: string;
  location?: string;
  time?: string;
  memberPrice?: number;
  nonMemberPrice?: number;
  seatsRemaining?: number;
  agenda?: AgendaItem[];
  prerequisites?: string[];
  opStatus?: "open" | "closed" | "finished" | "draft";
  galleryImages?: string[];
  registrationFormId?: string | null;
  formSlug?: string | null;
  externalWebsiteUrl?: string;
  winners?: EventWinner[];
  requiresRegistration?: boolean;
  hasPricing?: boolean;
  customMetadata?: Record<string, string>;
  allowedDepartments?: string[];
  allowedYears?: string[];
}

export function formatEventPricingDisplay(event: {
  hasPricing?: boolean;
  requiresRegistration?: boolean;
  memberPrice?: number | null;
  nonMemberPrice?: number | null;
}): { showPricing: boolean; isFree: boolean; text: string } {
  if (event.hasPricing === false || event.requiresRegistration === false) {
    return { showPricing: false, isFree: false, text: "" };
  }
  if (event.memberPrice === null || event.memberPrice === undefined) {
    return { showPricing: false, isFree: false, text: "" };
  }
  const m = event.memberPrice ?? 0;
  const nm = event.nonMemberPrice ?? 0;
  if (m === 0 && nm === 0) {
    return { showPricing: true, isFree: true, text: "Free Entry" };
  }
  const mStr = m === 0 ? "Free" : `₹${m}`;
  const nmStr = nm === 0 ? "Free" : `₹${nm}`;
  return {
    showPricing: true,
    isFree: false,
    text: `Member: ${mStr} • Non: ${nmStr}`,
  };
}

export function formatCategoryDisplayName(raw?: string | null): string {
  if (!raw) return "General";
  const upper = raw.toUpperCase().trim();
  const MAP: Record<string, string> = {
    TRIP: "Field Trips & Expeditions",
    GAME: "Gaming & Competitions",
    TALK: "Guest Talks & Seminars",
    WORKSHOP: "Hands-on Workshops",
    HACKATHON: "Hackathons & Builds",
    EXHIBITION: "Exhibitions & Fairs",
    SYMPOSIUM: "Symposiums",
    MEETUP: "Community Meetups",
  };
  if (MAP[upper]) return MAP[upper];
  return raw
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getCategoryFieldLabels(category?: string) {
  const cat = (category || "").toLowerCase().trim();
  if (cat === "trip") {
    return {
      speakerLabel: "Departure & Logistics",
      speakerRoleLabel: "Faculty Coordinators",
      speakerShortLabel: "Departure",
    };
  }
  if (cat === "game" || cat === "hackathon") {
    return {
      speakerLabel: "Host / Coordinator",
      speakerRoleLabel: "Coordinator Role / Judge",
      speakerShortLabel: "Host",
    };
  }
  return {
    speakerLabel: "Speaker / Host",
    speakerRoleLabel: "Speaker Designation",
    speakerShortLabel: "Speaker",
  };
}
