import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type NewsItem = {
  id: string;
  slug: string;
  tag: string;
  date: string;
  title: string;
  desc: string;
  img: string;
  breaking?: boolean;
};

const IST = "Asia/Kolkata";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const month = new Intl.DateTimeFormat("en-US", { timeZone: IST, month: "short" }).format(d).toUpperCase();
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: IST, day: "2-digit" }).format(d);
  return `${month} ${day}`;
}

/** Published posts of type 'news' → the NewsSection accordion shape. */
export async function getNews(): Promise<NewsItem[]> {
  const sb = createPublicClient();
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("type", "news")
    .eq("status", "published")
    .order("display_order");
  if (error) {
    console.error("[getNews]", error.message);
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id as string,
    slug: (p.slug as string) ?? "",
    tag: (p.tag as string) ?? "",
    date: fmtDate(p.published_at as string | null),
    title: p.title as string,
    desc: (p.excerpt as string) ?? "",
    img: (p.cover_image_url as string) ?? "",
    breaking: (p.breaking as boolean) ?? false,
  }));
}

export type PostSummary = {
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  tag: string;
  date: string;
};
export type PostFull = PostSummary & { body: string; blocks?: unknown[]; layout?: unknown };

function mapSummary(p: Record<string, unknown>): PostSummary {
  return {
    type: (p.type as string) ?? "news",
    title: p.title as string,
    slug: (p.slug as string) ?? "",
    excerpt: (p.excerpt as string) ?? "",
    cover: (p.cover_image_url as string) ?? "",
    tag: (p.tag as string) ?? "",
    date: fmtDate(p.published_at as string | null),
  };
}

/** All published posts (any type), newest first — for the /news index. */
export async function getPublishedPosts(): Promise<PostSummary[]> {
  const sb = createPublicClient();
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[getPublishedPosts]", error.message);
    return [];
  }
  return (data ?? []).map(mapSummary);
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  const sb = createPublicClient();
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return { ...mapSummary(data), body: (data.body as string) ?? "", blocks: (data.blocks as unknown[]) ?? [], layout: data.layout ?? null };
}
