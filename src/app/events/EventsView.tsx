"use client";

import { useState } from "react";
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
      <EventGrid events={events} searchQuery={searchQuery} />
    </>
  );
}
