import { MissionHero } from "@/components/mission/MissionHero";
import { ManifestoStatement } from "@/components/mission/ManifestoStatement";
import { CorePillars } from "@/components/mission/CorePillars";
import { StrategicGoals } from "@/components/mission/StrategicGoals";
import { ImpactStories } from "@/components/mission/ImpactStories";
import { MissionCta } from "@/components/mission/MissionCta";
import { getPillars, getGoals, getImpactStories } from "@/lib/data/content";

export const revalidate = 300;

export default async function MissionPage() {
  const [pillars, goals, stories] = await Promise.all([
    getPillars(),
    getGoals(),
    getImpactStories(),
  ]);

  return (
    <div className="font-inter text-navy bg-white">
      <MissionHero />
      <ManifestoStatement />
      <CorePillars pillars={pillars} />
      <StrategicGoals goals={goals} />
      <ImpactStories stories={stories} />
      <MissionCta />
    </div>
  );
}
