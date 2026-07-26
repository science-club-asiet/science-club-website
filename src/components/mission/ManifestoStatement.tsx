"use client";

import { motion } from "framer-motion";
import { BookOpen, Zap } from "lucide-react";
import Image from "next/image";

export function ManifestoStatement() {
  return (
    <section className="py-24 md:py-36 bg-white text-navy relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

        {/* Section Header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold mb-6"
          >
            <span className="w-6 h-[2px] bg-red" />
            Core Philosophy
          </motion.div>

          <div className="overflow-hidden">
            <motion.blockquote
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-oswald text-4xl md:text-6xl font-bold uppercase leading-[1.02] text-navy max-w-5xl"
            >
              &ldquo;Science is not a spectator sport. It demands participation, execution, and continuous inquiry.&rdquo;
            </motion.blockquote>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-4">

          {/* Traditional Way */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 md:p-12 rounded-3xl bg-[#FAF9F8] border border-gray-200/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-oswald text-xs font-bold uppercase tracking-widest text-gray-400">
                  01. Conventional Model
                </span>
                <div className="p-3 rounded-2xl bg-gray-200/60 text-gray-500">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-oswald text-3xl md:text-4xl font-bold uppercase text-navy mb-4">
                Passive Theory
              </h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-inter mb-8">
                Confining science to textbooks, static lectures, and exam grades. Students study discoveries made by others, rarely given the tools or freedom to make their own.
              </p>
            </div>

            <motion.div
              initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
              whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="relative h-48 w-full rounded-2xl overflow-hidden mt-6 border border-gray-200"
            >
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
                alt="Lecture hall"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-navy/30" />
            </motion.div>
          </motion.div>

          {/* Science Club Model */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-12 rounded-3xl bg-navy text-white flex flex-col justify-between shadow-2xl relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-oswald text-xs font-bold uppercase tracking-widest text-red">
                  02. Science Club Model
                </span>
                <div className="p-3 rounded-2xl bg-red text-white">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-oswald text-3xl md:text-4xl font-bold uppercase text-white mb-4">
                Active Creation
              </h3>
              <p className="text-white/80 text-base md:text-lg leading-relaxed font-inter mb-8">
                Treating every curiosity as a project. We build hardware prototypes, write open-source software, test hypotheses, and publish peer-reviewed papers together.
              </p>
            </div>

            <motion.div
              initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
              whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              className="relative h-48 w-full rounded-2xl overflow-hidden mt-6 border border-white/20"
            >
              <Image
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop"
                alt="Active Lab"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-navy/20" />
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
