"use client";

import { motion } from "framer-motion";

export function Marquee({ text = "SCIENCE CLUB • INNOVATION • DISCOVERY • COMPUTATION • " }: { text?: string }) {
  
  return (
    <div className="w-[95%] mx-auto rounded-3xl bg-red text-white py-4 overflow-hidden flex whitespace-nowrap z-20 relative my-12 shadow-md">
      <motion.div
        className="flex font-oswald text-4xl lg:text-5xl uppercase font-black tracking-widest"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 15,
        }}
      >
        {/* Render text multiple times for infinite continuous loop */}
        <span className="pe-12">{text}</span>
        <span className="pe-12">{text}</span>
        <span className="pe-12">{text}</span>
        <span className="pe-12">{text}</span>
      </motion.div>
    </div>
  );
}
