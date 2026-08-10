"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Flame, Droplet, Zap, Fingerprint, Activity } from "lucide-react";
import type { TeamWithMembers, ExecomMemberCard } from "@/lib/data/execom";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Teams + current-term members are fetched from Supabase and passed in as a
// prop (see src/lib/data/execom.ts → getTeamsWithMembers()).

type Member = ExecomMemberCard;

const ICONS = [Flame, Droplet, Zap, Fingerprint, Activity];

// ─── Dossier Card Component ───────────────────────────────────────────────────

function DossierCard({ member, index }: { member: Member; index: number }) {
  const Icon = ICONS[index % ICONS.length];

  return (
    // Fluid vh constraints completely eliminate vertical cutoff on smaller 1080p laptop screens
    <div className="w-[155px] sm:w-[175px] lg:w-[clamp(140px,20vh,230px)] flex-shrink-0 group flex flex-col snap-center">
      
      {/* Perfect Square Aspect Ratio to save vertical height beautifully */}
      <div className="relative w-full aspect-square">
        
        {/* The Clipped Image Layer */}
        <div 
          className="absolute inset-0 bg-gray-200 overflow-hidden transform-gpu"
          style={{ clipPath: "url(#dossier-cutout)" }}
        >
          <Image
            src={member.img || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%231e293b'/><circle cx='50' cy='38' r='20' fill='%2394a3b8'/><path d='M20 85 a30 30 0 0 1 60 0' fill='%2394a3b8'/></svg>"}
            alt={member.name}
            fill
            unoptimized={!member.img || member.img.startsWith("data:") || member.img.endsWith(".svg")}
            sizes="(max-width: 1024px) 175px, 230px"
            className="object-cover transition-transform duration-[800ms] ease-[0.22,1,0.36,1] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-navy/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
        </div>

        {/* Top-Left Nested Button */}
        {/* Pushed negatively to perfectly nest inside the white cavity without overlapping the image */}
        <button aria-label={`View ${member.name}'s profile`} className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-8 h-8 md:w-10 md:h-10 lg:w-[clamp(2.5rem,5vh,3.5rem)] lg:h-[clamp(2.5rem,5vh,3.5rem)] bg-[#1a1c22] rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:bg-red shadow-lg group-hover:-translate-y-0.5 z-20">
          <ArrowUpRight className="w-4 h-4 xl:w-5 xl:h-5" />
        </button>

        {/* Bottom-Right Nested Pill/Icon */}
        <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 lg:w-[clamp(2.5rem,5vh,3.5rem)] lg:h-[clamp(2.5rem,5vh,3.5rem)] bg-white rounded-full border border-gray-100 flex items-center justify-center text-navy shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:text-red hover:scale-105 z-20">
          <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
        </div>

      </div>

      {/* Typography Block */}
      <div className="mt-2 lg:mt-[clamp(0.5rem,1.5vh,1.25rem)] px-1 lg:px-2 flex flex-col items-center text-center bg-transparent">
        <h4 className="font-oswald text-[1.1rem] sm:text-lg md:text-xl lg:text-[clamp(1.1rem,2vh,1.5rem)] font-bold uppercase text-navy leading-none mb-1 group-hover:text-red transition-colors duration-300 line-clamp-1">
          {member.name}
        </h4>
        <p className="font-inter text-red text-[9px] lg:text-[clamp(9px,1.2vh,12px)] font-bold uppercase tracking-wider mb-1 lg:mb-[clamp(0.25rem,0.8vh,0.5rem)] opacity-90 line-clamp-1">
          {member.role}
        </p>
        <p className="font-inter text-gray-500 text-[10px] lg:text-[clamp(10px,1.4vh,12px)] leading-relaxed line-clamp-2">
          {member.bio}
        </p>
      </div>

    </div>
  );
}

// ─── Team Panel ───────────────────────────────────────────────────────────────

function TeamPanel({ team }: { team: TeamWithMembers }) {
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { once: true, margin: "-10%" });

  return (
    // CSS clamps map directly to `vh` so the padding compresses perfectly on smaller screens
    <div className="w-full lg:w-screen flex-shrink-0 flex flex-col items-center justify-start h-auto lg:h-screen bg-[#FAF9F8] relative overflow-hidden py-24 lg:py-0 lg:pt-[clamp(5rem,12vh,8rem)] border-b lg:border-r border-gray-200/50">
      
      {/* Aesthetic Background Numbers */}
      <span className="absolute top-[8%] left-1/2 -translate-x-1/2 font-oswald text-[16rem] lg:text-[18vw] xl:text-[22vw] font-bold text-gray-100/40 leading-none select-none pointer-events-none tracking-tighter mix-blend-multiply z-0">
        {team.label}
      </span>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center h-full">
        
        {/* Top Centered Header Block */}
        <div ref={inViewRef} className="text-center mb-10 lg:mb-[clamp(1.5rem,4vh,4rem)]">
          <div className="flex items-center justify-center gap-3 mb-2 lg:mb-[clamp(0.5rem,1.5vh,1rem)]">
            <span className="h-[2px] w-4 lg:w-6 bg-red rounded-full" />
            <span className="font-oswald text-red uppercase text-xs lg:text-[clamp(10px,1.5vh,14px)] tracking-[0.2em] font-bold">{team.name}</span>
            <span className="h-[2px] w-4 lg:w-6 bg-red rounded-full" />
          </div>
          <h3 className="font-oswald text-3xl md:text-4xl lg:text-[clamp(2rem,4.5vh,3rem)] border-navy font-bold uppercase text-navy leading-tight tracking-tight mb-2 lg:mb-[clamp(0.5rem,1.5vh,1rem)]">
            {team.tagline}
          </h3>
          <p className="font-inter text-gray-500 text-sm lg:text-[clamp(12px,1.8vh,16px)] leading-relaxed max-w-2xl mx-auto px-4">
            {team.description}
          </p>
        </div>

        {/* 2-Row Flex Grid Below */}
        {/* Fluid gap scaling relative to vertical height */}
        <div className="w-full flex flex-wrap justify-center items-start gap-x-2 sm:gap-x-4 lg:gap-x-6 xl:gap-x-10 gap-y-8 lg:gap-y-[clamp(1rem,3.5vh,3rem)] xl:gap-y-[clamp(1.5rem,4vh,3rem)] shrink-0">
          {team.members.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.5, delay: 0.1 + (i * 0.05), ease: "easeOut" }}
            >
              <DossierCard member={member} index={i} />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ExecomSection({ teams }: { teams: TeamWithMembers[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const panels = teams.length;

    // gsap.matchMedia only runs the horizontal-pin setup at >=1024px and
    // automatically reverts it when the viewport crosses back below the
    // breakpoint. The old raw `innerWidth < 1024` guard never re-ran on resize,
    // leaving a broken/absent pin (and a stuck scroll height) after a resize.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Horizontal pinned track. NOTE: intentionally NO ScrollTrigger `snap` —
      // ScrollTrigger's snap animates the native scroll position, which fights
      // Lenis' smooth-scroll RAF and makes the page oscillate back/forth on its
      // own once the user stops scrolling. Let Lenis own the scroll entirely.
      gsap.to(track, {
        x: () => -((panels - 1) * window.innerWidth),
        ease: "none",
        scrollTrigger: {
          id: "execom-st",
          trigger: container,
          start: "top top",
          end: () => `+=${(panels - 1) * window.innerWidth}`,
          scrub: 1.0,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Lightweight Header Fade Out
      const header = document.getElementById("main-nav-header");
      if (header) {
        gsap.to(header, {
          y: -80,
          opacity: 0,
          pointerEvents: "none",
          duration: 0.4,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: container,
            start: "top 10%",
            end: () => `+=${((panels - 1) * window.innerWidth) + window.innerHeight * 0.8}`,
            toggleActions: "play reverse play reverse",
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return () => mm.revert();
  }, [teams.length]);

  return (
    <section className="bg-[#FAF9F8]">
      
      {/* 
        ─── GLOBAL SVG DEFS ─── 
        Equally-proportioned concave SVG mask built for the aspect-square containers.
        M 0.26 0 creates a mathematically perfect 26% indentation hole.
      */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="dossier-cutout" clipPathUnits="objectBoundingBox">
            <path d="
              M 0.26 0 
              L 0.85 0 
              C 0.92 0 1 0.08 1 0.15 
              L 1 0.74 
              C 0.85 0.74 0.74 0.85 0.74 1 
              L 0.15 1 
              C 0.08 1 0 0.92 0 0.85 
              L 0 0.26 
              C 0.15 0.26 0.26 0.15 0.26 0 
              Z" 
            />
          </clipPath>
        </defs>
      </svg>

      {/* ── Desktop: Horizontal Presentation Snapping timeline ── */}
      <div className="hidden lg:block border-t border-gray-200/50">
        <div ref={containerRef} className="h-screen w-full relative bg-[#FAF9F8] overflow-hidden">
          
          <div className="absolute top-8 left-12 xl:left-20 z-40 flex items-center gap-4 text-navy/40 pointer-events-none">
            <span className="w-8 h-[2px] bg-navy/20" />
            <span className="font-oswald uppercase text-xs tracking-[0.25em] font-bold">Execom Roster</span>
          </div>

          <div ref={trackRef} className="flex h-full w-max will-change-transform">
            {teams.map((team) => (
              <TeamPanel key={team.id} team={team} />
            ))}
          </div>
          
        </div>
      </div>

      {/* ── Mobile: Native smooth vertical stack (Scaled Down) ── */}
      <div className="lg:hidden border-t border-gray-200/50 relative overflow-hidden bg-[#FAF9F8]">
        {/* Subtle decorative banner */}
        <div className="pt-24 pb-8 px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-[2px] w-6 bg-red rounded-full" />
            <span className="font-oswald uppercase text-red text-xs tracking-[0.2em] font-bold">Executive Committee</span>
            <span className="h-[2px] w-6 bg-red rounded-full" />
          </div>
          <h2 className="font-oswald text-5xl uppercase font-bold text-navy leading-[0.9] tracking-tight">
            Our Teams
          </h2>
        </div>
        <div className="flex flex-col">
          {teams.map((team) => (
            <TeamPanel key={team.id} team={team} />
          ))}
        </div>
      </div>
      
    </section>
  );
}
