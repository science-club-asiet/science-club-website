"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function Hero({
  badge = "Spring Symposium 2026",
  title = "INNOVATE. DISCOVER. CREATE.",
}: { badge?: string; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax translation for the background image
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  
  const textTitle = title.split(" ");

  return (
    <section ref={containerRef} style={{ position: "relative" }} className="relative h-[85vh] lg:h-screen w-full overflow-hidden bg-navy flex flex-col justify-end">
      {/* Background Image with slow continuous scale AND vertical Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute top-0 left-0 h-[120%] w-full opacity-0 origin-center transition-opacity duration-1000 ease-in opacity-100 scale-100 hover:scale-105 duration-[20000ms] pointer-events-none"
      >
        <Image
          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop"
          alt="Science Hub"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Dark gradient overlay anchored to bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent lg:brand-gradient pointer-events-none" />

      {/* Content strictly bottom-left aligned */}
      <div className="container mx-auto px-4 lg:px-6 relative z-10 w-full mb-20 lg:mb-32 font-oswald text-white pointer-events-none">
        <div className="max-w-5xl overflow-hidden">
          <motion.div
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 2.2, ease: [0.76, 0, 0.24, 1] }} 
             className="inline-block bg-white text-red uppercase tracking-widest px-6 py-2 text-sm md:text-base font-bold mb-6 rounded-full shadow-lg"
          >
            {badge}
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] uppercase font-bold leading-[0.85] tracking-tight drop-shadow-lg flex flex-col">
            {textTitle.map((word, index) => (
              <span key={index} className="overflow-hidden block">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1,
                    delay: 2.4 + index * 0.15, // Starts exactly after Loader finishes (2.0s)
                    ease: [0.76, 0, 0.24, 1]
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
