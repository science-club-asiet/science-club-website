"use client";

import { useState, Suspense } from "react";
import { EventGrid } from "@/components/EventGrid";
import { EventHeroHorizon } from "@/components/events/EventHeroHorizon";
import type { ScienceEvent } from "@/lib/events";

/**
 * Client half of the events page: owns the shared search state that the hero
 * search box writes and the grid reads. Events are fetched on the server and
 * passed in.
 */
export function EventsView({ events }: { events: ScienceEvent[] }) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <>
      <EventHeroHorizon
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        events={events}
      />
      <Suspense fallback={<div className="min-h-[50vh] bg-white" />}>
        <EventGrid events={events} searchQuery={searchQuery} />
      </Suspense>
    </>
  );
}
