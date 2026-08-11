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
  customMetadata?: Record<string, string>;
  allowedDepartments?: string[];
  allowedYears?: string[];
}
