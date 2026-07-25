"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight, User, Sparkles, ChevronDown } from "lucide-react";
import { ScienceEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

interface EventCalendarWidgetProps {
  events: ScienceEvent[];
  onSelectEvent: (event: ScienceEvent) => void;
}

const ALL_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function EventCalendarWidget({ events, onSelectEvent }: EventCalendarWidgetProps) {
  // Extract unique available years dynamically from events dataset (Built to scale for 50+ years!)
  const availableYears = useMemo(() => {
    const years = new Set(events.map((e) => e.dateYear || "2025"));
    // Always include a wide range for demonstration scaling
    years.add("2024");
    years.add("2025");
    years.add("2026");
    years.add("2027");
    return Array.from(years).sort();
  }, [events]);

  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedMonth, setSelectedMonth] = useState<string>("OCT");

  // Months that have events for the selected year
  const monthsWithEvents = useMemo(() => {
    const set = new Set(
      events
        .filter((e) => (e.dateYear || "2025") === selectedYear)
        .map((e) => e.dateMonth)
    );
    return set;
  }, [events, selectedYear]);

  // Events filtered for selected year & month
  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) => (e.dateYear || "2025") === selectedYear && e.dateMonth === selectedMonth
    );
  }, [events, selectedYear, selectedMonth]);

  return (
    <div className="bg-gray-50/80 rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm font-inter">
      
      {/* 2-Column Schedule Explorer Layout (Zero Empty White Space Voids) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column (4/12): Dark Navy Calendar Control Card */}
        <div className="lg:col-span-4 bg-navy text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          
          <div className="relative z-10">
            <span className="text-red font-oswald uppercase text-[11px] font-bold tracking-[0.25em] block mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-red" />
              MONTHLY EXPLORER
            </span>
            <h3 className="font-oswald text-3xl font-bold uppercase tracking-tight text-white leading-none mb-6">
              EVENT CALENDAR
            </h3>

            {/* Scalable Year Selector Dropdown & Scroll Track (Built for 50+ Years!) */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-oswald text-[10px] uppercase font-bold text-white/60 tracking-widest">
                  SELECT YEAR
                </span>
                <span className="text-[9px] font-oswald uppercase text-red font-bold tracking-widest">
                  {availableYears.length} YEARS AVAILABLE
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-white/10 text-white font-oswald font-bold text-sm uppercase tracking-wider px-4 py-2.5 rounded-xl border border-white/20 appearance-none cursor-pointer focus:outline-none focus:border-red transition-all"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-navy text-white">
                      YEAR {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 12-Month Selector Grid with Active Dot Indicators */}
            <div>
              <span className="font-oswald text-[10px] uppercase font-bold text-white/60 tracking-widest block mb-2">
                SELECT MONTH ({selectedYear})
              </span>
              <div className="grid grid-cols-4 gap-2">
                {ALL_MONTHS.map((m) => {
                  const hasEvents = monthsWithEvents.has(m);
                  const isSelected = selectedMonth === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMonth(m)}
                      className={cn(
                        "relative py-2.5 rounded-xl text-xs font-oswald uppercase font-bold tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center border",
                        isSelected
                          ? "bg-white text-navy border-white shadow-md"
                          : hasEvents
                          ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                          : "bg-white/5 text-white/40 border-transparent hover:text-white/70"
                      )}
                    >
                      <span>{m}</span>
                      {hasEvents && (
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1",
                          isSelected ? "bg-red" : "bg-red animate-pulse"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Counter Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
            <span className="font-oswald uppercase tracking-wider font-semibold">SELECTED: {selectedMonth} {selectedYear}</span>
            <span className="bg-red text-white px-2.5 py-0.5 rounded-full text-[10px] font-oswald font-bold tracking-widest uppercase shadow-sm">
              {filteredEvents.length} FIXTURES
            </span>
          </div>

        </div>

        {/* Right Column (8/12): Full-Width Event Spotlight Cards (Fills layout completely!) */}
        <div className="lg:col-span-8 flex flex-col justify-center min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedYear}-${selectedMonth}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full space-y-4"
            >
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 hover:border-red/40 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-5 min-w-0">
                      {/* Date Badge */}
                      <div className="bg-navy group-hover:bg-red text-white px-4 py-3 rounded-2xl text-center shrink-0 transition-colors shadow-md">
                        <span className="font-oswald text-3xl font-bold leading-none block">{event.dateDay}</span>
                        <span className="font-oswald text-[10px] uppercase tracking-widest mt-0.5 block">{event.dateMonth}</span>
                      </div>

                      {/* Event Details */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-oswald uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md",
                            event.status === "UPCOMING" ? "bg-red/10 text-red" : "bg-gray-100 text-navy/60"
                          )}>
                            {event.status}
                          </span>
                          <span className="text-[9px] font-oswald uppercase font-bold tracking-widest text-navy/40">
                            {event.type}
                          </span>
                        </div>

                        <h4 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-navy group-hover:text-red transition-colors line-clamp-1">
                          {event.title}
                        </h4>

                        <p className="text-xs text-gray-500 font-normal line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-navy/70 pt-1 font-medium">
                          {event.location && (
                            <span className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-red shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </span>
                          )}
                          {event.time && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-red shrink-0" />
                              <span>{event.time}</span>
                            </span>
                          )}
                          {event.speaker && (
                            <span className="flex items-center gap-1.5 truncate hidden sm:inline-flex">
                              <User className="w-3.5 h-3.5 text-red shrink-0" />
                              <span className="truncate">{event.speaker}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Circle Button */}
                    <div className="w-11 h-11 rounded-full bg-gray-100 group-hover:bg-red group-hover:text-white text-navy flex items-center justify-center shrink-0 transition-colors shadow-sm self-end sm:self-center">
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-gray-200/80 text-center flex flex-col items-center justify-center space-y-3">
                  <Sparkles className="w-8 h-8 text-red opacity-40" />
                  <span className="font-oswald text-lg font-bold uppercase text-navy tracking-tight">
                    NO FIXTURES SCHEDULED FOR {selectedMonth} {selectedYear}
                  </span>
                  <p className="text-xs text-gray-500 font-normal max-w-sm">
                    Select another month with an active red indicator dot to view scheduled events.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
