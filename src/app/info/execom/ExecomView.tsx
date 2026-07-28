"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, Variants, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Mail, 
  Trophy, 
  Award, 
  GraduationCap, 
  Cpu, 
  Globe, 
  Search,
  ChevronDown,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecomMemberFull, PastExecomMember, CandidPhoto } from "@/lib/data/execom";
import type { Achievement } from "@/lib/data/content";

// Custom LinkedIn SVG component
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

// ─── HIGH-FIDELITY EXECOM DATA ───────────────────────────────────────────────

// Achievement icon column is a name string in the DB → map to the lucide component.
const ACH_ICONS: Record<string, LucideIcon> = { Trophy, Award, Cpu, GraduationCap, Globe };

export interface ExecomMember {
  id: string;
  name: string;
  role: string;
  category: "CORE LEADERSHIP" | "TECHNICAL LABS" | "MEDIA & CREATIVE" | "OPERATIONS & EVENTS";
  bio: string;
  img: string;
  email?: string;
  linkedin?: string;
}




type CategoryFilter = "ALL" | "CORE LEADERSHIP" | "TECHNICAL LABS" | "MEDIA & CREATIVE" | "OPERATIONS & EVENTS";

// --- ANIMATION VARIANTS ---


const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};


interface CandidTrailCard {
  id: number;
  x: number;
  y: number;
  rotation: number;
  photo: CandidPhoto;
  duration: number; // Dynamic fade duration based on mouse velocity
}

export function ExecomView({ members, pastExecom, candidPhotos, achievements }: {
  members: ExecomMemberFull[];
  pastExecom: PastExecomMember[];
  candidPhotos: CandidPhoto[];
  achievements: Achievement[];
}) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for the interactive split screen hover
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  
  // Accordion state for past years
  const [openYear, setOpenYear] = useState<string>("2023-24");

  const togglePastYear = (year: string) => {
    setOpenYear(prev => (prev === year ? "" : year));
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.__lenis?.resize();
      }
    }, 320);
  };

  // Interactive Mouse Trail & Idle State for Hero
  const [trailCards, setTrailCards] = useState<CandidTrailCard[]>([]);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosRef = useRef({ x: 0, y: 0, time: 0 });
  const photoIndexRef = useRef(0);
  const cardIdRef = useRef(0);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Reset idle state on mouse move
    if (isIdle) setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Set 650ms idle timer to smoothly fade out images when mouse becomes still
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 650);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();

    const dx = x - lastPosRef.current.x;
    const dy = y - lastPosRef.current.y;
    const dt = Math.max(now - (lastPosRef.current.time || now), 10);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate mouse velocity in px/ms
    const velocity = dist / dt;

    // Spawn card after mouse moves ~220px (spacious, strictly max 2 visible)
    if (dist > 220) {
      lastPosRef.current = { x, y, time: now };

      const photo = candidPhotos[photoIndexRef.current % candidPhotos.length];
      photoIndexRef.current += 1;

      // Disappearance duration inversely proportional to velocity:
      // Fast mouse movement (velocity > 1.5) = short fade duration (~0.4s)
      // Slow mouse movement (velocity < 0.3) = long, lingering fade duration (~1.2s)
      const fadeDuration = Math.min(Math.max(1.2 - velocity * 0.5, 0.4), 1.2);

      const rotation = (Math.random() - 0.5) * 20; // -10deg to +10deg
      const newCard: CandidTrailCard = {
        id: cardIdRef.current++,
        x,
        y,
        rotation,
        photo,
        duration: fadeDuration
      };

      setTrailCards(prev => {
        const updated = [...prev, newCard];
        if (updated.length > 2) {
          return updated.slice(updated.length - 2); // Strictly max 2 cards!
        }
        return updated;
      });
    }
  };

  const handleHeroMouseLeave = () => {
    setIsIdle(true);
  };

  // Scroll parallax for Hero section
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(heroScrollY, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(heroScrollY, [0, 0.8], [1, 0]);

  // Scroll parallax for CTA section
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ctaScrollY } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"]
  });
  const ctaBgTextX = useTransform(ctaScrollY, [0, 1], ["0%", "-20%"]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchCat = activeCategory === "ALL" || m.category === activeCategory;
      const matchQuery = searchQuery.trim() === "" || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bio.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [members, activeCategory, searchQuery]);

  const activeHoveredMember = useMemo(() => {
    if (!hoveredMemberId) return filteredMembers.length > 0 ? filteredMembers[0] : null;
    return filteredMembers.find(m => m.id === hoveredMemberId) || filteredMembers[0];
  }, [hoveredMemberId, filteredMembers]);

  // Group past members by year for the heritage directory
  const groupedPastExecom = useMemo(() => {
    const groups: Record<string, PastExecomMember[]> = {};
    pastExecom.forEach(m => {
      if (!groups[m.year]) groups[m.year] = [];
      groups[m.year].push(m);
    });
    return groups;
  }, [pastExecom]);

  return (
    <div className="bg-white text-navy font-inter min-h-screen selection:bg-red selection:text-white -mt-24">
      
      {/* ─── 01. INTERACTIVE MOUSE-TRAIL HERO (Candid Group Photos Canvas) ─── */}
      <section 
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="pt-36 pb-20 md:pt-48 md:pb-28 px-4 lg:px-8 relative z-10 bg-navy text-white border-b border-white/10 overflow-hidden min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between cursor-crosshair"
      >
        {/* Subtle Architectural Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        {/* Ambient SVG Astrolabe Wireframe */}
        <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[750px] h-[750px] opacity-10 pointer-events-none hidden lg:block text-white">
          <svg viewBox="0 0 500 500" className="w-full h-full stroke-current stroke-[0.5] fill-none astrolabe-spin">
            <circle cx="250" cy="250" r="230" strokeDasharray="3 6" />
            <circle cx="250" cy="250" r="185" strokeDasharray="10 3" />
            <circle cx="250" cy="250" r="140" />
            <circle cx="250" cy="250" r="90" strokeDasharray="2 3" />
            <circle cx="250" cy="250" r="5" className="fill-red stroke-none" />
            <line x1="250" y1="10" x2="250" y2="490" />
            <line x1="10" y1="250" x2="490" y2="250" />
          </svg>
        </div>

        {/* Spawned Interactive Mouse Trail Candid Photos (Max 2 cards with velocity fade) */}
        <AnimatePresence>
          {trailCards.map((card, index) => {
            const isOldest = trailCards.length > 1 && index === 0;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ 
                  opacity: (isIdle || isOldest) ? 0 : 1, 
                  scale: (isIdle || isOldest) ? 0.85 : 1, 
                  y: (isIdle || isOldest) ? -15 : 0, 
                  rotate: card.rotation 
                }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: isOldest ? card.duration : 0.4, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                style={{
                  left: card.x - 130,
                  top: card.y - 140,
                  position: "absolute"
                }}
                className="pointer-events-none z-20 w-60 sm:w-72 aspect-[16/11] rounded-2xl overflow-hidden border border-white/20 bg-navy/90 shadow-[0_30px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              >
                <Image
                  src={card.photo.url}
                  alt={card.photo.caption}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="font-oswald text-[9px] text-red font-bold uppercase tracking-widest block mb-0.5">
                    {card.photo.tag}
                  </span>
                  <h4 className="font-oswald text-xs sm:text-sm font-bold uppercase tracking-tight truncate">
                    {card.photo.caption}
                  </h4>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="container mx-auto relative z-10 flex flex-col justify-between flex-grow"
        >
          {/* Top Eyebrow Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8 pointer-events-none">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-red" />
              <span className="font-oswald text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-red">
                EXECUTIVE COMMITTEE
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-6 font-oswald text-xs uppercase tracking-[0.25em] text-white/40 font-bold">
              <span>EST. 2012</span>
              <span>•</span>
              <span>TERM 2024 — 2025</span>
            </div>
          </div>

          {/* Center Stage Mega Display Headline */}
          <div className="my-auto py-8 text-center flex flex-col items-center pointer-events-none">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-inner pointer-events-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
              <span className="font-oswald text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-white/90">
                INTERACTIVE TEAM CANVAS • 2024-25
              </span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-oswald text-[11vw] sm:text-[9.5vw] lg:text-[8vw] font-bold text-white uppercase leading-[0.82] tracking-tighter mb-6 select-none max-w-6xl"
            >
              THE MINDS<br/>
              <span className="text-transparent stroke-white" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.3)" }}>
                BEHIND THE
              </span><br/>
              SCIENCE<span className="text-red">.</span>
            </motion.h1>

            <p className="font-inter text-base sm:text-lg text-white/70 max-w-xl font-normal leading-relaxed mb-8 pointer-events-auto">
              12 student officers and faculty advisors steering applied physical science research, cross-disciplinary engineering labs, and campus symposiums at ASIET.
            </p>

            {/* Interactive Prompt Capsule */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-lg font-oswald text-xs uppercase tracking-[0.25em] text-white/80 pointer-events-auto shadow-lg hover:border-red/50 transition-colors">
              <span className="w-2 h-2 rounded-full bg-red" />
              <span>MOVE CURSOR AROUND TO REVEAL OFFICERS</span>
            </div>
          </div>

          {/* Bottom Roster Specs Footer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-6 border-t border-white/10 pointer-events-none">
            <div className="md:col-span-6">
              <span className="font-oswald text-xs text-white/40 uppercase tracking-[0.25em] block">
                DEPARTMENT OF PHYSICAL SCIENCE • ASIET
              </span>
            </div>
            <div className="md:col-span-6 flex items-center md:justify-end gap-8 font-oswald text-sm sm:text-base uppercase tracking-widest text-white/60">
              <div>
                <span className="text-white font-bold block text-xl sm:text-2xl leading-none">12</span>
                <span className="text-[10px] text-white/40 tracking-[0.2em] font-bold block mt-1">OFFICERS</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-red font-bold block text-xl sm:text-2xl leading-none">04</span>
                <span className="text-[10px] text-white/40 tracking-[0.2em] font-bold block mt-1">DIVISIONS</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-white font-bold block text-xl sm:text-2xl leading-none">2024-25</span>
                <span className="text-[10px] text-white/40 tracking-[0.2em] font-bold block mt-1">ACADEMIC YEAR</span>
              </div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* ─── 02. EDITORIAL ROSTER (Clean White Section) ─── */}
      <section className="py-24 relative z-10 bg-white text-navy border-b border-gray-200/80">
        
        {/* Sticky Filter Bar */}
        <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-y border-gray-200/80 py-4 mb-16 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Track */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(["ALL", "CORE LEADERSHIP", "TECHNICAL LABS", "MEDIA & CREATIVE", "OPERATIONS & EVENTS"] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "relative px-5 py-2.5 text-[11px] font-oswald uppercase font-bold tracking-widest rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 border",
                    activeCategory === cat ? "bg-red text-white border-red shadow-md" : "bg-gray-100 text-navy/70 border-gray-200 hover:border-navy/30 hover:text-navy"
                  )}
                >
                  {cat === "CORE LEADERSHIP" ? "CORE" : cat === "TECHNICAL LABS" ? "TECH" : cat === "MEDIA & CREATIVE" ? "MEDIA" : cat === "OPERATIONS & EVENTS" ? "EVENTS" : "ALL"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-navy/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ROSTER..."
                className="w-full bg-gray-100 text-navy placeholder:text-navy/40 pl-11 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all font-oswald text-xs tracking-widest uppercase"
              />
            </div>

          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative items-start">
            
            {/* LEFT: SCROLLABLE TYPOGRAPHY LIST */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${searchQuery}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-0"
                >
                  {filteredMembers.length === 0 ? (
                    <div className="py-20 text-navy/40 font-oswald text-2xl uppercase font-bold tracking-tight">
                      No matches found.
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <div 
                        key={member.id}
                        onMouseEnter={() => setHoveredMemberId(member.id)}
                        className="group border-b border-gray-200/80 py-8 lg:py-10 cursor-pointer relative"
                      >
                        {/* Desktop layout: huge name */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                          <div className="flex-1">
                            <span className="font-oswald text-[10px] text-red font-bold uppercase tracking-[0.25em] mb-2 block sm:hidden">
                              {member.role}
                            </span>
                            <h3 className="font-oswald text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase text-navy/70 group-hover:text-navy transition-colors duration-300 leading-[0.9]">
                              {member.name}
                            </h3>
                          </div>
                          
                          <div className="hidden sm:block text-right shrink-0 pb-1">
                            <span className="block font-oswald text-xl font-bold text-navy/80 group-hover:text-red transition-colors">
                              {member.role}
                            </span>
                            <span className="block font-inter text-[10px] uppercase font-bold tracking-[0.2em] text-navy/40 mt-1">
                              {member.category}
                            </span>
                          </div>
                        </div>

                        {/* Mobile: Accordion Image Reveal */}
                        <div className="block lg:hidden mt-6 overflow-hidden">
                          <div className="aspect-[4/5] sm:aspect-video relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                            <Image src={member.img} alt={member.name} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent" />
                            
                            {/* Mobile Bio overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 text-white">
                              <p className="font-inter text-sm font-normal opacity-90 line-clamp-3 mb-5">
                                {member.bio}
                              </p>
                              <div className="flex items-center gap-3">
                                {member.email && (
                                  <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-red hover:border-red transition-all">
                                    <Mail className="w-4 h-4 text-white" />
                                  </a>
                                )}
                                <a href="#" className="w-10 h-10 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-navy transition-all">
                                  <Linkedin className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT: STICKY HUGE PORTRAIT (Desktop Only - Dark Accent Card) */}
            <div className="hidden lg:block lg:col-span-5 relative self-start sticky top-28">
              <div className="h-[calc(100vh-9rem)] min-h-[500px] w-full rounded-3xl overflow-hidden bg-navy shadow-2xl border border-gray-200/20 group relative">
                <AnimatePresence>
                  {activeHoveredMember && (
                    <motion.div
                      key={activeHoveredMember.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={activeHoveredMember.img} 
                        alt={activeHoveredMember.name} 
                        fill 
                        sizes="(max-width: 1200px) 50vw, 40vw"
                        priority
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent opacity-90 pointer-events-none" />

                      {/* Bio & Socials overlay on image */}
                      <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 text-white flex flex-col justify-end h-full z-10 pointer-events-auto">
                        <motion.div 
                          key={`info-${activeHoveredMember.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="font-oswald text-[11px] uppercase tracking-[0.25em] text-red font-bold mb-2 block">
                            {activeHoveredMember.category}
                          </span>
                          <h4 className="font-oswald text-3xl xl:text-4xl font-bold uppercase mb-3 leading-none text-white">
                            {activeHoveredMember.name}
                          </h4>
                          <p className="font-inter text-sm xl:text-base text-white/80 font-normal leading-relaxed mb-6 max-w-sm">
                            {activeHoveredMember.bio}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            {activeHoveredMember.email && (
                              <a href={`mailto:${activeHoveredMember.email}`} className="w-11 h-11 rounded-full border border-white/20 hover:bg-red hover:border-red flex items-center justify-center transition-all cursor-pointer">
                                <Mail className="w-4 h-4 text-white" />
                              </a>
                            )}
                            <a href="#" className="w-11 h-11 rounded-full border border-white/20 hover:bg-white hover:text-navy flex items-center justify-center transition-all cursor-pointer">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 03. ACHIEVEMENTS MARQUEE (Dark Ribbon Section) ─── */}
      <section className="py-16 bg-[#1a1c22] text-white border-y border-white/10 overflow-hidden relative flex items-center z-10 shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] relative z-10">
          {[...achievements, ...achievements, ...achievements].map((achieve, idx) => (
            <div key={idx} className="flex items-center gap-8 mx-12">
              {React.createElement(ACH_ICONS[achieve.icon] ?? Trophy, { className: "w-10 h-10 text-red shrink-0" })}
              <div>
                <span className="font-oswald text-3xl md:text-4xl font-bold text-white uppercase tracking-tight block">
                  {achieve.title}
                </span>
                <span className="font-oswald text-[11px] text-white/50 uppercase font-bold tracking-[0.25em] block mt-1">
                  {achieve.subtitle}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-red mx-4 shadow-[0_0_10px_rgba(218,41,28,0.8)]" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── 04. DIRECTORY OF HERITAGE (Warm Off-White Section) ─── */}
      <section className="py-32 bg-[#FAF9F8] text-navy relative z-10 border-b border-gray-200/80">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="flex flex-col items-center text-center mb-20"
          >
            <span className="text-red font-oswald uppercase font-bold text-xs tracking-[0.25em] mb-4">
              THE ARCHIVES
            </span>
            <h2 className="font-oswald text-5xl sm:text-7xl font-bold text-navy uppercase tracking-tight">
              PAST LEADERSHIP
            </h2>
          </motion.div>

          <div className="space-y-6">
            {Object.entries(groupedPastExecom).sort((a, b) => b[0].localeCompare(a[0])).map(([year, members]) => (
              <motion.div 
                key={year}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => togglePastYear(year)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <h3 className="font-oswald text-3xl font-bold text-navy tracking-widest">{year}</h3>
                    <div className="px-3 py-1 rounded-full bg-gray-100 text-navy/70 font-oswald text-xs uppercase tracking-widest border border-gray-200">
                      {members.length} Members
                    </div>
                  </div>
                  <ChevronDown className={cn("w-6 h-6 text-navy/40 transition-transform duration-300", openYear === year ? "rotate-180" : "")} />
                </button>
                
                {/* GPU-Accelerated CSS Grid Accordion Container (Zero Lag) */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-out border-t border-gray-100",
                    openYear === year
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 sm:p-8 pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mb-8">
                        {members.filter(m => m.category === "Core").slice(0, 4).map((member, j) => (
                          <div key={j} className="flex flex-col items-center text-center group">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 relative shadow-md border-2 border-gray-200">
                              <Image src={member.img} alt={member.name} fill sizes="(max-width: 640px) 96px, 128px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="font-oswald text-lg font-bold text-navy uppercase block truncate w-full group-hover:text-red transition-colors">
                              {member.name}
                            </span>
                            <span className="font-inter text-[10px] font-bold text-red uppercase tracking-widest block truncate w-full mt-1">
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center pb-4">
                        <Link href={`/info/execom/${year.replace("-", "")}`} className="flex items-center gap-2 font-oswald text-sm font-bold uppercase tracking-widest text-white bg-navy hover:bg-red transition-colors px-8 py-3.5 rounded-full shadow-md">
                          <span>VIEW FULL ROSTER</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 05. JOIN CTA (High-Energy Red Section) ─── */}
      <section 
        ref={ctaRef}
        className="bg-red text-white py-32 lg:py-48 relative overflow-hidden flex flex-col items-center border-t border-red-500/30"
      >
        {/* Mega Background Typography */}
        <motion.div 
          style={{ x: ctaBgTextX }}
          className="absolute top-[45%] -translate-y-1/2 left-0 w-[300%] flex items-center opacity-10 pointer-events-none z-0"
        >
          <span className="font-oswald text-[30vw] font-bold tracking-tighter leading-none whitespace-nowrap mix-blend-overlay">
            JOIN EXECOM JOIN EXECOM JOIN EXECOM
          </span>
        </motion.div>

        {/* Foreground Content */}
        <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
          
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
             className="flex flex-col items-center w-full"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
               <span className="w-12 h-[2px] bg-white opacity-50" />
               <span className="font-oswald uppercase text-white/90 tracking-[0.3em] font-bold text-xs sm:text-sm">
                 LEADERSHIP RECRUITMENT
               </span>
               <span className="w-12 h-[2px] bg-white opacity-50" />
            </div>

            <h2 className="font-oswald text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold uppercase tracking-tighter leading-[0.85] mb-10 text-white drop-shadow-md">
              Shape The<br/>
              <span className="text-navy drop-shadow-none relative inline-block">
                Future
                <span className="text-white">.</span>
              </span>
            </h2>

            <p className="font-inter text-lg sm:text-xl lg:text-[1.35rem] text-white/90 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
              Have the drive and vision to push applied science forward? Join the leadership team and help orchestrate our next era of innovation.
            </p>
          </motion.div>

          {/* Massive Magnetic Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.5 }}
          >
            <Link 
              href="/info/join"
              className="group relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-navy rounded-full flex flex-col items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-500 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-[8px] border-transparent hover:border-white/20 cursor-pointer"
            >
              {/* Sweeping background on hover */}
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] z-0 rounded-full" />
              
              <div className="relative z-10 flex flex-col items-center justify-center overflow-hidden h-10 mb-2">
                 {/* Staggered text flip */}
                 <span className="font-oswald text-2xl lg:text-3xl text-white font-bold tracking-widest uppercase transition-transform duration-500 ease-[0.22,1,0.36,1] group-hover:-translate-y-full block">
                   Apply
                 </span>
                 <span className="absolute top-0 font-oswald text-2xl lg:text-3xl text-navy font-bold tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] block">
                   Apply
                 </span>
              </div>
              
              <div className="relative z-10 overflow-hidden w-8 h-8 flex items-center justify-center">
                <ArrowRight className="absolute w-8 h-8 text-white transition-transform duration-500 ease-[0.22,1,0.36,1] group-hover:translate-x-[150%] -rotate-45" />
                <ArrowRight className="absolute w-8 h-8 text-navy transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-[150%] group-hover:translate-x-0 -rotate-45" />
              </div>
            </Link>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
