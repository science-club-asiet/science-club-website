import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type ExecomMemberCard = { name: string; role: string; bio: string; img: string };
export type TeamWithMembers = {
  id: string;
  label: string;
  name: string;
  tagline: string;
  description: string;
  members: ExecomMemberCard[];
};

// Shapes consumed by the /info/execom page.
export type ExecomMemberFull = {
  id: string;
  name: string;
  role: string;
  category: string;
  bio: string;
  img: string;
  email?: string;
  linkedin?: string;
};
export type PastExecomMember = { name: string; role: string; year: string; category: string; img: string };
export type CandidPhoto = { url: string; caption: string; tag: string };

const TEAM_CATEGORY: Record<string, string> = {
  core: "CORE LEADERSHIP",
  tech: "TECHNICAL LABS",
  media: "MEDIA & CREATIVE",
  events: "OPERATIONS & EVENTS",
};

async function getCurrentTerm(): Promise<string> {
  const sb = createPublicClient();
  const { data } = await sb.from("site_content").select("value").eq("key", "current_term").maybeSingle();
  return (data?.value as { term?: string } | null)?.term ?? "2025-26";
}

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%231e293b'/><circle cx='50' cy='38' r='20' fill='%2394a3b8'/><path d='M20 85 a30 30 0 0 1 60 0' fill='%2394a3b8'/></svg>";

/**
 * Teams with their current-term members, grouped for the home Execom carousel.
 */
export async function getTeamsWithMembers(): Promise<TeamWithMembers[]> {
  const sb = createPublicClient();

  const [{ data: teams, error }, currentTerm] = await Promise.all([
    sb.from("teams").select("*").order("sort_order"),
    getCurrentTerm(),
  ]);
  if (error) {
    console.error("[getTeamsWithMembers]", error.message);
    return [];
  }

  const { data: members } = await sb
    .from("execom_members")
    .select("*")
    .eq("term", currentTerm)
    .eq("is_published", true)
    .order("display_order");

  return (teams ?? []).map((t) => ({
    id: t.slug,
    label: t.label,
    name: t.name,
    tagline: t.tagline ?? "",
    description: t.description ?? "",
    members: (members ?? [])
      .filter((m) => m.team_slug === t.slug)
      .map((m) => ({
        name: m.name,
        role: m.position,
        bio: m.bio ?? "",
        img: m.photo_url && m.photo_url.trim() ? m.photo_url.trim() : DEFAULT_AVATAR,
      })),
  }));
}

/** Current-term execom, mapped to the /info/execom category grouping. */
export async function getCurrentExecom(): Promise<ExecomMemberFull[]> {
  const sb = createPublicClient();
  const term = await getCurrentTerm();
  const { data, error } = await sb
    .from("execom_members")
    .select("*")
    .eq("term", term)
    .eq("is_published", true)
    .order("display_order");
  if (error) {
    console.error("[getCurrentExecom]", error.message);
    return [];
  }
  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    role: m.position,
    category: TEAM_CATEGORY[m.team_slug ?? ""] ?? "CORE LEADERSHIP",
    bio: m.bio ?? "",
    img: m.photo_url && m.photo_url.trim() ? m.photo_url.trim() : DEFAULT_AVATAR,
    email: m.email ?? undefined,
    linkedin: m.linkedin ?? undefined,
  }));
}

/** Members from every past term (newest term first), for the term switcher. */
export async function getPastExecom(): Promise<PastExecomMember[]> {
  const sb = createPublicClient();
  const term = await getCurrentTerm();
  const { data, error } = await sb
    .from("execom_members")
    .select("*")
    .neq("term", term)
    .eq("is_published", true)
    .order("term", { ascending: false })
    .order("display_order");
  if (error) {
    console.error("[getPastExecom]", error.message);
    return [];
  }
  return (data ?? []).map((m) => ({
    name: m.name,
    role: m.position,
    year: m.term,
    category: m.team_slug === "core" ? "Core" : "Member",
    img: m.photo_url && m.photo_url.trim() ? m.photo_url.trim() : DEFAULT_AVATAR,
  }));
}

/** Candid photos for the execom hero canvas (from the "Execom Candids" album). */
export async function getCandidPhotos(): Promise<CandidPhoto[]> {
  const sb = createPublicClient();
  const { data: album } = await sb
    .from("media_albums")
    .select("id")
    .eq("title", "Execom Candids")
    .maybeSingle();
  if (!album) return [];

  const { data, error } = await sb
    .from("media_images")
    .select("*")
    .eq("album_id", album.id)
    .eq("is_published", true)
    .order("display_order");
  if (error) {
    console.error("[getCandidPhotos]", error.message);
    return [];
  }
  return (data ?? []).map((img) => {
    const cap = (img.caption as string) ?? "";
    const [caption, tag] = cap.split(" — ");
    return {
      url: img.image_url as string,
      caption: (caption ?? cap).toUpperCase(),
      tag: (tag ?? "").toUpperCase(),
    };
  });
}
