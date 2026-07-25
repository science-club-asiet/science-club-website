"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScienceEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

interface EventDirectoryTableProps {
  events: ScienceEvent[];
  onSelect: (event: ScienceEvent) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export function EventDirectoryTable({ events, onSelect }: EventDirectoryTableProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col space-y-3 font-inter"
    >
      <AnimatePresence mode="popLayout">
        {events.map((event) => (
          <motion.div
            key={event.id}
            variants={itemVariants}
            onClick={() => onSelect(event)}
            className="bg-gray-50/80 hover:bg-navy hover:text-white p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center bg-white group-hover:bg-red text-navy group-hover:text-white px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow-sm">
                <span className="font-oswald text-2xl font-bold leading-none">{event.dateDay}</span>
                <span className="font-oswald text-[10px] uppercase font-bold tracking-widest mt-0.5">{event.dateMonth}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[9px] font-oswald uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md",
                    event.status === "UPCOMING" ? "bg-red text-white" : "bg-navy/10 group-hover:bg-white/20 text-navy group-hover:text-white"
                  )}>
                    {event.status}
                  </span>
                  <span className="text-[9px] font-oswald uppercase font-bold tracking-widest text-navy/50 group-hover:text-white/60">
                    {event.type}
                  </span>
                </div>
                <h3 className="font-oswald text-xl font-bold uppercase tracking-tight group-hover:text-white transition-colors">
                  {event.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-navy/60 group-hover:text-white/80 font-medium">
              {event.speaker && <span className="hidden lg:inline-block truncate max-w-[200px]">{event.speaker}</span>}
              {event.location && <span className="truncate max-w-[180px]">{event.location}</span>}
              <div className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-red flex items-center justify-center text-navy group-hover:text-white transition-colors shrink-0 ml-auto md:ml-0 shadow-sm">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
