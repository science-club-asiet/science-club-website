"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScienceEvent } from "@/lib/events";

const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds per card

export function EventCenter({ events }: { events: ScienceEvent[] }) {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isCurrentlyInView = useInView(ref, { once: false });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Guards handleScroll from firing during programmatic smooth-scroll
  const isAutoScrolling = useRef(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll the carousel to center a specific card index
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = scrollRef.current;
    if (!container) return;
    // displayEvents prepends 2 cloned elements, so the real card maps to display index = index + 2
    const displayIndex = index + 2;
    const card = container.children[displayIndex] as HTMLElement;
    if (!card) return;
    const offset = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
    // Lock out handleScroll for the duration of the scroll animation
    isAutoScrolling.current = true;
    container.scrollTo({ left: offset, behavior: smooth ? "smooth" : "auto" });
    setTimeout(() => { isAutoScrolling.current = false; }, smooth ? 700 : 50);
  }, []);


  // Detect MANUAL scroll only — gated by isAutoScrolling
  const handleScroll = useCallback(() => {
    // Ignore scroll events fired by our own programmatic scrollTo()
    if (isAutoScrolling.current) return;

    const container = scrollRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.offsetWidth / 2;
    
    let closestIndexInDisplay = 0;
    let closestDist = Infinity;
    const allChildren = Array.from(container.children);
    
    allChildren.forEach((child, i) => {
      const el = child as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndexInDisplay = i;
      }
    });

    // Translate displayIndex back to real index
    const realIndex = (closestIndexInDisplay - 2 + events.length) % events.length;
    setActiveIndex(realIndex);

    // Dynamic infinite reset: if we land on cloned items, instantly jump back to real items
    if (closestIndexInDisplay < 2) {
      // Landed on prepended clone (indices 0, 1) -> jump to real cards at the end
      const targetDisplayIndex = events.length + closestIndexInDisplay;
      const card = container.children[targetDisplayIndex] as HTMLElement;
      if (card) {
        const offset = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
        isAutoScrolling.current = true;
        container.scrollTo({ left: offset, behavior: "auto" });
        setTimeout(() => { isAutoScrolling.current = false; }, 50);
      }
    } else if (closestIndexInDisplay >= events.length + 2) {
      // Landed on appended clone -> jump to real cards at the beginning
      const targetDisplayIndex = closestIndexInDisplay - events.length;
      const card = container.children[targetDisplayIndex] as HTMLElement;
      if (card) {
        const offset = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
        isAutoScrolling.current = true;
        container.scrollTo({ left: offset, behavior: "auto" });
        setTimeout(() => { isAutoScrolling.current = false; }, 50);
      }
    }

    // Pause auto-scroll for 6s after any manual interaction
    setIsPaused(true);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setIsPaused(false), 6000);
  }, [events.length]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
    setIsPaused(true);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setIsPaused(false), 6000);
  };

  const smoothScrollToDisplayIndex = useCallback((displayIndex: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[displayIndex] as HTMLElement;
    if (!card) return;
    const offset = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
    
    isAutoScrolling.current = true;
    container.scrollTo({ left: offset, behavior: "smooth" });
    
    // Pause auto-scroll for 6s after manual trigger
    setIsPaused(true);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setIsPaused(false), 6000);

    setTimeout(() => {
      const realIndex = (displayIndex - 2 + events.length) % events.length;
      
      // If we landed on a clone at either boundary, instantly reset the scroll to the real card
      if (displayIndex < 2) {
        const targetDisplayIndex = events.length + displayIndex;
        const targetCard = container.children[targetDisplayIndex] as HTMLElement;
        if (targetCard) {
          const resetOffset = targetCard.offsetLeft - container.offsetWidth / 2 + targetCard.offsetWidth / 2;
          container.scrollTo({ left: resetOffset, behavior: "auto" });
        }
      } else if (displayIndex >= events.length + 2) {
        const targetDisplayIndex = displayIndex - events.length;
        const targetCard = container.children[targetDisplayIndex] as HTMLElement;
        if (targetCard) {
          const resetOffset = targetCard.offsetLeft - container.offsetWidth / 2 + targetCard.offsetWidth / 2;
          container.scrollTo({ left: resetOffset, behavior: "auto" });
        }
      }
      
      setActiveIndex(realIndex);
      isAutoScrolling.current = false;
    }, 700);
  }, [events.length]);

  const handlePrev = useCallback(() => {
    // Current active displayIndex is activeIndex + 2. Prev is activeIndex + 1.
    smoothScrollToDisplayIndex(activeIndex + 1);
  }, [activeIndex, smoothScrollToDisplayIndex]);

  const handleNext = useCallback(() => {
    // Current active displayIndex is activeIndex + 2. Next is activeIndex + 3.
    smoothScrollToDisplayIndex(activeIndex + 3);
  }, [activeIndex, smoothScrollToDisplayIndex]);

  // Auto-advance timer — only runs when section is visible to prevent off-screen scrollTo window jumps
  useEffect(() => {
    if (isPaused || !isCurrentlyInView) return;
    const timer = setInterval(() => {
      handleNext();
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, isCurrentlyInView, handleNext]);

  // Infinite scroll display sequence prepending/appending clones to eliminate empty gaps
  const displayEvents = [...events.slice(-2), ...events, ...events.slice(0, 2)];

  // Scroll to the first real card on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToIndex(0, false);
    }, 100);
    return () => clearTimeout(timeout);
  }, [scrollToIndex]);

  return (
    <section className="bg-white py-12 md:py-16 text-navy font-inter border-b border-gray-200 relative z-30 -mt-16 sm:-mt-24 w-full max-w-[95%] mx-auto left-0 right-0 shadow-[0_15px_40px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">
      
      {/* Header lives in a padded container */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-2xl md:text-5xl font-oswald uppercase font-bold tracking-tight text-navy"
          >
            Event Center
          </motion.h2>
          <Link href="/events" passHref>
            <motion.button
              className="flex items-center gap-2 font-oswald uppercase text-base md:text-lg text-red hover:text-navy transition-colors font-bold tracking-wide group"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              All Events
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Carousel: full section width — rounded-3xl + overflow-hidden clips edges cleanly */}
      <div 
        className="relative group/carousel"
        onMouseEnter={() => {
          setIsPaused(true);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          setIsPaused(false);
          setIsHovered(false);
        }}
      >
        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrev}
          className={cn(
            "absolute left-4 lg:left-8 top-[calc(50%-10px)] -translate-y-1/2 z-40 hidden md:flex w-12 h-12 rounded-full bg-white/95 hover:bg-white text-navy hover:text-red border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md focus:outline-none",
            isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          aria-label="Previous event"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          className={cn(
            "absolute right-4 lg:right-8 top-[calc(50%-10px)] -translate-y-1/2 z-40 hidden md:flex w-12 h-12 rounded-full bg-white/95 hover:bg-white text-navy hover:text-red border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md focus:outline-none",
            isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          aria-label="Next event"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        <div
          ref={(el: HTMLDivElement | null) => {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
            (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 lg:gap-8 pb-4 pt-4 hide-scrollbar"
        >
          {displayEvents.map((event, i) => {
            const realIndex = (i - 2 + events.length) % events.length;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goTo(realIndex)}
                className={cn(
                  "relative min-w-[78vw] h-[380px] sm:min-w-[58vw] sm:h-[420px] md:min-w-[400px] md:h-[520px] lg:min-w-[440px] flex-shrink-0 snap-center rounded-2xl md:rounded-[2rem] flex flex-col group cursor-pointer overflow-hidden transition-all duration-500 isolate",
                  event.status === "UPCOMING" 
                    ? "border-2 border-transparent hover:border-red" 
                    : "border-2 border-transparent hover:border-navy",
                  realIndex === activeIndex
                    ? "opacity-100 blur-0 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                    : "opacity-40 hover:opacity-75 blur-[1px] hover:blur-none grayscale-[15%] hover:grayscale-0"
                )}
              >
                
                {/* Full Bleed Background Image & Gradients */}
                <div className="absolute inset-0 z-0 bg-navy/20">
                  <Image
                    src={event.img && event.img.trim() && !event.img.startsWith("blob:") ? event.img.trim() : "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1200&auto=format&fit=crop"}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 58vw, 440px"
                    className="object-cover transition-transform duration-[1.5s] ease-[0.22,1,0.36,1] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent opacity-90 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating Meta Badges */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex items-center gap-2">
                  <span className={cn(
                    "backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-white border border-white/20 transition-colors duration-500",
                    event.status === "UPCOMING" ? "bg-red/90 group-hover:bg-red" : "bg-black/60"
                  )}>
                    {event.status}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] uppercase font-bold text-white tracking-widest border border-white/10 hidden sm:block">
                    {event.type}
                  </span>
                </div>

                {/* Main Content Block */}
                <div className="relative z-10 mt-auto p-5 md:p-8 flex flex-col h-full justify-end overflow-hidden">
                  
                  <div className="flex items-start gap-4 md:gap-5 transform translate-y-0 md:translate-y-8 md:group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] mb-2">
                    
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center shrink-0 mt-0 md:mt-1">
                        <span className={cn(
                          "font-oswald text-2xl md:text-4xl lg:text-5xl font-bold leading-none transition-colors duration-500 text-white drop-shadow-md",
                          event.status === "UPCOMING" && "md:group-hover:text-red"
                        )}>
                          {event.dateDay}
                        </span>
                        <span className="font-oswald uppercase text-white/70 text-[10px] md:text-xs tracking-[0.2em] mt-1">
                          {event.dateMonth}
                        </span>
                    </div>
                    
                    <div className="w-[1px] h-[30px] md:h-[50px] bg-white/30 shrink-0 mt-1" />
                    
                    <h3 className="font-oswald uppercase text-white text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] leading-[1.05] font-bold line-clamp-3 md:line-clamp-2 tracking-tight drop-shadow-md">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-8 md:group-hover:translate-y-0 transition-all duration-500 delay-100 ease-[0.22,1,0.36,1] pt-4 md:pt-6 ml-0 md:ml-[90px] border-t border-white/20 mt-4 md:mt-0">
                    <span className="text-white text-[10px] md:text-sm font-oswald uppercase tracking-[0.2em] font-bold">
                      {event.status === "UPCOMING" ? "Register Now" : "View Recap"}
                    </span>
                    <div className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-transform duration-500 ease-out md:group-hover:rotate-45",
                      event.status === "UPCOMING" ? "bg-red text-white" : "bg-white/20 text-white backdrop-blur-md"
                    )}>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 -rotate-45 md:-rotate-45" />
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Indicators in a padded container */}
      <div className="container mx-auto px-4 lg:px-8 pt-6 pb-2">
        {/* ── Morphing Circle-to-Pill Indicator ── */}
        <div className="flex items-center gap-[6px]">
          <AnimatePresence>
            {events.map((_, i) => {
              const nextIndex = (activeIndex + 1) % events.length;
              const isActive = i === activeIndex;
              const isNext   = i === nextIndex;

              return (
                <motion.button
                  key={i}
                  layout
                  onClick={() => goTo(i)}
                  aria-label={`Go to event ${i + 1}`}
                  // Morphs: small circle → medium pill → wide active pill
                  animate={{
                    width: isActive ? 36 : isNext ? 20 : 8,
                    opacity: isActive ? 1 : isNext ? 0.7 : 0.35,
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-2 rounded-full bg-gray-300 focus:outline-none flex-shrink-0 overflow-hidden"
                >
                  {/* The FM layoutId span slides between active positions smoothly */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="active-pip"
                        className="absolute inset-0 bg-navy rounded-full"
                        initial={false}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Sweep on the next dot — driven by FM, not CSS keyframes */}
                  {isNext && !isPaused && (
                    <motion.span
                      key={`sweep-${activeIndex}`}
                      className="absolute inset-y-0 left-0 bg-navy/50 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: AUTO_SCROLL_INTERVAL / 1000,
                        ease: "linear",
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
