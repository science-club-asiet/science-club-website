"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function MissionCta() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Parallax for Mega Background Text
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const megaTextX = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);

  return (
    <section
      ref={containerRef}
      className="bg-navy text-white py-32 md:py-48 relative overflow-hidden flex flex-col items-center border-t border-white/10"
    >
      {/* Mega Scroll-Parallax Background Typography */}
      <motion.div
        style={{ x: megaTextX }}
        className="absolute top-[45%] -translate-y-1/2 left-0 w-[400%] flex items-center opacity-10 pointer-events-none z-0 select-none"
      >
        <span className="font-oswald text-[28vw] font-bold tracking-tighter uppercase whitespace-nowrap leading-none">
          JOIN THE MISSION &bull; BUILD THE FUTURE &bull; ASIET SCIENCE &bull;
        </span>
      </motion.div>

      {/* Foreground Content */}
      <div className="container relative z-10 mx-auto px-4 lg:px-8 max-w-6xl flex flex-col items-center text-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center w-full"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="w-10 h-[2px] bg-red" />
            <span className="font-oswald uppercase text-red tracking-[0.3em] font-bold text-xs md:text-sm">
              Initiate Participation
            </span>
            <span className="w-10 h-[2px] bg-red" />
          </div>

          {/* Enormous Display Heading */}
          <h2 className="font-oswald text-6xl sm:text-8xl lg:text-[10rem] font-bold uppercase tracking-tight leading-[0.85] mb-10 text-white">
            Help Us Shape <br />
            <span className="text-red">The Next Chapter.</span>
          </h2>

          {/* Subtitle */}
          <p className="font-inter text-lg sm:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-16 leading-relaxed font-normal">
            Ditch passive lectures. Build hardware that operates, write code that ships, and conduct open-access research with us today.
          </p>
        </motion.div>

        {/* Massive Interactive Circular Magnetic Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="mb-16"
        >
          <Link
            href="/info/join"
            className="group relative w-52 h-52 md:w-64 md:h-64 bg-red rounded-full flex flex-col items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-500 ease-out shadow-[0_20px_50px_rgba(218,41,28,0.4)] border-[8px] border-white/10"
          >
            {/* Sweeping background on hover */}
            <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] z-0 rounded-full" />

            <div className="relative z-10 flex flex-col items-center justify-center overflow-hidden h-10 mb-2">
              {/* Staggered text flip (Desktop only flip; clean static text on mobile) */}
              <span className="font-oswald text-2xl lg:text-3xl text-white font-bold tracking-widest uppercase transition-transform duration-500 ease-[0.22,1,0.36,1] md:group-hover:-translate-y-full block">
                Join Us
              </span>
              <span className="hidden md:block absolute top-0 font-oswald text-2xl lg:text-3xl text-navy font-bold tracking-widest uppercase translate-y-full md:group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]">
                Join Us
              </span>
            </div>

            <div className="relative z-10 overflow-hidden w-8 h-8 flex items-center justify-center">
              <ArrowRight className="w-7 h-7 md:w-8 md:h-8 text-white transition-transform duration-500 ease-[0.22,1,0.36,1] md:group-hover:translate-x-[150%] -rotate-45" />
              <ArrowRight className="hidden md:block absolute w-8 h-8 text-navy transition-transform duration-500 ease-[0.22,1,0.36,1] -translate-x-[150%] md:group-hover:translate-x-0 -rotate-45" />
            </div>
          </Link>
        </motion.div>

        {/* Secondary Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm font-oswald uppercase tracking-widest"
        >
          <Link
            href="/events"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 transition-colors text-white/80 hover:text-white"
          >
            Explore Active Events <ArrowUpRight className="w-4 h-4 text-red" />
          </Link>

          <Link
            href="/info/about"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 transition-colors text-white/80 hover:text-white"
          >
            Learn Our History <ArrowUpRight className="w-4 h-4 text-red" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
