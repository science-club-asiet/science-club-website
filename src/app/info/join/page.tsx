import { JoinView } from "./JoinView";
import { getPerks, getFaqs } from "@/lib/data/content";

export const revalidate = 300;

export default async function JoinPage() {
  const [perks, faqs] = await Promise.all([getPerks(), getFaqs()]);
  return <JoinView perks={perks} faqs={faqs} />;
}
