"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Hammer, Unlock, Users2, Rocket, ArrowRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const pillars = [
  {
    num: "01",
    icon: Compass,
    title: "Curiosity First",
    short: "Every question is worth asking. Intellectual curiosity is celebrated, never suppressed.",
    detail: "We encourage questions that break conventional course boundaries. Whether exploring quantum computing, autonomous robotics, or synthetic biology, curiosity drives our agenda.",
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop",
    tag: "EXPLORATION",
  },
  {
    num: "02",
    icon: Hammer,
    title: "Build, Don't Just Study",
    short: "Learning accelerates 10× when you make something real. Prototypes and code are our curriculum.",
    detail: "Textbooks give foundation, but building gives understanding. Every member works on tangible prototypes, hardware assemblies, or computational models throughout the year.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    tag: "PROTOTYPING",
  },
  {
    num: "03",
    icon: Unlock,
    title: "Radical Openness",
    short: "Our research, code, and findings are openly shared with the global scientific community.",
    detail: "Knowledge shouldn't sit behind closed doors. We host open GitHub repositories, publish open-access project documentations, and encourage peer critique.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    tag: "OPEN SOURCE",
  },
  {
    num: "04",
    icon: Users2,
    title: "Zero Hierarchy of Ideas",
    short: "The best idea wins — regardless of department, year of study, or title.",
    detail: "In Science Club, first-year insights carry equal weight to senior wisdom. We foster an environment where technical logic and evidence always triumph over authority.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    tag: "INCLUSIVITY",
  },
  {
    num: "05",
    icon: Rocket,
    title: "Tangible Execution",
    short: "We measure progress by completed projects, publications, and real-world demonstrations.",
    detail: "Ideas are only beginnings. We hold ourselves accountable to shipping finished work, entering technical competitions, and hosting public science exhibitions.",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop",
    tag: "EXECUTION",
  },
];

export function CorePillars() {
  const [activePillar, setActivePillar] = useState<number>(0);

  return (
    <section className="py-24 md:py-36 bg-[#FAF9F8] text-navy relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold mb-4"
            >
              <span className="w-6 h-[2px] bg-red" />
              Core Principles
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-oswald text-4xl md:text-6xl font-bold uppercase text-navy tracking-tight"
              >
                Our 5 Non-Negotiables
              </motion.h2>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 font-inter text-base max-w-md"
          >
            Click through each principle to explore how our values shape daily research, project funding, and club culture.
          </motion.p>
        </div>

        {/* Pillars Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Pillar Selector List */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {pillars.map((item, index) => {
              const Icon = item.icon;
              const isActive = activePillar === index;

              return (
                <motion.button
                  key={item.num}
                  onClick={() => setActivePillar(index)}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group",
                    isActive
                      ? "bg-navy text-white border-navy shadow-xl scale-[1.01]"
                      : "bg-white text-navy border-gray-200/80 hover:border-red/40 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <span className={cn(
                      "font-oswald text-2xl font-bold transition-colors font-mono",
                      isActive ? "text-red" : "text-gray-300 group-hover:text-red"
                    )}>
                      {item.num}
                    </span>
                    <div>
                      <h3 className={cn(
                        "font-oswald text-xl font-bold uppercase tracking-wide",
                        isActive ? "text-white" : "text-navy"
                      )}>
                        {item.title}
                      </h3>
                      <p className={cn(
                        "text-xs line-clamp-1 mt-0.5 font-inter",
                        isActive ? "text-white/70" : "text-gray-500"
                      )}>
                        {item.short}
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "p-2.5 rounded-full border transition-colors flex-shrink-0 ml-4",
                    isActive
                      ? "bg-red text-white border-red"
                      : "border-gray-200 text-gray-400 group-hover:border-red group-hover:text-red"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Active Pillar Feature Spotlight Card */}
          <div className="lg:col-span-6 sticky top-28">
            <AnimatePresence mode="wait">
              {pillars[activePillar] && (
                <motion.div
                  key={pillars[activePillar].num}
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
                >
                  {/* Visual Image Header */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={pillars[activePillar].image}
                      alt={pillars[activePillar].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-navy/40" />
                    
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red text-white font-oswald text-xs font-bold uppercase tracking-wider">
                      {pillars[activePillar].tag}
                    </div>

                    <div className="absolute bottom-4 left-6 right-6">
                      <span className="font-oswald text-3xl font-bold text-white/40 block mb-1 font-mono">
                        {pillars[activePillar].num}
                      </span>
                      <h3 className="font-oswald text-3xl font-bold uppercase text-white">
                        {pillars[activePillar].title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-8">
                    <p className="text-navy text-base md:text-lg font-medium font-inter leading-relaxed mb-6">
                      {pillars[activePillar].short}
                    </p>

                    <div className="p-6 rounded-2xl bg-[#FAF9F8] border border-gray-100">
                      <span className="text-xs font-oswald uppercase tracking-widest font-bold text-red block mb-2">
                        How We Execute
                      </span>
                      <p className="text-gray-600 text-sm leading-relaxed font-inter">
                        {pillars[activePillar].detail}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 flex items-center justify-between text-xs font-oswald uppercase tracking-wider text-gray-400">
                      <span>Principle {pillars[activePillar].num} of 05</span>
                      <span className="text-navy font-bold flex items-center gap-1">
                        Standard <ArrowRight className="w-3.5 h-3.5 text-red" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
