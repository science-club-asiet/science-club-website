"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Expose lenis instance globally so GSAP ScrollTrigger can hook into it
declare global {
  interface Window { __lenis?: Lenis; }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable native browser scroll restoration to prevent jumpy page loads
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Sync Lenis with GSAP ScrollTrigger - CRITICAL for pinned elements!
    lenis.on("scroll", ScrollTrigger.update);
    
    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    };
  }, []);

  // Reset scroll to top and re-sync measurements upon route change
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    // Reset through Lenis ONLY. A native window.scrollTo(0,0) here fights Lenis'
    // own RAF loop and causes the "jumps back/forward" glitch during navigation.
    lenis.scrollTo(0, { immediate: true, force: true });

    // The incoming page registers its pinned ScrollTriggers inside its own
    // effects (some behind a ~100ms setTimeout). We must re-measure AFTER those
    // exist, otherwise pin-spacer heights and Lenis' scroll `limit` go stale and
    // the page "stops scrolling" partway down. Refresh twice: once after paint,
    // once after the deferred triggers have been created.
    const rafId = requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    const lateId = setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 350);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(lateId);
    };
  }, [pathname]);

  return <>{children}</>;
}
