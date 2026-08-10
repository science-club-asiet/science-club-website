import { ExecomView } from "./ExecomView";
import { getCurrentExecom, getPastExecom, getCandidPhotos, getCurrentTerm, getExecomCategories } from "@/lib/data/execom";
import { getAchievements } from "@/lib/data/content";

export const revalidate = 300;

export default async function ExecomPage() {
  const [members, pastExecom, candidPhotos, achievements, currentTerm, categories] = await Promise.all([
    getCurrentExecom(),
    getPastExecom(),
    getCandidPhotos(),
    getAchievements(),
    getCurrentTerm(),
    getExecomCategories(),
  ]);

  return (
    <ExecomView
      members={members}
      categories={categories}
      pastExecom={pastExecom}
      candidPhotos={candidPhotos}
      achievements={achievements}
      currentTerm={currentTerm}
    />
  );
}
