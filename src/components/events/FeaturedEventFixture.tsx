"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Calendar, MapPin, Clock, User, Users, Sparkles } from "lucide-react";
import { ScienceEvent, getCategoryFieldLabels } from "@/lib/events";

interface FeaturedEventFixtureProps {
  event: ScienceEvent;
  onSelect: (event: ScienceEvent) => void;
}

export function FeaturedEventFixture({ event, onSelect }: FeaturedEventFixtureProps) {
  // Calculate real time remaining dynamically from event date
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    function updateCountdown() {
      const dateStr = event.dateYear ? `${event.dateMonth} ${event.dateDay}, ${event.dateYear} ${event.time || ""}` : null;
      const targetTime = dateStr ? new Date(dateStr).getTime() : 0;
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [event]);

  // Framer Motion Damped Spring Mouse Physics (Butter-smooth entry, movement, and exit!)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 180, damping: 24 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 180, damping: 24 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      style={{ perspective: "1000px" }}
      className="w-full font-inter"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(event)}
        className="relative w-full rounded-[2.5rem] overflow-hidden bg-navy text-white shadow-[0_30px_90px_rgba(6,18,41,0.35)] border border-white/20 cursor-pointer group isolate transform-gpu"
      >
        {/* Pure Science Laboratory Cover Image & Gradient Layers (No matrix code & no glowing blur orbs!) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={event.img}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-8 sm:p-12 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          
          {/* Left Column: Event Specs & Narrative */}
          <div className="max-w-2xl">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-red text-white text-[11px] font-oswald uppercase font-bold tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md">
                NEXT UPCOMING FIXTURE
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-[11px] font-oswald uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-white/15">
                {event.type}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-oswald text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-white mb-8 drop-shadow-md">
              {event.title}
            </h2>

            {/* 2x2 Glass Spec Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/90 font-inter text-xs mb-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <Calendar className="w-4 h-4 text-red shrink-0" />
                <div>
                  <span className="text-[9px] font-oswald uppercase font-bold text-white/60 block">DATE</span>
                  <span className="font-semibold text-white">{event.dateDay} {event.dateMonth} {event.dateYear || "2025"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <Clock className="w-4 h-4 text-red shrink-0" />
                <div>
                  <span className="text-[9px] font-oswald uppercase font-bold text-white/60 block">TIME SLOT</span>
                  <span className="font-semibold text-white">{event.time || "09:00 AM - 05:00 PM"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <MapPin className="w-4 h-4 text-red shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] font-oswald uppercase font-bold text-white/60 block">LOCATION</span>
                  <span className="font-semibold text-white truncate block">{event.location || "Main Auditorium"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <User className="w-4 h-4 text-red shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] font-oswald uppercase font-bold text-white/60 block">{getCategoryFieldLabels(event.type).speakerLabel}</span>
                  <span className="font-semibold text-white truncate block">{event.speaker || "Science Club Team"}</span>
                </div>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            {event.seatsRemaining && (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-md">
                <div className="flex justify-between items-center text-xs font-oswald uppercase text-white mb-2 font-bold">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-red" /> FIXTURE CAPACITY</span>
                  <span className="text-red font-bold">{event.seatsRemaining} SEATS REMAINING</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-red rounded-full shadow-sm" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Digital Countdown & CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-8 border-t lg:border-t-0 lg:border-l border-white/15 pt-8 lg:pt-0 lg:pl-12">
            
            {/* Live Ticking Countdown Tiles */}
            <div className="flex flex-col items-start sm:items-center lg:items-end">
              <span className="font-oswald text-xs uppercase font-bold tracking-[0.25em] text-white/60 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red" />
                LIVE COUNTDOWN
              </span>
              <div className="flex items-center gap-2.5 font-oswald text-2xl sm:text-4xl font-bold text-white tracking-tight">
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center min-w-[56px] shadow-lg">
                  <span>{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="block text-[9px] text-white/60 font-normal uppercase tracking-widest mt-0.5">DAYS</span>
                </div>
                <span className="text-red font-bold text-xl">:</span>
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center min-w-[56px] shadow-lg">
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="block text-[9px] text-white/60 font-normal uppercase tracking-widest mt-0.5">HRS</span>
                </div>
                <span className="text-red font-bold text-xl">:</span>
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center min-w-[56px] shadow-lg">
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="block text-[9px] text-white/60 font-normal uppercase tracking-widest mt-0.5">MIN</span>
                </div>
                <span className="text-red font-bold text-xl">:</span>
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center min-w-[56px] text-red shadow-lg">
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="block text-[9px] text-white/60 font-normal uppercase tracking-widest mt-0.5">SEC</span>
                </div>
              </div>
            </div>

            {/* Register CTA Shimmer Button */}
            <button className="relative overflow-hidden bg-gradient-to-r from-red via-red-600 to-red text-white text-sm font-oswald uppercase tracking-[0.2em] font-bold px-9 py-4 rounded-full inline-flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(229,57,53,0.35)] hover:shadow-[0_15px_35px_rgba(229,57,53,0.5)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 cursor-pointer group">
              {/* Internal Light Shimmer Sweep */}
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none" />
              
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
