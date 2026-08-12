import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventsView } from "./EventsView";
import { getEvents } from "@/lib/data/events";

export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />

      {/* Front Layer: Content that scrolls UP past the footer on desktop */}
      <main className="relative z-10 bg-white pb-16">
        <EventsView events={events} />
      </main>

      <Footer />
    </div>
  );
}
