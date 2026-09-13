"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

function SearchWatcher({ onChange }: { onChange: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange();
  }, [searchParams, onChange]);
  return null;
}

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/account");

  const [firstTeamLink, setFirstTeamLink] = useState("/info/execom");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const defaultBg = pathname === "/" ? "#001C58" : "transparent";
  const [bgColor, setBgColor] = useState<string>(defaultBg);

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

  // Dynamically detect and extend the background color of the section just above the footer
  useEffect(() => {
    const updateBg = () => {
      const footer = footerRef.current;
      if (!footer) return;

      const isValidBg = (color?: string | null) => {
        if (!color) return false;
        if (
          color === "transparent" ||
          color === "rgba(0, 0, 0, 0)" ||
          color.startsWith("rgba(0, 0, 0, 0")
        ) {
          return false;
        }
        return true;
      };

      // 1. Find all section elements in document
      const sections = Array.from(document.querySelectorAll("section"));
      // Filter for sections that appear physically before the footer
      const preceding = sections.filter((sec) => {
        if (sec === footer || footer.contains(sec)) return false;
        return (sec.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      });

      const lastSection = preceding[preceding.length - 1];
      if (lastSection) {
        // A. Direct class detection (fast & resilient)
        const classNames = typeof lastSection.className === "string" ? lastSection.className : "";
        if (classNames.includes("bg-navy")) {
          setBgColor("#001C58");
          return;
        }
        if (classNames.includes("bg-white")) {
          setBgColor("#FFFFFF");
          return;
        }
        const hexMatch = classNames.match(/bg-\[#([0-9a-fA-F]+)\]/);
        if (hexMatch) {
          setBgColor(`#${hexMatch[1]}`);
          return;
        }

        // B. Computed background color on the section
        const bg = window.getComputedStyle(lastSection).backgroundColor;
        if (isValidBg(bg)) {
          setBgColor(bg);
          return;
        }
      }

      // 2. Check the previous container element (e.g. <main>)
      const prev = footer.previousElementSibling as HTMLElement | null;
      if (prev) {
        const prevClasses = typeof prev.className === "string" ? prev.className : "";
        if (prevClasses.includes("bg-navy")) {
          setBgColor("#001C58");
          return;
        }
        const prevBg = window.getComputedStyle(prev).backgroundColor;
        if (isValidBg(prevBg)) {
          setBgColor(prevBg);
          return;
        }
      }

      // 3. Fallback: on homepage, default to navy; otherwise check body
      if (pathname === "/") {
        setBgColor("#001C58");
        return;
      }

      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      if (isValidBg(bodyBg)) {
        setBgColor(bodyBg);
      } else {
        setBgColor("#FFFFFF");
      }
    };

    updateBg();
    const t1 = setTimeout(updateBg, 50);
    const t2 = setTimeout(updateBg, 250);
    const t3 = setTimeout(updateBg, 700);
    window.addEventListener("resize", updateBg);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", updateBg);
    };
  }, [pathname]);

  // Smooth slide-in animation when scrolling into the footer spacer zone
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!cardRef.current || !footerRef.current) return;

    const card = cardRef.current;
    const footer = footerRef.current;

    const checkInView = () => {
      const rect = footer.getBoundingClientRect();
      return rect.top <= window.innerHeight * 1.05;
    };

    // If footer is already visible on the screen (e.g. short/filtered pages), show immediately
    if (checkInView()) {
      gsap.set(card, { x: 0, xPercent: 0 });
    } else {
      gsap.set(card, { x: 0, xPercent: 100 });
    }

    const st = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      toggleActions: "play reverse play reverse",
      onEnter: () => {
        gsap.to(card, { xPercent: 0, duration: 0.8, ease: "power3.out", overwrite: true });
      },
      onLeaveBack: () => {
        const rect = footer.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          gsap.to(card, { xPercent: 100, duration: 0.6, ease: "power3.inOut", overwrite: true });
        }
      },
      onRefresh: (self) => {
        const rect = footer.getBoundingClientRect();
        if (self.progress > 0 || rect.top <= window.innerHeight) {
          gsap.set(card, { xPercent: 0 });
        }
      },
    });

    const handleLayoutChange = () => {
      st.refresh();
      if (checkInView()) {
        gsap.to(card, { xPercent: 0, duration: 0.4, ease: "power3.out", overwrite: true });
      }
    };

    // Listen to document body resizing (triggered when category filter shrinks/grows event list)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      ro = new ResizeObserver(() => {
        handleLayoutChange();
      });
      ro.observe(document.body);
    }

    window.addEventListener("resize", handleLayoutChange);
    window.addEventListener("popstate", handleLayoutChange);

    return () => {
      st.kill();
      gsap.killTweensOf(card);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", handleLayoutChange);
      window.removeEventListener("popstate", handleLayoutChange);
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

  const onSearchParamChange = React.useCallback(() => {
    if (!footerRef.current || !cardRef.current) return;
    ScrollTrigger.refresh();
    const rect = footerRef.current.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 1.05) {
      gsap.to(cardRef.current, { xPercent: 0, duration: 0.4, ease: "power3.out", overwrite: true });
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <SearchWatcher onChange={onSearchParamChange} />
      </Suspense>
      <footer 
        ref={footerRef} 
        style={{ backgroundColor: bgColor }}
        className="relative z-40 w-full overflow-hidden pt-0 pb-0 flex flex-col justify-end"
      >
      {/* Watts Arched / Pill Card Container - Spans ~95% width with seamless background */}
      <div
        ref={cardRef}
        className="w-full md:w-[96%] lg:w-[95%] xl:w-[95%] ml-auto bg-[#DA291C] text-white opacity-100 rounded-t-[42px] sm:rounded-t-[56px] md:rounded-l-[140px] md:rounded-r-none lg:rounded-l-[180px] lg:rounded-r-none p-5 sm:p-7 lg:pl-16 lg:pr-10 lg:py-8 overflow-hidden flex flex-col justify-between gap-6 pointer-events-auto will-change-transform"
      >
        {/* Top & Middle Section: 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-6 items-start relative z-10">
          
          {/* Tagline & Copyright (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-sans font-extrabold text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight text-white max-w-sm">
              Fueling curious minds, scientific pioneers. One lab at a time!
            </h3>
            <p className="text-white/90 text-xs sm:text-sm font-medium pt-1">
              © {new Date().getFullYear()} Science Club ASIET • Site & Brand by Science Club
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
    </>
  );
}
