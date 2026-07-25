"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, ArrowDown, Sparkles, Search } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface EventHeroHorizonProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function EventHeroHorizon({ searchQuery, onSearchChange }: EventHeroHorizonProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const textLeftRef = useRef<HTMLSpanElement>(null);
  const textRightRef = useRef<HTMLSpanElement>(null);
  const scheduleBarRef = useRef<HTMLDivElement>(null);

  // Desktop-only GSAP ScrollTrigger soft scrub parallax (Zero magnetic pin pull force!)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP ONLY: >= 1024px (Soft, natural scrub parallax without aggressive pinning!)
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
            onRefresh: () => {
              window.__lenis?.resize();
            }
          }
        });

        tl.to(textLeftRef.current, { xPercent: -25, opacity: 0.85, ease: "power1.out" }, 0)
          .to(textRightRef.current, { xPercent: 25, opacity: 0.85, ease: "power1.out" }, 0)
          .fromTo(
            scheduleBarRef.current,
            { opacity: 0.9, y: 0 },
            { opacity: 0.4, y: 20, ease: "power1.out" },
            0
          );

        // Refresh Lenis & ScrollTrigger after setup pass
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          window.__lenis?.resize();
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[75vh] lg:min-h-[85vh] w-full flex flex-col items-center justify-center pt-28 pb-16 overflow-hidden bg-navy text-white font-inter"
    >
      {/* Ambient Grid Lines & Rotating Astrolabe SVG Coordinate Art (NO AI GLOWING ORBS!) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />

        {/* Rotating Astrolabe SVG Coordinate Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] pointer-events-none opacity-20">
          <svg viewBox="0 0 500 500" className="w-full h-full text-white stroke-current stroke-[0.75] fill-none astrolabe-spin">
            <circle cx="250" cy="250" r="230" strokeDasharray="3 6" />
            <circle cx="250" cy="250" r="185" strokeDasharray="10 3" />
            <circle cx="250" cy="250" r="140" />
            <circle cx="250" cy="250" r="90" strokeDasharray="2 3" />
            <circle cx="250" cy="250" r="5" className="fill-red stroke-none" />
            <line x1="250" y1="10" x2="250" y2="490" />
            <line x1="10" y1="250" x2="490" y2="250" />
          </svg>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8 flex flex-col items-center text-center">
        
        {/* Top Subtitle Badge */}
        <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 shadow-lg">
          <Sparkles className="w-4 h-4 text-red" />
          <span className="text-white font-oswald uppercase tracking-[0.25em] font-bold text-xs">
            CALENDAR & FIXTURES
          </span>
        </div>

        {/* Kinetic Split Heading */}
        <h1 className="font-oswald uppercase text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-bold text-white tracking-tighter leading-none mb-6 drop-shadow-xl select-none">
          <span ref={textLeftRef} className="inline-block transform-gpu mr-2 sm:mr-4">
            SCIENCE
          </span>
          <span ref={textRightRef} className="inline-block text-red transform-gpu">
            EVENTS
          </span>
        </h1>

        <p className="text-white/70 max-w-2xl text-base md:text-xl font-inter leading-relaxed font-normal mb-8">
          Discover all upcoming and past events hosted by Science Club ASIET. Workshops, Seminars, and Conferences.
        </p>

        {/* Real-time Search Input */}
        <div className="w-full max-w-lg mb-10 relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-white/50 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH EVENTS BY TITLE, TOPIC, OR SPEAKER..."
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 pl-12 pr-4 py-3.5 rounded-full border border-white/20 focus:outline-none focus:border-red transition-all font-oswald text-xs tracking-wider uppercase"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange("")}
                className="absolute right-4 text-white/50 hover:text-white text-xs font-oswald uppercase font-bold"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Desktop Horizon Schedule Ticker Bar */}
        <div 
          ref={scheduleBarRef}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 md:p-6 hidden lg:flex items-center justify-around gap-4 text-left shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red text-white flex items-center justify-center shrink-0 shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-oswald text-[10px] uppercase font-bold text-white/60 tracking-widest block">UPCOMING NEXT</span>
              <span className="font-oswald text-sm font-bold text-white uppercase tracking-tight">OCT 12 • AI HORIZONS SUMMIT</span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-white/20" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-oswald text-[10px] uppercase font-bold text-white/60 tracking-widest block">OCTOBER 18</span>
              <span className="font-oswald text-sm font-bold text-white uppercase tracking-tight">QUANTUM COMPUTING</span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-white/20" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-oswald text-[10px] uppercase font-bold text-white/60 tracking-widest block">NOVEMBER 04</span>
              <span className="font-oswald text-sm font-bold text-white uppercase tracking-tight">ROBOTICS BUILD V2</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-10 flex items-center gap-2 font-oswald text-xs uppercase tracking-[0.2em] text-white/60">
          <span>SCROLL TO EXPLORE FIXTURES</span>
          <ArrowDown className="w-4 h-4 text-red" />
        </div>

      </div>
    </section>
  );
}
