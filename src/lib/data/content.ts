import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type Pillar = { num: string; icon: string; title: string; short: string; detail: string; image: string; tag: string };
export type Goal = { targetYear: string; title: string; description: string; status: string; progress: number; category: string; image: string };
export type Story = { quote: string; author: string; role: string; tag: string; image: string };
export type StoryEra = { year: string; title: string; desc: string; img: string };
export type Faq = { q: string; a: string };
export type Achievement = { title: string; subtitle: string; icon: string };

export async function getPillars(): Promise<Pillar[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("pillars").select("*").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getPillars]", error.message); return []; }
  return (data ?? []).map((p) => ({
    num: p.num, icon: p.icon ?? "", title: p.title, short: p.short ?? "",
    detail: p.detail ?? "", image: p.image ?? "", tag: p.tag ?? "",
  }));
}

export async function getGoals(): Promise<Goal[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("goals").select("*").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getGoals]", error.message); return []; }
  return (data ?? []).map((g) => ({
    targetYear: g.target_year ?? "", title: g.title, description: g.description ?? "",
    status: g.status ?? "", progress: g.progress ?? 0, category: g.category ?? "", image: g.image ?? "",
  }));
}

export async function getImpactStories(): Promise<Story[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("impact_stories").select("*").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getImpactStories]", error.message); return []; }
  return (data ?? []).map((s) => ({
    quote: s.quote, author: s.author, role: s.role ?? "", tag: s.tag ?? "", image: s.image ?? "",
  }));
}

export async function getStoryEras(): Promise<StoryEra[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("story_eras").select("*").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getStoryEras]", error.message); return []; }
  return (data ?? []).map((e) => ({
    year: e.year, title: e.title, desc: e.description ?? "", img: e.img ?? "",
  }));
}

export async function getPerks(): Promise<string[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("perks").select("text,sort_order").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getPerks]", error.message); return []; }
  return (data ?? []).map((p) => p.text as string);
}

export async function getFaqs(): Promise<Faq[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("faqs").select("*").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getFaqs]", error.message); return []; }
  return (data ?? []).map((f) => ({ q: f.question, a: f.answer }));
}

export async function getAchievements(): Promise<Achievement[]> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("achievements").select("*").eq("is_published", true).order("sort_order");
  if (error) { console.error("[getAchievements]", error.message); return []; }
  return (data ?? []).map((a) => ({ title: a.title, subtitle: a.subtitle ?? "", icon: a.icon ?? "" }));
}
