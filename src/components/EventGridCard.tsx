"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScienceEvent } from "@/lib/events";

interface EventGridCardProps {
  event: ScienceEvent;
  onClick: () => void;
}

export function EventGridCard({ event, onClick }: EventGridCardProps) {
  return (
    <motion.div
      layoutId={`card-${event.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={cn(
        "relative w-full aspect-[4/5] sm:aspect-[3/4] md:h-[480px] rounded-2xl md:rounded-[2rem] flex flex-col group cursor-pointer overflow-hidden transition-all duration-500 isolate",
        event.status === "UPCOMING" 
          ? "border-2 border-transparent hover:border-red" 
          : "border-2 border-transparent hover:border-navy"
      )}
    >
      {/* Full Bleed Background Image & Gradients */}
      <div className="absolute inset-0 z-0 bg-navy/20">
        <Image
          src={event.img}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1.5s] ease-[0.22,1,0.36,1] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent opacity-90 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
      </div>

      {/* Floating Meta Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <motion.span 
          layoutId={`status-${event.id}`}
          className={cn(
          "backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-white border border-white/20 transition-colors duration-500",
          event.status === "UPCOMING" ? "bg-red/90 group-hover:bg-red" : "bg-black/60"
        )}>
          {event.status}
        </motion.span>
        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white tracking-widest border border-white/10">
          {event.type}
        </span>
      </div>

      {/* Main Content Block */}
      <div className="relative z-10 mt-auto p-6 flex flex-col h-full justify-end overflow-hidden">
        <div className="flex items-start gap-4 transform translate-y-0 md:translate-y-8 md:group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] mb-2">
          {/* Date Block */}
          <div className="flex flex-col items-center justify-center shrink-0 mt-1">
            <motion.span 
              layoutId={`dateDay-${event.id}`}
              className={cn(
              "font-oswald text-3xl font-bold leading-none transition-colors duration-500 text-white drop-shadow-md",
              event.status === "UPCOMING" && "md:group-hover:text-red"
            )}>
              {event.dateDay}
            </motion.span>
            <motion.span 
              layoutId={`dateMonth-${event.id}`}
              className="font-oswald uppercase text-white/70 text-[10px] tracking-[0.2em] mt-1"
            >
              {event.dateMonth}
            </motion.span>
          </div>
          
          <div className="w-[1px] h-[40px] bg-white/30 shrink-0 mt-1" />
          
          <motion.h3 
            layoutId={`title-${event.id}`}
            className="font-oswald uppercase text-white text-xl sm:text-2xl leading-[1.1] font-bold line-clamp-3 tracking-tight drop-shadow-md"
          >
            {event.title}
          </motion.h3>
        </div>

        <div className="flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-8 md:group-hover:translate-y-0 transition-all duration-500 delay-100 ease-[0.22,1,0.36,1] pt-4 ml-[70px] border-t border-white/20 mt-2 md:mt-0">
          <span className="text-white text-[10px] font-oswald uppercase tracking-[0.2em] font-bold">
            {event.status === "UPCOMING" ? "More Info" : "View Details"}
          </span>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-500 ease-out md:group-hover:rotate-45",
            event.status === "UPCOMING" ? "bg-red text-white" : "bg-white/20 text-white backdrop-blur-md"
          )}>
            <ArrowRight className="w-4 h-4 -rotate-45 md:-rotate-45" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
