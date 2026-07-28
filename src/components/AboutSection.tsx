"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { StatItem } from "@/lib/data/site";

const DEFAULT_STATS: StatItem[] = [
  { value: "240+", label: "Active Members" },
  { value: "38", label: "Live Projects" },
  { value: "12yrs", label: "Established" },
  { value: "6", label: "Departments" },
];

export function AboutSection({ stats = DEFAULT_STATS }: { stats?: StatItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3 mb-14"
        >
          <span className="h-[3px] w-8 bg-red rounded-full" />
          <span className="font-oswald uppercase text-red text-sm tracking-[0.2em] font-bold">
            About the Club
          </span>
        </motion.div>

        {/* 2-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-stretch mb-20">

          {/* Left — image card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="relative rounded-3xl overflow-hidden min-h-[420px] lg:min-h-0"
          >
            <Image
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1400&auto=format&fit=crop"
              alt="Science Club Members"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />

            {/* Bottom text inside image */}
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <span className="inline-block bg-red text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Since 2012
              </span>
              <p className="font-oswald text-3xl font-bold uppercase leading-tight max-w-xs">
                Curiosity is our competitive advantage.
              </p>
            </div>
          </motion.div>

          {/* Right — text content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="flex flex-col justify-between gap-8"
          >
            <div>
              <h2 className="font-oswald text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-navy leading-[0.9] tracking-tight mb-6">
                Built by<br />
                <span className="text-red">Curious</span><br />
                Minds.
              </h2>
              <p className="text-gray-500 font-inter text-base leading-relaxed max-w-md">
                Science Club ASIET is a student-run community at the intersection of curiosity and creation. We don&apos;t just study science — we practise it through hands-on projects, industry mentorships, and inter-college competitions.
              </p>
            </div>

            {/* Stats — inline, no boxes */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-6 border-t border-b border-gray-100">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                  className="flex flex-col gap-0.5"
                >
                  <span className="font-oswald text-4xl font-bold text-navy leading-none">
                    {stat.value}
                  </span>
                  <span className="font-inter text-xs uppercase tracking-widest text-gray-400 font-semibold">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-fit"
            >
              <Link
                href="#join"
                className="group inline-flex items-center gap-3 font-oswald uppercase font-bold text-lg text-navy hover:text-red transition-colors duration-250"
              >
                Learn More
                <span className="w-9 h-9 rounded-full border-2 border-navy group-hover:border-red group-hover:bg-red group-hover:text-white text-navy flex items-center justify-center transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
