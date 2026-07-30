import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const GROUPS: { title: string; items: [string, string, string][] }[] = [
  { title: "Global", items: [
    ["Site content", "Hero, marquee, contact, location, footer, term", "/admin/site"],
    ["Teams", "Home Execom carousel headers", "/admin/teams"],
  ]},
  { title: "Mission page", items: [
    ["Pillars", "Core Pillars", "/admin/pillars"],
    ["Goals", "Strategic Goals", "/admin/goals"],
    ["Stories", "Impact stories", "/admin/impact_stories"],
  ]},
  { title: "About page", items: [["Timeline", "Story eras", "/admin/story_eras"]] },
  { title: "Join page", items: [
    ["Perks", "Member benefits", "/admin/perks"],
    ["FAQs", "Join FAQs", "/admin/faqs"],
  ]},
  { title: "Execom page", items: [["Achievements", "Awards & milestones", "/admin/achievements"]] },
];

export default async function WebsitePage() {
  await requireAdmin();
  return (
    <div className="max-w-4xl">
      <h1 className="font-oswald text-3xl font-bold uppercase">Website</h1>
      <p className="text-gray-500 text-sm mt-1 mb-8">Everything that renders on the public site.</p>

      <div className="space-y-8">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">{g.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.items.map(([label, sub, href]) => (
                <Link key={href} href={href} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-red transition-colors">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
