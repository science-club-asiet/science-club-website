import { ExecomView } from "./ExecomView";
import { getCurrentExecom, getPastExecom, getCandidPhotos } from "@/lib/data/execom";
import { getAchievements } from "@/lib/data/content";

export const revalidate = 300;

export default async function ExecomPage() {
  const [members, pastExecom, candidPhotos, achievements] = await Promise.all([
    getCurrentExecom(),
    getPastExecom(),
    getCandidPhotos(),
    getAchievements(),
  ]);

  return (
    <ExecomView
      members={members}
      pastExecom={pastExecom}
      candidPhotos={candidPhotos}
      achievements={achievements}
    />
  );
}
