"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function MissionHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgFrameRef = useRef<HTMLDivElement>(null);
  const heroTextLeftRef = useRef<HTMLDivElement>(null);
  const heroTextRightRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP PINNED PARALLAX EXPANSION (>= 768px)
      mm.add("(min-width: 768px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=220%",
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
          },
        });

        heroTl
          .to({}, { duration: 0.2 }) // Buffer at start
          // Expand center frame to full viewport
          .to(
            heroImgFrameRef.current,
            {
              width: "100vw",
              height: "100vh",
              borderRadius: "0px",
              ease: "power2.inOut",
              duration: 1.2,
            },
            0.2
          )
          // Split headings outward off screen
          .to(
            heroTextLeftRef.current,
            { xPercent: -120, opacity: 0, ease: "power2.inOut", duration: 1 },
            0.2
          )
          .to(
            heroTextRightRef.current,
            { xPercent: 120, opacity: 0, ease: "power2.inOut", duration: 1 },
            0.2
          )
          // Fade in overlay manifesto summary on full-bleed stage
          .fromTo(
            heroOverlayRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 0.8 },
            0.9
          )
          .to({}, { duration: 0.3 }); // Buffer at end
      });
    }, heroRef);

    // Refresh ScrollTrigger and Lenis limits after mount
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      if (window.__lenis) {
        window.__lenis.resize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={heroRef} className="relative bg-navy text-white overflow-hidden">
      {/* Ghost Background Outline Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden">
        <span
          className="font-oswald text-[12vw] font-bold uppercase tracking-tighter text-transparent whitespace-nowrap opacity-15"
          style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.4)" }}
        >
          SCIENCE CLUB MISSION
        </span>
      </div>

      {/* Desktop & Mobile Hero Stage Container */}
      <div className="min-h-screen relative flex items-center justify-center z-10 px-4 lg:px-8 py-24 md:py-0">
        
        {/* Split Text & Centered Expanding Photo Frame */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 relative">

          {/* Left Heading Text */}
          <div
            ref={heroTextLeftRef}
            className="md:w-1/3 text-center md:text-left z-20"
          >
            <div className="flex items-center justify-center md:justify-start gap-3 text-red font-oswald uppercase tracking-[0.3em] text-xs font-bold mb-4">
              <span className="w-8 h-[2px] bg-red" />
              Our Purpose
            </div>
            <h1 className="font-oswald text-5xl sm:text-7xl lg:text-9xl font-bold uppercase leading-[0.88] tracking-tight text-white">
              Uncompromising
            </h1>
          </div>

          {/* Centered Expanding Photo Frame */}
          <div
            ref={heroImgFrameRef}
            className="w-full md:w-[380px] lg:w-[440px] h-[350px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl relative border-2 border-white/20 z-10 flex-shrink-0"
          >
            <Image
              src="https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1600&auto=format&fit=crop"
              alt="Science Research"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-navy/30" />
          </div>

          {/* Right Heading Text */}
          <div
            ref={heroTextRightRef}
            className="md:w-1/3 text-center md:text-right z-20"
          >
            <h1 className="font-oswald text-5xl sm:text-7xl lg:text-9xl font-bold uppercase leading-[0.88] tracking-tight text-red">
              Curiosity
            </h1>
            <p className="text-white/70 text-sm md:text-base font-inter leading-relaxed max-w-xs mt-4 mx-auto md:ml-auto md:mr-0">
              Bridging inquiry and creation across engineering disciplines.
            </p>
          </div>

        </div>

        {/* Overlay Summary (Appears when photo expands on scroll) */}
        <div
          ref={heroOverlayRef}
          className="absolute bottom-12 inset-x-0 z-30 pointer-events-none px-4 lg:px-8 text-center max-w-4xl mx-auto opacity-0"
        >
          <div className="p-8 rounded-3xl bg-navy/85 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto">
            <h2 className="font-oswald text-3xl md:text-5xl font-bold uppercase text-white mb-4">
              Bridging Curiosity & Creation
            </h2>
            <p className="text-white/80 text-base md:text-lg font-inter leading-relaxed mb-6">
              Science Club ASIET empowers students to build hardware, write software, conduct experiments, and publish open-access findings before graduation.
            </p>
            <div className="flex justify-center gap-8 border-t border-white/15 pt-4">
              <div>
                <span className="font-oswald text-2xl md:text-3xl font-bold text-red block font-mono">100%</span>
                <span className="font-inter text-xs text-white/60 uppercase tracking-widest">Student Autonomous</span>
              </div>
              <div className="w-[1px] bg-white/15 h-8 self-center" />
              <div>
                <span className="font-oswald text-2xl md:text-3xl font-bold text-white block">Open</span>
                <span className="font-inter text-xs text-white/60 uppercase tracking-widest">Access Research</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
