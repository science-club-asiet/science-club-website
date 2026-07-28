import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type HeroContent = { badge?: string; title?: string };
export type MarqueeContent = { text?: string };
export type StatItem = { value: string; label: string };
export type AboutStatsContent = { stats?: StatItem[] };
export type Social = { github?: string; linkedin?: string; instagram?: string };
export type ContactContent = { email?: string; blurb?: string; socials?: Social };
export type LocationContent = { address?: string; hours?: string; maps_url?: string; embed_url?: string };
export type FooterColumn = { heading: string; links: string[] };
export type FooterContent = { columns?: FooterColumn[] };

export type SiteContent = {
  hero?: HeroContent;
  marquee?: MarqueeContent;
  about_stats?: AboutStatsContent;
  contact?: ContactContent;
  location?: LocationContent;
  footer?: FooterContent;
  current_term?: { term?: string };
};

/** All site_content singletons as a keyed object. */
export async function getSiteContent(): Promise<SiteContent> {
  const sb = createPublicClient();
  const { data, error } = await sb.from("site_content").select("key,value");
  if (error) {
    console.error("[getSiteContent]", error.message);
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const row of data ?? []) out[row.key as string] = row.value;
  return out as SiteContent;
}
