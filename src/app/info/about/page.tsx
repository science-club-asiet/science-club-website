import { AboutView } from "./AboutView";
import { getStoryEras } from "@/lib/data/content";
import { getSiteContent } from "@/lib/data/site";

export const revalidate = 300;

export default async function AboutPage() {
  const [storyEras, site] = await Promise.all([getStoryEras(), getSiteContent()]);
  return <AboutView storyEras={storyEras} stats={site.about_stats?.stats ?? []} />;
}
