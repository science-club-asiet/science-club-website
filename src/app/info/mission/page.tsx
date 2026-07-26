"use client";

import { MissionHero } from "@/components/mission/MissionHero";
import { ManifestoStatement } from "@/components/mission/ManifestoStatement";
import { CorePillars } from "@/components/mission/CorePillars";
import { StrategicGoals } from "@/components/mission/StrategicGoals";
import { ImpactStories } from "@/components/mission/ImpactStories";
import { MissionCta } from "@/components/mission/MissionCta";

export default function MissionPage() {
  return (
    <div className="font-inter text-navy bg-white">
      <MissionHero />
      <ManifestoStatement />
      <CorePillars />
      <StrategicGoals />
      <ImpactStories />
      <MissionCta />
    </div>
  );
}
