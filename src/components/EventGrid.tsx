"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { eventsData, ScienceEvent } from "@/lib/events";
import { EventGridCard } from "./EventGridCard";
import { EventModal } from "./EventModal";
import { FeaturedEventFixture } from "./events/FeaturedEventFixture";
import { EventDirectoryTable } from "./events/EventDirectoryTable";
import { EventCalendarWidget } from "./events/EventCalendarWidget";
import { HistoricVaultGallery } from "./events/HistoricVaultGallery";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | "UPCOMING" | "COMPLETED";
type ViewMode = "GRID" | "LIST";

const ITEMS_PER_PAGE = 6;

interface EventGridProps {
  searchQuery?: string;
}

export function EventGrid({ searchQuery = "" }: EventGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("GRID");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<ScienceEvent | null>(null);

  // Featured event (nearest upcoming event)
  const featuredEvent = useMemo(() => {
    return eventsData.find((e) => e.status === "UPCOMING") || eventsData[0];
  }, []);

  // Filtered dataset combining Category Tab and Search Query
  const filteredEvents = useMemo(() => {
    let result = eventsData;
    if (activeTab !== "ALL") {
      result = result.filter((event) => event.status === activeTab);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          (event.speaker && event.speaker.toLowerCase().includes(q)) ||
          (event.location && event.location.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeTab, searchQuery]);

  // Total pages
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE) || 1;

  // Paginated dataset
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <section className="py-16 md:py-28 bg-white min-h-[50vh] font-inter">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* ─── FEATURED MATCHDAY FIXTURE STAGE ─── */}
        {featuredEvent && !searchQuery && (
          <div className="mb-20 md:mb-28">
            <FeaturedEventFixture 
              event={featuredEvent} 
              onSelect={(e) => setSelectedEvent(e)} 
            />
          </div>
        )}

        {/* ─── MONTHLY EVENT CALENDAR WIDGET ─── */}
        {!searchQuery && (
          <div className="mb-20 md:mb-28">
            <EventCalendarWidget 
              events={eventsData} 
              onSelectEvent={(e) => setSelectedEvent(e)} 
            />
          </div>
        )}

        {/* ─── DOCK CONTROLS (Filter Tabs + View Switcher) ─── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100">
          
          {/* Category Tabs */}
          <div className="inline-flex bg-gray-100 p-1.5 rounded-full relative shadow-inner">
            {(["ALL", "UPCOMING", "COMPLETED"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "relative px-7 py-3 text-xs sm:text-sm font-oswald uppercase font-bold tracking-widest rounded-full transition-colors z-10 cursor-pointer",
                  activeTab === tab ? "text-white" : "text-navy/50 hover:text-navy"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-red rounded-full -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          {/* View Mode Switcher (Grid vs Directory List) */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-oswald font-bold uppercase tracking-widest text-navy/50 hidden sm:inline-block">
              VIEW MODE:
            </span>
            <div className="inline-flex bg-gray-100 p-1.5 rounded-xl">
              <button
                onClick={() => setViewMode("GRID")}
                aria-label="Grid View"
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-oswald uppercase font-bold tracking-wider flex items-center gap-2 transition-colors cursor-pointer",
                  viewMode === "GRID" ? "bg-white text-navy shadow-sm" : "text-navy/50 hover:text-navy"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">GRID</span>
              </button>
              <button
                onClick={() => setViewMode("LIST")}
                aria-label="List View"
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-oswald uppercase font-bold tracking-wider flex items-center gap-2 transition-colors cursor-pointer",
                  viewMode === "LIST" ? "bg-white text-navy shadow-sm" : "text-navy/50 hover:text-navy"
                )}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">DIRECTORY</span>
              </button>
            </div>
          </div>

        </div>

        {/* ─── DISPLAY CONTAINER: GRID OR DIRECTORY TABLE ─── */}
        <AnimatePresence mode="wait">
          {viewMode === "GRID" ? (
            <motion.div 
              key={`grid-${activeTab}-${currentPage}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {paginatedEvents.map((event) => (
                <EventGridCard 
                  key={event.id} 
                  event={event} 
                  onClick={() => setSelectedEvent(event)} 
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`list-${activeTab}-${currentPage}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <EventDirectoryTable 
                events={paginatedEvents} 
                onSelect={(e) => setSelectedEvent(e)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {filteredEvents.length === 0 && (
          <div className="text-center py-24 text-navy/50 font-oswald uppercase tracking-widest font-bold text-lg">
            No events match your criteria.
          </div>
        )}

        {/* ─── PAGINATION CONTROLLER ─── */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
            <span className="text-xs font-oswald uppercase font-bold tracking-widest text-navy/50">
              SHOWING PAGE {currentPage} OF {totalPages} ({filteredEvents.length} TOTAL FIXTURES)
            </span>

            <div className="flex items-center gap-2.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-navy disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-11 h-11 rounded-full font-oswald text-xs font-bold transition-colors cursor-pointer",
                      currentPage === pageNum ? "bg-red text-white shadow-md" : "bg-gray-100 text-navy/70 hover:bg-navy hover:text-white"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-navy disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── HISTORIC VAULT & RECAP SUMMARY SECTION ─── */}
        <HistoricVaultGallery />

      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
