import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { NexusRenderer } from "@/packages/nexus-builder/NexusRenderer";
import { RegisterButton } from "@/components/RegisterButton";
import { getEventPage } from "@/lib/data/events";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getEventPage(slug);
  return { title: data ? `${data.event.title} · Science Club` : "Event · Science Club" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getEventPage(slug);
  if (!data) notFound();
  const { event, blocks } = data;

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-b border-gray-200/50 rounded-b-3xl pt-32 pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-6">
          {data.nexus_data ? (
            <NexusRenderer data={data.nexus_data} />
          ) : blocks.length > 0 ? (
            <BlockRenderer blocks={blocks} />
          ) : (
            <section className="relative overflow-hidden rounded-2xl bg-navy text-white p-8 sm:p-14 min-h-[280px] flex flex-col justify-end">
              <span className="bg-red text-white text-[11px] font-oswald uppercase font-bold tracking-widest px-3 py-1 rounded-full w-fit mb-4">{event.type}</span>
              <h1 className="font-oswald text-4xl sm:text-6xl font-bold uppercase leading-none">{event.title}</h1>
              <p className="text-white/70 mt-3">
                {event.dateDay} {event.dateMonth} {event.dateYear}{event.location ? ` · ${event.location}` : ""}
              </p>
              {event.description && <p className="text-white/70 mt-4 max-w-xl">{event.description}</p>}
            </section>
          )}

          <div id="register" className="pt-4 flex items-center gap-4">
            {event.status === "UPCOMING" ? (
              <>
                <RegisterButton eventId={event.id} />
                {(event.memberPrice || event.nonMemberPrice) ? (
                  <span className="text-sm text-navy/60">Members ₹{event.memberPrice ?? 0} · Others ₹{event.nonMemberPrice ?? 0}</span>
                ) : null}
              </>
            ) : (
              <span className="text-gray-400 font-oswald uppercase tracking-widest text-sm font-bold">This event has ended</span>
            )}
          </div>
        </div>
      </main>
      <div className="md:sticky md:bottom-0 md:z-0 z-10 relative">
        <Footer />
      </div>
    </div>
  );
}
