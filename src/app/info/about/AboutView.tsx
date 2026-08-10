"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { StoryEra } from "@/lib/data/content";
import type { StatItem } from "@/lib/data/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AnimatedCounter = ({ value, label, index }: { value: string, label: string, index: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) {
      const target = parseInt(value.replace(/[^0-9]/g, ''));
      const suffix = value.replace(/[0-9]/g, '');
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2.5,
        ease: "power3.out",
        delay: index * 0.15,
        onUpdate: () => {
          if (spanRef.current) {
            spanRef.current.innerText = Math.floor(obj.val) + suffix;
          }
        }
      });
    }
  }, [isInView, value, index]);

  return (
    <div ref={containerRef} className="flex flex-col border-l-[3px] border-white/20 pl-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500 -z-10" />
      <motion.span
        initial={{ y: 20, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-oswald text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-2"
      >
        <span ref={spanRef}>0{value.replace(/[0-9]/g, '')}</span>
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
        className="font-oswald uppercase tracking-[0.2em] text-xs sm:text-sm font-bold text-white/70"
      >
        {label}
      </motion.span>
    </div>
  );
};

// Story timeline is fetched from Supabase and passed in as the storyEras prop.

export function AboutView({ storyEras, stats }: { storyEras: StoryEra[]; stats: StatItem[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroText1Ref = useRef<HTMLSpanElement>(null);
  const heroText2Ref = useRef<HTMLSpanElement>(null);

  const pinRef = useRef<HTMLDivElement>(null);
  const leftImages = useRef<(HTMLDivElement | null)[]>([]);
  const rightTexts = useRef<(HTMLDivElement | null)[]>([]);
  const mobileTexts = useRef<(HTMLDivElement | null)[]>([]);

  const manifestoRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {

      const mm = gsap.matchMedia();

      // DESKTOP ANIMATIONS
      mm.add("(min-width: 768px)", () => {

        // 1. Hero Parallax & Zoom Out
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=250%",
            scrub: 2,
            pin: true,
            anticipatePin: 1
          }
        });

        heroTl.to({}, { duration: 0.2 }) // Buffer at start
          .to(heroImgRef.current, { width: "100%", height: "100vh", ease: "power2.inOut", duration: 1 }, 0.2)
          .to(heroText1Ref.current, { xPercent: -100, opacity: 0, ease: "power2.out", duration: 1 }, 0.2)
          .to(heroText2Ref.current, { xPercent: 100, opacity: 0, ease: "power2.out", duration: 1 }, 0.2)
          .to({}, { duration: 0.2 }); // Buffer at end

        // 2. The Pinned Split-Screen Story
        if (leftImages.current.length === storyEras.length && rightTexts.current.length === storyEras.length) {
          // Initialize first text elements to be visible
          const firstTextElements = rightTexts.current[0]?.querySelectorAll('.stagger-text');
          if (firstTextElements) {
            gsap.set(firstTextElements, { opacity: 1, y: 0 });
          }
          // Hide all other text elements
          for (let j = 1; j < storyEras.length; j++) {
            const hiddenElements = rightTexts.current[j]?.querySelectorAll('.stagger-text');
            if (hiddenElements) gsap.set(hiddenElements, { opacity: 0, y: 50 });
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top top",
              end: "+=600%", // Longer scrub distance for maximum smoothness
              scrub: 2,
              pin: true,
              anticipatePin: 1,
            }
          });

          tl.to({}, { duration: 0.5 }); // Buffer at start

          storyEras.forEach((_, i) => {
            if (i === 0) return;

            const prevTextElements = rightTexts.current[i - 1]?.querySelectorAll('.stagger-text');
            const nextTextElements = rightTexts.current[i]?.querySelectorAll('.stagger-text');

            const position = tl.duration(); // get current timeline position to sync animations

            // Image Transition: Clip-path wipe over previous image + inner scale parallax
            tl.to(leftImages.current[i - 1], { filter: "blur(10px)", scale: 1.05, duration: 1, ease: "power2.inOut" }, position)
              .fromTo(leftImages.current[i],
                { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
                { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1, ease: "power2.inOut" },
                position
              )
              .fromTo(leftImages.current[i]!.querySelector('img')!,
                { scale: 1.3 },
                { scale: 1, duration: 1, ease: "power2.inOut" },
                position
              )

              // Text Transition: Stagger elements up and out, then stagger new ones in
              .to(prevTextElements!, { opacity: 0, y: -40, stagger: 0.1, duration: 0.8, ease: "power2.inOut" }, position)
              .fromTo(nextTextElements!,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" },
                position + 0.5 // Start slightly after image wipe starts
              );
          });

          tl.to({}, { duration: 0.5 }); // Buffer at end
        }
      });

      // MOBILE ANIMATIONS
      mm.add("(max-width: 767px)", () => {

        // 1. Mobile Hero Pin & Zoom
        const mobHeroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=180%",
            scrub: 2,
            pin: true,
            anticipatePin: 1
          }
        });

        mobHeroTl.to({}, { duration: 0.2 }) // Buffer at start
          .to(heroImgRef.current, { width: "100%", height: "50vh", ease: "power2.inOut", duration: 1 }, 0.2)
          .to(heroText1Ref.current, { xPercent: -100, opacity: 0, ease: "power2.out", duration: 1 }, 0.2)
          .to(heroText2Ref.current, { xPercent: 100, opacity: 0, ease: "power2.out", duration: 1 }, 0.2)
          .to({}, { duration: 0.2 }); // Buffer at end

        // 2. Mobile Story Stack Reveal
        mobileTexts.current.forEach((text) => {
          if (!text) return;
          const elements = text.querySelectorAll('.stagger-text');
          gsap.fromTo(elements,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out",
              scrollTrigger: {
                trigger: text,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      });

      // 3. Manifesto Text Reveal (Shared)
      const words = manifestoRef.current?.querySelectorAll(".manifesto-word");
      if (words && words.length > 0) {
        gsap.fromTo(words,
          { opacity: 0, y: 50, rotateX: -60, transformOrigin: "0% 50% -50" },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: manifestoRef.current,
              start: "top 80%",
              end: "bottom 45%",
              scrub: 1.5,
            }
          }
        );
      }

      // 4. Infinite Marquee with Scroll Velocity Tracking
      if (marqueeRef.current) {
        // Base GSAP timeline for horizontal scrolling
        const marqueeTl = gsap.to(marqueeRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 30, // base speed
          ease: "none",
        });

        // Add scrollTrigger to modify timeScale based on velocity
        ScrollTrigger.create({
          trigger: marqueeRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            // Default timeScale is 1. If scrolling fast, velocity increases it.
            let targetTimeScale = 1 + Math.abs(velocity / 100);

            // Cap the max speed
            if (targetTimeScale > 8) targetTimeScale = 8;

            // Reverse direction if scrolling up
            if (self.direction === -1) {
              targetTimeScale = -targetTimeScale;
            }

            // Tween the timeScale of our loop
            gsap.to(marqueeTl, {
              timeScale: targetTimeScale,
              duration: 0.15, // react quickly
              overwrite: true,
              onComplete: () => {
                // smoothly ease back to normal speed (or backwards normal if they were scrolling up)
                gsap.to(marqueeTl, { timeScale: self.direction === -1 ? -1 : 1, duration: 1.2, ease: "power2.out" });
              }
            });
          }
        });
      }

    });

    return () => ctx.revert();
  }, [storyEras]);

  const manifestoWords = [
    { text: "We", style: "" },
    { text: "are", style: "" },
    { text: "not", style: "" },
    { text: "just", style: "" },
    { text: "a", style: "" },
    { text: "club.", style: "font-playfair italic text-transparent stroke-white stroke-2" },
    { text: "We", style: "" },
    { text: "are", style: "" },
    { text: "a", style: "" },
    { text: "laboratory", style: "font-playfair italic text-red" },
    { text: "with", style: "" },
    { text: "a", style: "" },
    { text: "membership", style: "" },
    { text: "card.", style: "" },
    { text: "We", style: "" },
    { text: "prioritize", style: "" },
    { text: "physical", style: "bg-red text-navy px-2" },
    { text: "experimentation", style: "bg-red text-navy px-2" },
    { text: "over", style: "" },
    { text: "pure", style: "" },
    { text: "theory.", style: "" },
    { text: "We", style: "" },
    { text: "build", style: "font-playfair italic text-white" },
    { text: "first", style: "" },
    { text: "and", style: "" },
    { text: "present", style: "" },
    { text: "later.", style: "text-red" }
  ];

  return (
    <div className="bg-navy text-white selection:bg-red selection:text-white">

      {/* Warm up the cross-origin connections used on this page (hoisted to
          <head> by React 19): the hero video CDN and the brand-logo SVG CDN. */}
      <link rel="preconnect" href="https://cdn.pixabay.com" />
      <link rel="preconnect" href="https://cdn.simpleicons.org" />

      {/* GLOBAL FILM GRAIN */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* 1. HERO PARALLAX */}
      <section ref={heroRef} className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-navy text-white">

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Central Parallax Video */}
        <div ref={heroImgRef} className="absolute z-10 w-[90vw] h-[40vh] md:w-[60vw] md:h-[60vh] overflow-hidden transform-gpu rounded-sm border border-white/10 shadow-2xl bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            // Poster paints instantly so the hero isn't blank while the video
            // buffers; `preload="metadata"` avoids eagerly downloading the whole
            // clip. autoPlay + muted starts playback without the old per-render
            // .play() ref callback (which fired on every re-render).
            poster="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop"
            className="w-full h-full object-cover scale-[1.05]"
          >
            {/* Optimized small version of the video for faster loading */}
            <source src="https://cdn.pixabay.com/video/2025/03/04/262464_small.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-navy/30 mix-blend-multiply" />
        </div>

        {/* Foreground Typography */}
        <div className="absolute z-20 flex flex-col justify-center w-full px-4 md:px-16 pointer-events-none">
          <h1 className="font-oswald text-[22vw] md:text-[18vw] leading-[0.75] tracking-tighter font-bold uppercase mix-blend-difference text-white">
            <span ref={heroText1Ref} className="block transform-gpu">THE</span>
            <span ref={heroText2Ref} className="block text-right transform-gpu">LEGACY</span>
          </h1>
        </div>

        {/* Floating Accents */}
        <div className="absolute bottom-12 left-4 md:left-12 z-30 flex items-center gap-6">
          <div className="w-12 md:w-24 h-[1px] bg-red" />
          <p className="font-inter text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50">Since 2012</p>
        </div>

        <div className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 z-30 flex flex-col items-end gap-4">
          <div className="w-[1px] h-12 md:h-24 bg-white/20" />
          <p className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/40" style={{ writingMode: 'vertical-rl' }}>Scroll down</p>
        </div>
      </section>

      {/* 2. THE STORY SCROLL */}
      <section ref={pinRef} className="w-full relative bg-[#FAF9F8] text-navy md:h-screen z-20 overflow-hidden">

        {/* DESKTOP: PINNED SPLIT SCREEN */}
        <div className="hidden md:flex w-full h-full">
          {/* Left Side: Images */}
          <div className="w-1/2 h-full relative bg-navy overflow-hidden">
            {storyEras.map((era, i) => (
              <div
                key={`img-${i}`}
                ref={(el) => { if (el) leftImages.current[i] = el; }}
                className="absolute inset-0 transform-gpu overflow-hidden"
                style={{ zIndex: i, clipPath: i === 0 ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" }}
              >
                <Image
                  src={era.img}
                  alt={era.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover origin-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/30 to-transparent mix-blend-multiply" />
              </div>
            ))}
          </div>

          {/* Right Side: Texts */}
          <div className="w-1/2 h-full relative flex items-center justify-center bg-[#FAF9F8] px-20 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#001C58 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {storyEras.map((era, i) => (
              <div
                key={`txt-${i}`}
                ref={(el) => { if (el) rightTexts.current[i] = el; }}
                className="absolute inset-0 flex flex-col justify-center px-16 lg:px-24 transform-gpu"
              >
                <div
                  className="stagger-text font-oswald text-[12rem] lg:text-[18rem] font-bold leading-none tracking-tighter absolute top-10 left-10 pointer-events-none text-transparent"
                  style={{ WebkitTextStroke: '2px rgba(0, 28, 88, 0.05)' }}
                >
                  {era.year}
                </div>
                <div className="relative z-10 pt-0">
                  <span className="stagger-text font-oswald uppercase text-red font-bold tracking-[0.2em] text-base mb-4 block">
                    {era.year}
                  </span>
                  <h2 className="stagger-text font-oswald text-6xl lg:text-7xl font-bold uppercase text-navy leading-[0.9] tracking-tighter mb-6 drop-shadow-sm">
                    {era.title}
                  </h2>
                  <p className="stagger-text font-inter text-gray-600 text-lg lg:text-xl leading-relaxed max-w-xl font-medium" dangerouslySetInnerHTML={{ __html: era.desc }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE: NATIVE STACKED SCROLL */}
        <div className="md:hidden flex flex-col w-full">
          {storyEras.map((era, i) => (
            <div key={`mob-${i}`} className="w-full flex flex-col min-h-[100dvh]">
              <div className="w-full h-[50vh] relative">
                <Image src={era.img} alt={era.title} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-navy/20 mix-blend-multiply" />
              </div>
              <div className="w-full flex-1 bg-[#FAF9F8] p-8 flex flex-col justify-center relative overflow-hidden border-b border-gray-200">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#001C58 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div ref={el => { if (el) mobileTexts.current[i] = el; }} className="relative z-10 w-full h-full flex flex-col justify-center">
                  <div
                    className="stagger-text font-oswald text-[8rem] font-bold leading-none tracking-tighter absolute -top-4 -left-4 pointer-events-none text-transparent"
                    style={{ WebkitTextStroke: '1.5px rgba(0, 28, 88, 0.05)' }}
                  >
                    {era.year}
                  </div>

                  <span className="stagger-text font-oswald uppercase text-red font-bold tracking-[0.2em] text-sm mb-4 block relative z-10">{era.year}</span>
                  <h2 className="stagger-text font-oswald text-5xl font-bold uppercase text-navy leading-[0.9] tracking-tighter mb-4 relative z-10">{era.title}</h2>
                  <p className="stagger-text font-inter text-gray-600 text-base font-medium relative z-10" dangerouslySetInnerHTML={{ __html: era.desc }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MANIFESTO REVEAL */}
      <section className="py-40 md:py-56 bg-navy flex items-center justify-center relative overflow-hidden z-30">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <Image src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000&auto=format&fit=crop" fill sizes="100vw" className="object-cover blur-sm" alt="" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div ref={manifestoRef} className="font-oswald text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[1.1] tracking-tighter text-white max-w-6xl mx-auto flex flex-wrap justify-center text-center" style={{ perspective: "1200px" }}>
            {manifestoWords.map((word, i) => (
              <span
                key={i}
                className={`manifesto-word inline-block transform-gpu mr-3 md:mr-4 mb-2 md:mb-4 ${word.style}`}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE NUMBERS */}
      <section className="py-24 lg:py-32 bg-red text-white overflow-hidden relative z-40">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/3">
              <span className="w-12 h-[2px] bg-white inline-block mb-6 opacity-50" />
              <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-[0.9] mb-6 drop-shadow-md">
                By The<br />Numbers
              </h2>
              <p className="font-inter text-white/90 font-medium text-lg max-w-sm">
                We don&apos;t measure success by meetings held. We measure it by projects shipped and skills learned.
              </p>
            </div>

            <div className="w-full md:w-2/3 grid grid-cols-2 gap-8 md:gap-16">
              {stats.map((stat, i) => (
                <AnimatedCounter key={i} value={stat.value} label={stat.label} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Infinite Marquee Brands */}
        <div className="flex overflow-hidden whitespace-nowrap mt-24 border-y border-white/10 py-8 bg-navy w-full relative">
          {/* Fading Edges for Marquee */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />

          <div
            ref={marqueeRef}
            className="flex gap-16 md:gap-32 items-center w-max"
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="flex items-center gap-16 md:gap-32">
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/tensorflow/white" className="h-8 md:h-12 w-auto" alt="TensorFlow" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">TENSORFLOW</span></div>
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/react/white" className="h-8 md:h-12 w-auto" alt="React" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">REACT</span></div>
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/arduino/white" className="h-8 md:h-12 w-auto" alt="Arduino" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">ARDUINO</span></div>
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/openai/white" className="h-8 md:h-12 w-auto" alt="OpenAI" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">OPENAI</span></div>
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/python/white" className="h-8 md:h-12 w-auto" alt="Python" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">PYTHON</span></div>
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/nodedotjs/white" className="h-8 md:h-12 w-auto" alt="Node.js" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">NODE.JS</span></div>
                <div className="flex items-center gap-4"><img src="https://cdn.simpleicons.org/figma/white" className="h-8 md:h-12 w-auto" alt="Figma" /><span className="font-inter font-bold tracking-widest text-lg md:text-2xl">FIGMA</span></div>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5. OPERATIONAL DIRECTIVES */}
      <section className="bg-navy text-white py-32 md:py-48 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-24 md:mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <h2 className="font-oswald text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter leading-none">
                Operational
                <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #ff0000' }}>Directives</span>
              </h2>
            </div>
            <p className="font-inter text-white/50 max-w-sm text-sm uppercase tracking-widest font-bold">
              The foundational tenets that govern our laboratory. We are not a club; we are an institution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {[
              {
                num: "01",
                title: "NO PURE THEORY.",
                desc: "Ideas are cheap. Code is reality. We prioritize functional prototypes over theoretical perfect architectures. If it works, we iterate. If it doesn't, we kill it."
              },
              {
                num: "02",
                title: "BREAK THINGS.",
                desc: "Innovation lives on the edge of failure. We encourage dismantling systems to understand their core. We don't just use tools; we build our own."
              },
              {
                num: "03",
                title: "DOCUMENT EVERYTHING.",
                desc: "A breakthrough unrecorded is a breakthrough lost. We mandate rigorous open-source logging, allowing the legacy of our lab to compound with every semester."
              }
            ].map((directive, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group relative border-t-2 border-white/10 pt-8 flex flex-col"
              >
                <div className="absolute top-[-2px] left-0 w-0 h-[2px] bg-red transition-all duration-700 ease-[0.22,1,0.36,1] group-hover:w-full" />

                <div className="flex items-end gap-4 mb-6">
                  <h3 className="font-oswald text-6xl md:text-8xl text-white/10 font-bold group-hover:text-red transition-colors duration-500 leading-none">
                    {directive.num}
                  </h3>
                  <div className="w-full border-b border-white/5 mb-4 group-hover:border-red/30 transition-colors duration-500" />
                </div>

                <h4 className="font-oswald text-2xl md:text-3xl font-bold uppercase tracking-widest mb-6">
                  {directive.title}
                </h4>

                <p className="font-inter text-white/60 leading-relaxed font-light text-base md:text-lg">
                  {directive.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER LINK */}
      <section className="bg-[#FAF9F8] py-32 md:py-48 text-navy relative z-50 overflow-hidden flex items-center justify-center min-h-screen">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#001C58 2px, transparent 2px)', backgroundSize: '48px 48px' }} />

        {/* Large Decorative Text in Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[25vw] font-bold text-navy/5 pointer-events-none whitespace-nowrap leading-none tracking-tighter mix-blend-multiply">
          THE LAB
        </div>

        {/* Rotating Badge */}
        <div className="absolute bottom-12 right-12 md:bottom-24 md:right-24 pointer-events-none hidden md:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="w-32 h-32 md:w-40 md:h-40 relative"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-red uppercase font-oswald font-bold tracking-widest text-[10px]">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
              <text>
                <textPath href="#circlePath" startOffset="0%">
                  SCIENCE CLUB • EST 2012 • JOIN US •
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-red">
              <ArrowUpRight className="w-8 h-8" />
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 flex flex-col items-center justify-center text-center relative z-10 w-full">
          <motion.h2
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="font-oswald flex flex-col text-7xl md:text-9xl lg:text-[12rem] font-bold uppercase tracking-tighter mb-8 leading-[0.85]"
          >
            <span className="text-transparent" style={{ WebkitTextStroke: '3px #001C58' }}>Ready To</span>
            <span className="text-red">Build?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-inter text-gray-600 text-lg md:text-2xl font-medium max-w-2xl mx-auto mb-16"
          >
            The laboratory is open. Bring your ideas, your obsessions, and your tools. We provide the rest.
          </motion.p>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <Link
              href="/info/join"
              className="group relative inline-flex items-center gap-6 bg-navy text-white px-10 md:px-16 py-6 md:py-8 rounded-full overflow-hidden hover:scale-105 transition-transform duration-500 shadow-2xl"
            >
              <div className="absolute inset-0 bg-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
              <span className="font-oswald uppercase tracking-[0.2em] text-xl md:text-3xl font-bold relative z-10 group-hover:text-white transition-colors duration-300">
                Join the Movement
              </span>
              <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-500 group-hover:rotate-45">
                <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

