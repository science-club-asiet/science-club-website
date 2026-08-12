import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { EventCenter } from "@/components/EventCenter";
import { NewsSection } from "@/components/NewsSection";
import { AboutSection } from "@/components/AboutSection";
import { ExecomSection } from "@/components/ExecomSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { MapSection } from "@/components/MapSection";
import { ContactSection } from "@/components/ContactSection";
import { getEvents } from "@/lib/data/events";
import { getTeamsWithMembers } from "@/lib/data/execom";
import { getNews } from "@/lib/data/posts";
import { getSiteContent } from "@/lib/data/site";

// ISR: revalidate the cached page every 5 minutes. Admin edits will trigger
// on-demand revalidation once the admin panel lands.
export const revalidate = 300;

export default async function Home() {
  const [events, teams, news, site] = await Promise.all([
    getEvents(),
    getTeamsWithMembers(),
    getNews(),
    getSiteContent(),
  ]);

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full">
      <Header />

      {/* Front Layer: Content that scrolls UP past the footer on desktop */}
      <main className="relative z-10 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-b border-gray-200/50 rounded-b-3xl">
        <Hero badge={site.hero?.badge} title={site.hero?.title} />
        <EventCenter events={events} />
        <Marquee text={site.marquee?.text} />
        <NewsSection items={news} />
        <AboutSection stats={site.about_stats?.stats} />
        <CtaSection />
        <ExecomSection teams={teams} />
        <MapSection location={site.location} />
        <ContactSection contact={site.contact} />
      </main>

      {/* Footer: sticky reveal on desktop, normal flow on mobile */}
      <div className="md:sticky md:bottom-0 md:z-0 z-10 relative">
        <Footer />
      </div>
    </div>
  );
}
