"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Globe, MessageCircle, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LINK_MAP: Record<string, string> = {
  "News": "/news",
  "First Team": "/info/execom",
  "Club History": "/info/about",
  "Join The Board": "/login?mode=signup",
  "My Account": "/account",
  "Events & Experiences": "/events",
  "Resources": "/info/mission",
  "Contact Us": "/#contact",
};

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/account");

  const [firstTeamLink, setFirstTeamLink] = useState("/info/execom");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [bgColor, setBgColor] = useState<string>("transparent");

  const footerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (isDashboard) {
    return null;
  }

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("execom_members")
      .select("term")
      .order("term", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]?.term) {
          setFirstTeamLink(`/info/execom`);
        }
      });
  }, []);

  // Dynamically detect and match the background color of the preceding section/page
  useEffect(() => {
    const updateBg = () => {
      if (!footerRef.current) return;
      let prev = footerRef.current.previousElementSibling as HTMLElement | null;
      if (prev && prev.tagName.toLowerCase() === "main") {
        const lastChild = prev.lastElementChild as HTMLElement | null;
        if (lastChild) prev = lastChild;
      }
      if (prev) {
        let bg = window.getComputedStyle(prev).backgroundColor;
        let curr: HTMLElement | null = prev;
        while (curr && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) {
          curr = curr.parentElement;
          if (curr) bg = window.getComputedStyle(curr).backgroundColor;
        }
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          setBgColor(bg);
        }
      }
    };

    updateBg();
    const timer = setTimeout(updateBg, 250);
    window.addEventListener("resize", updateBg);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateBg);
    };
  }, [pathname]);

  // Smooth slide-in animation when scrolling into the footer spacer zone
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!cardRef.current || !footerRef.current) return;

    const card = cardRef.current;
    const footer = footerRef.current;

    gsap.set(card, { x: 0, xPercent: 100 });

    const st = ScrollTrigger.create({
      trigger: footer,
      start: "top 92%",
      end: "bottom bottom",
      toggleActions: "play reverse play reverse",
      onEnter: () => {
        gsap.to(card, { xPercent: 0, duration: 0.9, ease: "power3.out", overwrite: true });
      },
      onLeaveBack: () => {
        gsap.to(card, { xPercent: 100, duration: 0.7, ease: "power3.inOut", overwrite: true });
      },
    });

    return () => {
      st.kill();
      gsap.killTweensOf(card);
    };
  }, [pathname]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer 
      ref={footerRef} 
      style={{ backgroundColor: bgColor }}
      className="relative z-40 w-full overflow-hidden pt-16 sm:pt-24 pb-0 flex flex-col justify-end transition-colors duration-500"
    >
      {/* 100% Opaque Watts Arched / Pill Card Container - Spans w-screen with 0px left margin */}
      <div
        ref={cardRef}
        className="w-full bg-[#DA291C] text-white opacity-100 rounded-t-[42px] sm:rounded-t-[56px] lg:rounded-l-[180px] lg:rounded-r-none p-5 sm:p-7 lg:pl-16 lg:pr-10 lg:py-8 overflow-hidden shadow-[0_-20px_48px_rgba(0,0,0,0.35)] flex flex-col justify-between gap-6 pointer-events-auto will-change-transform"
      >
        {/* Top & Middle Section: 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-6 items-start relative z-10">
          
          {/* Tagline & Copyright (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-sans font-extrabold text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight text-white max-w-sm">
              Fueling curious minds, scientific pioneers. One lab at a time!
            </h3>
            <p className="text-white/90 text-xs sm:text-sm font-medium pt-1">
              © {new Date().getFullYear()} Science Club ASIET / Site & Brand by Science Club
            </p>
          </div>

          {/* Navigation Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white/90 mb-3">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-white/90">
              {["News", "First Team", "Club History", "Join The Board"].map((label) => {
                const href = label === "First Team" ? firstTeamLink : LINK_MAP[label] || "/";
                return (
                  <li key={label}>
                    <Link href={href} className="hover:text-white hover:underline transition-all block">
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support / Explore Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white/90 mb-3">
              SUPPORT
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-white/90">
              {["My Account", "Events & Experiences", "Resources", "Contact Us"].map((label) => {
                const href = LINK_MAP[label] || "/";
                return (
                  <li key={label}>
                    <Link href={href} className="hover:text-white hover:underline transition-all block">
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter Subscribe & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white/90 mb-2">
                GET THE LATEST FROM SCIENCE CLUB.
              </h4>
              
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full bg-transparent border border-white/50 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors pr-28"
                />
                <button
                  type="submit"
                  className="absolute right-1 bg-white text-[#DA291C] font-bold text-xs px-4 py-2 rounded-full hover:bg-white/90 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-white/90 mb-1.5">
                  FOLLOW US
                </h4>
                <div className="flex items-center gap-2">
                  {[
                    { Icon: Globe, href: "#", label: "Website" },
                    { Icon: MessageCircle, href: "#", label: "Chat" },
                    { Icon: Share2, href: "#", label: "Share" },
                  ].map(({ Icon, href, label }, i) => (
                    <a
                      key={i}
                      href={href}
                      aria-label={label}
                      className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#DA291C] transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Headquarters summary inline */}
              <div className="text-xs text-white/90 text-right">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider">HEADQUARTERS</p>
                <p className="text-white/80">ASIET, Kalady, Kerala</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Sleek "science club" Banner Typography */}
        <div className="pt-2 flex justify-end items-end w-full overflow-hidden border-t border-white/20">
          <h1 className="font-sans font-black text-[9vw] sm:text-[7.5vw] lg:text-[6.5vw] leading-[0.8] tracking-tighter text-white select-none whitespace-nowrap opacity-95 hover:opacity-100 transition-opacity">
            science club
          </h1>
        </div>
      </div>
    </footer>
  );
}
