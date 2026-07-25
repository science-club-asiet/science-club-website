"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const NEWS_INTERVAL = 6000; // 6 seconds per article

type NewsItem = {
  id: string;
  tag: string;
  date: string;
  title: string;
  desc: string;
  img: string;
  breaking?: boolean;
};

const news: NewsItem[] = [
  {
    id: "01",
    tag: "ACHIEVEMENTS",
    date: "MAR 14",
    title: "NSF Grant for IoT Architecture",
    desc: "Science Club ASIET has officially secured a massive endowment from the National Science Foundation. The funds will be purely injected into the new autonomous cross-mesh IoT grid built by our technical core team.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
    breaking: true,
  },
  {
    id: "02",
    tag: "PROJECTS",
    date: "FEB 28",
    title: "Renewable Energy Thermodynamics",
    desc: "Our thermal dynamics division has successfully finalized a proprietary micro-inverter capable of returning 14% extra payload yield in high-heat thermal zones.",
    img: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "03",
    tag: "INTERVIEW",
    date: "FEB 12",
    title: "Dr. Rajan on Quantum Ethics",
    desc: "A deep dive with our faculty advisor on the moral constraints of unbounded computational speed, and how students must pioneer strict safety protocols inside low-level network architectures.",
    img: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "04",
    tag: "WORKSHOP",
    date: "JAN 05",
    title: "Autonomous Swarm Deployment",
    desc: "Over 40 students converged on the mechanical wing last weekend for a live-flight calibration session. The entire drone swarm achieved perfect collision vectoring without external GPS.",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop",
  },
];

export function NewsSection() {
  const [expandedIndex, setExpandedIndex] = useState<string>(news[0].id);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cycle through each news item
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setExpandedIndex((prev) => {
        const idx = news.findIndex((n) => n.id === prev);
        return news[(idx + 1) % news.length].id;
      });
    }, NEWS_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleManualSelect = useCallback((id: string) => {
    setExpandedIndex(id);
    setIsPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    // Resume auto-cycling after 10s of inactivity
    pauseTimer.current = setTimeout(() => setIsPaused(false), 10000);
  }, []);

  return (
    <section className="relative w-full bg-[#FCFCFD] py-24 md:py-32 isolate">
      {/* ── Subtle Translucent Global Texture ── */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.04] grayscale mix-blend-multiply"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 w-full h-full flex flex-col justify-between">
        
        {/* ── Section Header ── */}
        <div className="flex items-center gap-4 mb-16 md:mb-20">
          <span className="w-12 h-1 bg-red" />
          <h2 className="font-oswald text-sm md:text-base uppercase tracking-[0.3em] font-bold text-gray-500">
            Latest News
          </h2>
        </div>

        {/* ── Interactive Vertical Accordion Matrix ── */}
        <div className="flex flex-col w-full border-t border-gray-200">
          {news.map((item) => {
            const isExpanded = expandedIndex === item.id;
            
            return (
              <div 
                key={item.id}
                onClick={() => handleManualSelect(item.id)}
                className={cn(
                  "relative border-b overflow-hidden cursor-pointer transition-[height,background-color] duration-[800ms] ease-[0.22,1,0.36,1] will-change-[height] group flex flex-col justify-end isolate",
                  isExpanded ? "h-[450px] sm:h-[500px] md:h-[550px]" : "h-20 lg:h-24 hover:bg-gray-50",
                  item.breaking ? "border-l-4 border-l-red border-b-gray-200" : "border-l-0 border-b-gray-200"
                )}
              >
                
                {/* ── Cinematic Background (Only active on expanded slice) ── */}
                <div className={cn(
                  "absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}>
                  {/* Photo bleeds through the navy at ~35% — faint enough to keep text crisp */}
                  <Image src={item.img} alt={item.title} fill sizes="100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-navy/75" />
                </div>

                {/* ── Top Level Fixed Bar (Collapsed Information) ── */}
                <div className="absolute top-0 left-0 right-0 flex items-center gap-4 md:gap-8 w-full h-20 lg:h-24 px-4 sm:px-6 md:px-8 z-20 pointer-events-none">
                    
                    {/* Left: Date + divider */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                       <span className={cn(
                          "font-oswald tracking-widest text-xs sm:text-sm font-bold uppercase transition-colors duration-[800ms]",
                          isExpanded ? "text-white/60" : "text-gray-400 group-hover:text-red"
                       )}>{item.date}</span>
                       <span className={cn(
                          "hidden sm:block h-[2px] w-6 md:w-8 transition-colors duration-[800ms]",
                          isExpanded ? "bg-white/20" : "bg-gray-300"
                       )} />
                    </div>

                    {/* Centre-left: Headline — left aligned, takes remaining space */}
                    <h3 className={cn(
                        "font-oswald text-lg sm:text-2xl lg:text-3xl uppercase font-bold transition-[opacity,transform] duration-[600ms] ease-[0.22,1,0.36,1] truncate flex-1 min-w-0",
                        isExpanded ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0 text-navy"
                    )}>
                      {item.title}
                    </h3>

                    {/* Right: BREAKING badge + Arrow */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      {item.breaking && !isExpanded && (
                        <span className="hidden sm:flex items-center gap-1.5 font-oswald text-[10px] tracking-[0.2em] font-bold uppercase text-red">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red" />
                          </span>
                          Breaking
                        </span>
                      )}
                      <ArrowUpRight className={cn(
                          "w-5 h-5 lg:w-6 lg:h-6 transition-[opacity,transform,color] duration-[600ms] ease-[0.22,1,0.36,1]",
                          isExpanded ? "text-white scale-50 opacity-0" : "text-navy group-hover:text-red scale-100 opacity-100"
                      )} />
                    </div>
                </div>

                {/* ── Progress fill bar — only visible on collapsed items during auto-cycle ── */}
                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100 pointer-events-none">
                    <span
                      key={`${item.id}-${isPaused}-${expandedIndex}`}
                      className="absolute inset-y-0 left-0 bg-red/70 rounded-full"
                      style={{
                        animation: (!isPaused && expandedIndex === news[(news.findIndex(n=>n.id===item.id) - 1 + news.length) % news.length].id)
                          ? `news-progress ${NEWS_INTERVAL}ms linear forwards`
                          : 'none',
                        width: '0%',
                      }}
                    />
                  </div>
                )}

                {/* ── Expanded Detail View (Content animates upwards into view) ── */}
                <div className={cn(
                  "relative z-10 w-full h-full flex flex-col justify-end p-4 sm:p-6 md:p-10 lg:p-16 transition-[opacity,transform] duration-[800ms] ease-[0.22,1,0.36,1]",
                  isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
                )}>
                   <div className="w-full max-w-4xl text-white">
                      
                      <span className="inline-block px-3 py-1 border border-white/20 rounded-full text-[10px] sm:text-xs font-oswald tracking-widest uppercase mb-4 sm:mb-6 text-white/50 bg-white/5 backdrop-blur-sm">
                        {item.tag}
                      </span>
                      
                      {/* Fixed scaling using responsive rems, completely avoiding dangerous vw! */}
                      <h3 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] uppercase font-bold mb-4 sm:mb-6 text-white drop-shadow-md">
                        {item.title}
                      </h3>
                      
                      <p className="font-inter text-white/80 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-6 sm:mb-10 line-clamp-2 md:line-clamp-3">
                        {item.desc}
                      </p>

                      {/* We make the button interactive since the parent redirects clicks */}
                      {/* Using pointer-events-auto directly overriding the pointer restrictions */}
                      <Link 
                        href={`/news/${item.id}`} 
                        onClick={(e) => {
                          e.stopPropagation(); // prevent parent expanding click
                        }}
                        className="inline-flex items-center gap-3 bg-red hover:bg-white text-white hover:text-navy px-6 sm:px-8 py-3 rounded-full font-oswald text-xs sm:text-sm uppercase tracking-widest font-bold transition-colors pointer-events-auto shadow-lg"
                      >
                         Read Full Story <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                      
                   </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Global CTA for News ── */}
        <div className="mt-16 md:mt-24 flex justify-end">
           <Link 
             href="/news"
             className="flex items-center gap-4 text-navy hover:text-red transition-colors font-oswald uppercase tracking-widest font-bold group text-sm md:text-base"
           >
             View All News
             <span className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-navy/20 flex items-center justify-center group-hover:border-red transition-colors">
               <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
             </span>
           </Link>
        </div>

      </div>

      <style>{`
        @keyframes news-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  );
}
