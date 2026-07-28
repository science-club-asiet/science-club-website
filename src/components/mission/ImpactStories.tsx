"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";
import type { Story } from "@/lib/data/content";

export function ImpactStories({ stories }: { stories: Story[] }) {
  return (
    <section className="py-24 md:py-36 bg-[#FAF9F8] text-navy relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Section Header */}
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
              Proof of Mission
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-oswald text-4xl md:text-6xl font-bold uppercase text-navy tracking-tight"
              >
                Mission in Practice
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
            The ultimate test of our philosophy is the real work created by our members during their time at ASIET.
          </motion.p>
        </div>

        {/* Stories Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="p-8 md:p-12 rounded-3xl bg-white border border-gray-200/90 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="px-4 py-1.5 rounded-full bg-navy/5 text-navy font-oswald text-xs font-bold uppercase tracking-widest">
                    {story.tag}
                  </span>
                  <Quote className="w-8 h-8 text-red/40" />
                </div>

                <p className="text-navy text-lg md:text-xl font-inter leading-relaxed mb-8 font-medium">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-red">
                  <Image
                    src={story.image}
                    alt={story.author}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-oswald text-xl font-bold uppercase text-navy">
                    {story.author}
                  </h4>
                  <p className="text-gray-500 text-xs font-inter uppercase tracking-wider">
                    {story.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
