"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Image from "next/image";

const goals = [
  {
    targetYear: "2025",
    title: "Open-Source Repository Initiative",
    description: "Launch centralized public GitHub organization for all Science Club projects, hardware schematics, and research codebases.",
    status: "Active Implementation",
    progress: 85,
    category: "Software & Hardware",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  },
  {
    targetYear: "2026",
    title: "Student-Run Fabrication Lab",
    description: "Build a dedicated campus facility equipped with 3D printing, PCB rapid prototyping, and sensor validation benches.",
    status: "In Progress",
    progress: 60,
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
  },
  {
    targetYear: "2026",
    title: "Semesterly Peer-Reviewed Papers",
    description: "Establish a pipeline enabling at least one student-authored research publication per semester in recognized journals.",
    status: "Underway",
    progress: 45,
    category: "Academic Research",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  },
  {
    targetYear: "2027",
    title: "Statewide Inter-College Science Summit",
    description: "Establish the largest student-organized inter-college science & engineering festival in Kerala.",
    status: "Milestone Target",
    progress: 30,
    category: "Community & Fest",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop",
  },
];

export function StrategicGoals() {
  return (
    <section className="py-24 md:py-36 bg-white text-navy border-t border-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold mb-4"
          >
            <span className="w-6 h-[2px] bg-red" />
            Strategic Roadmap
          </motion.div>

          <div className="overflow-hidden mb-6">
            <motion.h2
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-oswald text-4xl md:text-6xl font-bold uppercase text-navy tracking-tight"
            >
              2025 &ndash; 2027 Targets
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg font-inter leading-relaxed"
          >
            Our mission is defined by measurable objectives. Here is how we track our infrastructure buildout and student impact over the coming three years.
          </motion.p>
        </div>

        {/* Milestone Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {goals.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-gray-200/90 bg-[#FAF9F8] overflow-hidden shadow-md flex flex-col justify-between"
            >
              {/* Visual Image Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/40" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red text-white font-oswald text-xs font-bold uppercase tracking-wider">
                    Target {item.targetYear}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-navy/80 text-white font-oswald text-xs font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <h3 className="font-oswald text-2xl font-bold uppercase text-white line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Body Content & Progress Bar */}
              <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <p className="text-gray-600 text-sm font-inter leading-relaxed mb-6">
                  {item.description}
                </p>

                <div>
                  <div className="flex items-center justify-between text-xs font-oswald uppercase tracking-wider mb-2">
                    <span className="text-navy font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red" />
                      Status: {item.status}
                    </span>
                    <span className="text-red font-bold font-mono">{item.progress}% Complete</span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      className="h-full bg-red rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
