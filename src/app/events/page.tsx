"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventGrid } from "@/components/EventGrid";
import { CtaSection } from "@/components/CtaSection";
import { EventHeroHorizon } from "@/components/events/EventHeroHorizon";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      
      {/* Front Layer: Content that scrolls UP past the footer on desktop */}
      <main className="relative z-10 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-b border-gray-200/50 rounded-b-3xl pb-16">
        
        {/* ─── KINETIC EVENT TIMELINE HORIZON HERO ─── */}
        <EventHeroHorizon 
          searchQuery={searchQuery} 
          onSearchChange={(q) => setSearchQuery(q)} 
        />

        {/* ─── MAIN EVENT EXHIBITION HUB ─── */}
        <EventGrid searchQuery={searchQuery} />

        <CtaSection />
      </main>

      {/* Sticky Footer Reveal Shell */}
      <div className="md:sticky md:bottom-0 md:z-0 z-10 relative">
        <Footer />
      </div>
    </div>
  );
}
