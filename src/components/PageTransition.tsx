"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * OPTION 3 REFINED: Silky Seamless Diagonal Flow
 * - 4 seamless dark navy panels with subtle depth shadows and elegant skew (-skew-x-8).
 * - Zero harsh borders, zero text boxes, zero clutter.
 * - Ultra-smooth kinetic stagger tuned to match Lenis scroll architecture.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 750);

    return () => clearTimeout(timer);
  }, [pathname]);

  const panelCount = 4;

  return (
    <div className="relative w-full min-h-screen flex flex-col flex-1">
      {/* Silky Seamless Diagonal Panels */}
      <AnimatePresence mode="wait">
        {isNavigating && (
          <div
            key={`silky-shutter-${pathname}`}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden flex flex-col"
          >
            {Array.from({ length: panelCount }).map((_, i) => (
              <motion.div
                key={`panel-${i}`}
                initial={{ x: "-100%" }}
                animate={{ x: ["-100%", "0%", "100%"] }}
                transition={{
                  duration: 0.75,
                  times: [0, 0.48, 1],
                  delay: i * 0.045,
                  ease: [0.65, 0, 0.35, 1] as const,
                }}
                className="flex-1 w-[130%] -ml-[15%] bg-navy relative border-b border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.5)] -skew-x-8 origin-center"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Content Seamless Entrance */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.22,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
}
