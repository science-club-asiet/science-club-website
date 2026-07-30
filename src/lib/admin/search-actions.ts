"use server";

import { requireAdmin } from "./auth";

export type SearchResult = {
  id: string;
  label: string;
  group: "Events" | "Posts" | "Members";
  href: string;
};

export async function searchAdmin(query: string): Promise<SearchResult[]> {
  const { supabase } = await requireAdmin();
  const q = query.trim();
  if (!q) return [];

  // Search Events
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .ilike("title", `%${q}%`)
    .limit(3);

  // Search Posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title")
    .ilike("title", `%${q}%`)
    .limit(3);

  // Search Members (profiles)
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name")
    .ilike("full_name", `%${q}%`)
    .limit(3);

  const results: SearchResult[] = [];

  if (events) {
    events.forEach(e => {
      results.push({ id: `ev-${e.id}`, label: e.title, group: "Events", href: `/admin/events/${e.id}` });
    });
  }
  
  if (posts) {
    posts.forEach(p => {
      results.push({ id: `po-${p.id}`, label: p.title, group: "Posts", href: `/admin/posts/${p.id}` });
    });
  }
  
  if (members) {
    members.forEach(m => {
      results.push({ id: `mem-${m.id}`, label: m.full_name || "Unknown", group: "Members", href: `/admin/members/${m.id}` });
    });
  }

  return results;
}
