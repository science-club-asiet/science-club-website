"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Trophy, Award, Zap } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

export function HistoricVaultGallery() {
  return (
    <div className="mt-24 pt-16 border-t-2 border-gray-100 font-inter">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-red font-oswald uppercase text-xs font-bold tracking-[0.25em] block mb-2">
            HISTORIC IMPACT
          </span>
          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-navy tracking-tight leading-none">
            OUR PAST EVENT HIGHLIGHTS
          </h2>
        </div>
        <p className="text-gray-500 font-inter text-sm max-w-md font-normal">
          A track record of rigorous learning, hands-on physical experimentation, and peer-to-peer science.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-oswald shrink-0 shadow-md">
            <Trophy className="w-6 h-6 text-red" />
          </div>
          <div>
            <span className="font-oswald text-3xl font-bold text-navy block leading-none mb-1">500+</span>
            <span className="font-oswald text-xs font-bold text-gray-400 uppercase tracking-widest">ATTENDEES ENGAGED</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-oswald shrink-0 shadow-md">
            <Zap className="w-6 h-6 text-red" />
          </div>
          <div>
            <span className="font-oswald text-3xl font-bold text-navy block leading-none mb-1">30+</span>
            <span className="font-oswald text-xs font-bold text-gray-400 uppercase tracking-widest">EXPERIMENTAL LABS</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-oswald shrink-0 shadow-md">
            <Award className="w-6 h-6 text-red" />
          </div>
          <div>
            <span className="font-oswald text-3xl font-bold text-navy block leading-none mb-1">15+</span>
            <span className="font-oswald text-xs font-bold text-gray-400 uppercase tracking-widest">RESEARCH DEMOS</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
