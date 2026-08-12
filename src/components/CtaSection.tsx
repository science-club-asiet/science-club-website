"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function CtaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setIsLoggedIn(true);
    });
  }, []);

  // Parallax for the massive background text
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgTextX = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  if (isLoggedIn) return null;

  return (
    <section 
      ref={containerRef} 
      id="join" 
      style={{ position: "relative" }}
      className="bg-red text-white py-32 lg:py-48 relative overflow-hidden flex flex-col items-center border-t border-red-500/30"
    >
      
      {/* Mega Background Typography */}
      <motion.div 
        style={{ x: bgTextX }}
        className="absolute top-[45%] -translate-y-1/2 left-0 w-[300%] flex items-center opacity-10 pointer-events-none z-0"
      >
        <span className="font-oswald text-[30vw] font-bold tracking-tighter leading-none whitespace-nowrap mix-blend-overlay">
          JOIN NOW JOIN NOW JOIN NOW
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
             <span className="font-oswald uppercase text-white/90 tracking-[0.3em] font-bold text-xs sm:text-sm">Action Required</span>
             <span className="w-12 h-[2px] bg-white opacity-50" />
          </div>

          <h2 className="font-oswald text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tighter leading-[0.85] mb-10 text-white drop-shadow-md">
            Shape The<br/>
            <span className="text-navy drop-shadow-none relative inline-block">
              Future
              <span className="text-white">.</span>
            </span>
          </h2>

          <p className="font-inter text-lg sm:text-xl lg:text-[1.35rem] text-white/90 max-w-2xl mx-auto mb-20 font-medium leading-relaxed">
            Ditch the textbooks. Get your hands dirty. Build things that actually matter. <br className="hidden md:block" />Join the largest science & maker community on campus today.
          </p>
        </motion.div>

        {/* Massive Magnetic Button */}
        <Link 
          href="/login?mode=signup"
          className="group relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-navy rounded-full flex flex-col items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-500 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[8px] border-transparent hover:border-white/10"
        >
          {/* Sweeping background on hover */}
          <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] z-0 rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center justify-center overflow-hidden h-10 mb-3">
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

      </div>
    </section>
  );
}
