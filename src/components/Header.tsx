"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
import { Atom, Search, User, ChevronDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { 
    name: "NEWS", 
    href: "/news",
    subLinks: [
      { name: "Latest Announcements", href: "/news" },
      { name: "Research Papers", href: "/news" },
      { name: "Alumni Stories", href: "/news" }
    ]
  },
  { 
    name: "INFO", 
    href: "/info/about",
    subLinks: [
      { name: "About Science Club", href: "/info/about" },
      { name: "Execom", href: "/info/execom" },
      { name: "Our Mission", href: "/info/mission" },
      { name: "Join Us", href: "/info/join" }
    ]
  },
  { 
    name: "EVENTS", 
    href: "/events",
    subLinks: [
      { name: "All Events", href: "/events" },
      { name: "Guest Seminars", href: "/events" },
      { name: "Workshops", href: "/events" }
    ]
  },
];

interface NavigationCategory {
  id: string;
  num: string;
  name: string;
  href: string;
  badge: string;
  description: string;
  img: string;
  stats: string;
  subLinks: { name: string; href: string }[];
}

const FULL_STAGE_ITEMS: NavigationCategory[] = [
  {
    id: "home",
    num: "01",
    name: "HOME",
    href: "/",
    badge: "MAIN HUB",
    description: "The primary entry point to Science Club ASIET — featuring live announcements, upcoming fixtures, and campus lab highlights.",
    img: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1200&auto=format&fit=crop",
    stats: "250+ ACTIVE MEMBERS",
    subLinks: []
  },
  {
    id: "news",
    num: "02",
    name: "NEWS",
    href: "/news",
    badge: "ANNOUNCEMENTS",
    description: "Stay informed with campus research publications, competition victories, student breakthroughs, and alumni success stories.",
    img: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200&auto=format&fit=crop",
    stats: "WEEKLY UPDATES",
    subLinks: [
      { name: "Latest Announcements", href: "/news" },
      { name: "Research Papers", href: "/news" },
      { name: "Alumni Stories", href: "/news" }
    ]
  },
  {
    id: "info",
    num: "03",
    name: "INFO",
    href: "/info/about",
    badge: "FOUNDATION",
    description: "Explore our founding story, executive committee leadership rosters, core strategic mission, and recruitment portals.",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    stats: "EST. 2018 • ASIET",
    subLinks: [
      { name: "About Science Club", href: "/info/about" },
      { name: "Execom Leaderboard", href: "/info/execom" },
      { name: "Our Mission", href: "/info/mission" },
      { name: "Join Us", href: "/info/join" }
    ]
  },
  {
    id: "events",
    num: "04",
    name: "EVENTS",
    href: "/events",
    badge: "FIXTURES",
    description: "Browse upcoming guest research seminars, robotics hackathons, hands-on lab workshops, and past event archives.",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    stats: "12 ANNUAL FIXTURES",
    subLinks: [
      { name: "All Events", href: "/events" },
      { name: "Guest Seminars", href: "/events" },
      { name: "Workshops", href: "/events" }
    ]
  }
];

function AwwwardsHamburgerButton({
  isOpen,
  onClick,
  iconColor,
}: {
  isOpen: boolean;
  onClick: () => void;
  iconColor: MotionValue<string> | string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      style={{ color: iconColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      aria-label="Toggle Navigation Menu"
      className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors group focus:outline-none"
      whileTap={{ scale: 0.92 }}
    >
      {/* Magnetic Outer Ambient Ring on Hover */}
      <motion.span
        initial={false}
        animate={{
          scale: isHovered ? 1 : 0.65,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 rounded-full bg-red/15 border border-red/30 pointer-events-none"
      />

      {/* Custom 2-Line Asymmetric Magnetic SVG Icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Top Line */}
        <motion.line
          x1="3"
          y1="8"
          x2="21"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            isOpen
              ? { x1: 5, y1: 5, x2: 19, y2: 19, stroke: "#DA291C" }
              : isHovered
              ? { x1: 2, y1: 8, x2: 22, y2: 8, stroke: "#DA291C" }
              : { x1: 3, y1: 8, x2: 21, y2: 8 }
          }
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        />

        {/* Bottom Line (Shorter by default for bespoke asymmetry, expands & aligns on hover) */}
        <motion.line
          x1="9"
          y1="16"
          x2="21"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            isOpen
              ? { x1: 5, y1: 19, x2: 19, y2: 5, stroke: "#DA291C" }
              : isHovered
              ? { x1: 2, y1: 16, x2: 22, y2: 16, stroke: "#DA291C" }
              : { x1: 9, y1: 16, x2: 21, y2: 16 }
          }
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        />
      </svg>
    </motion.button>
  );
}

const MotionLink = motion.create(Link);

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<string>("home");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("info");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Lock background Lenis scroll when mobile menu is open
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isMobileMenuOpen) {
        window.__lenis?.stop();
      } else {
        window.__lenis?.start();
      }
    }
  }, [isMobileMenuOpen]);
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Background color & blur transitions
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    isHomePage
      ? ["rgba(0, 0, 0, 0)", "rgba(0, 28, 88, 1)"]
      : ["rgba(255, 255, 255, 1)", "rgba(0, 28, 88, 1)"]
  );

  const textColor = useTransform(
    scrollY,
    [0, 100],
    isHomePage
      ? ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)"]
      : ["rgba(0, 28, 88, 1)", "rgba(255, 255, 255, 1)"]
  );

  const iconColor = useTransform(
    scrollY,
    [0, 100],
    isHomePage
      ? ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)"]
      : ["rgba(0, 28, 88, 1)", "rgba(255, 255, 255, 1)"]
  );

  const logoScale = useTransform(scrollY, [0, 100], [1, 0.85]);

  const handleMouseEnter = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  return (
    <>
      <motion.header
        id="main-nav-header"
        style={{ backgroundColor, color: textColor }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 font-oswald shadow-sm flex items-center transition-[height,opacity] duration-300",
          isScrolled ? "h-[4.5rem]" : "h-24"
        )}
      >
        {/* Animated backdrop dimmer for desktop mega-menu */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-0 w-full h-[100vh] bg-black/40 backdrop-blur-[2px] -z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="container mx-auto w-full h-full relative z-20 px-4 md:px-8">
          <div className="flex items-center justify-between h-full relative">
            
            {/* Left side: Awwwards Bespoke Magnetic Hamburger & Desktop Nav */}
            <div className="flex items-center gap-8 flex-[1.5] h-full relative" onMouseLeave={handleMouseLeave}>
              <AwwwardsHamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                iconColor={iconColor}
              />
              
              <nav className="hidden lg:flex items-center gap-8 h-full">
                {NAV_LINKS.map((link) => (
                  <div 
                    key={link.name} 
                    className="h-full flex flex-col justify-center relative"
                    onMouseEnter={() => handleMouseEnter(link.name)}
                  >
                    <motion.div style={{ color: textColor }}>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-lg tracking-wide font-normal transition-colors flex items-center gap-1 relative py-2 group",
                          activeDropdown === link.name ? "text-red font-medium" : "hover:text-red"
                        )}
                      >
                        {link.name}
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", activeDropdown === link.name ? "rotate-180 text-red" : "rotate-0 opacity-80")} />
                      </Link>
                    </motion.div>

                    {/* Shared Mega Menu Dropdown */}
                    <AnimatePresence>
                      {activeDropdown === link.name && link.subLinks && link.subLinks.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.98 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          onMouseEnter={() => handleMouseEnter(link.name)}
                          onMouseLeave={handleMouseLeave}
                          className="absolute top-full left-0 mt-2 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden min-w-[300px] border border-gray-100 font-inter z-50"
                        >
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-8 flex flex-col gap-5 text-navy"
                          >
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">
                              {link.name} OVERVIEW
                            </span>
                            {link.subLinks.map((sub) => (
                              <Link 
                                key={sub.name} 
                                href={sub.href}
                                onClick={() => setActiveDropdown(null)}
                                className="font-inter font-semibold text-lg hover:text-red transition-colors flex items-center group"
                              >
                                <span className="w-2 h-2 rounded-full bg-red mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </div>

            {/* Center: Logo */}
            <div className="flex-shrink-0 absolute left-1/2 -translate-x-1/2 h-full flex items-center justify-center">
              <Link href="/" aria-label="Home" className="flex items-center justify-center h-full cursor-pointer">
                <motion.div 
                  style={{ scale: logoScale }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: isScrolled ? 180 : 0 }}
                  whileHover={{ rotate: isScrolled ? 360 : 180 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Atom className="text-red w-12 h-12" />
                </motion.div>
              </Link>
            </div>

            {/* Right side: Search, User Profile & CTA */}
            <div className="flex items-center justify-end gap-4 md:gap-6 flex-[1.5] h-full">
              
              {/* Expanding Search Pill */}
              <motion.button 
                aria-label="Search"
                style={{ backgroundColor: isHomePage || isScrolled ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
                className="hidden sm:flex items-center justify-start overflow-hidden rounded-full transition-all duration-500 ease-[0.22,1,0.36,1] w-10 h-10 hover:w-[130px] group px-[9px] cursor-pointer"
              >
                <motion.div style={{ color: iconColor }}>
                  <Search className="w-5 h-5 flex-shrink-0 group-hover:text-red transition-colors" />
                </motion.div>
                <motion.span 
                  style={{ color: textColor }}
                  className="ml-3 text-[13px] font-oswald tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap mt-0.5 flex-shrink-0"
                >
                  SEARCH...
                </motion.span>
              </motion.button>

              {/* Account — redirects to /admin or /login */}
              <MotionLink
                href="/admin"
                aria-label="My account / Admin panel"
                style={{ color: iconColor, backgroundColor: isHomePage || isScrolled ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                className="transition-colors hidden sm:flex items-center justify-center p-2 w-10 h-10 rounded-full cursor-pointer"
              >
                <User className="w-5 h-5 hover:text-red transition-colors" />
              </MotionLink>

              {/* Join Us Red Pill CTA */}
              <Link
                href="/info/join"
                className="hidden md:flex items-center gap-2 bg-red text-white px-8 py-2.5 uppercase text-[17px] font-bold tracking-wide rounded-full overflow-hidden relative group"
              >
                {/* Shimmer sweep on hover */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <span className="relative z-10">JOIN US</span>
              </Link>
            </div>
            
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Stage Overlay Takeover */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
            className="fixed inset-0 z-[100] bg-navy text-white font-oswald overflow-y-auto w-screen h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 pointer-events-auto"
          >
            {/* Ambient Red Radial Glow Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(218,41,28,0.25),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(0,28,88,0.9),transparent_75%)] pointer-events-none z-0" />
            
            {/* Subtle Tech Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none z-0" />

            {/* Pulse Orbit Graphic */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-red/10 rounded-full pointer-events-none z-0 animate-spin-slow" />

            {/* Top Bar Navigation Stage */}
            <motion.div 
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between border-b border-white/15 pb-6 shrink-0 relative z-20"
            >
              {/* Brand Header */}
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3.5 group">
                <div className="w-11 h-11 rounded-full bg-red/10 border border-red/30 flex items-center justify-center group-hover:border-red transition-colors shadow-md">
                  <Atom className="w-6 h-6 text-red animate-spin-slow" />
                </div>
                <div>
                  <span className="font-oswald text-xl font-bold uppercase tracking-widest text-white block leading-none">
                    SCIENCE CLUB
                  </span>
                  <span className="font-inter text-[9px] uppercase tracking-[0.25em] text-white/50 block mt-1">
                    ASIET KALADY
                  </span>
                </div>
              </Link>

              {/* Action Pill & Close Button */}
              <div className="flex items-center gap-4">
                <Link
                  href="/info/join"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hidden sm:flex items-center gap-2 bg-red hover:bg-white hover:text-navy text-white text-xs font-oswald font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-all shadow-lg hover:scale-105"
                >
                  <span>JOIN US</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <AwwwardsHamburgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(false)}
                  iconColor="#FFFFFF"
                />
              </div>
            </motion.div>

            {/* Main Stage Grid: Left Fast Spotlight Canvas + Right Auto-expanding Row Column */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto py-8 relative z-20">
              
              {/* Left Stage: Snappy Ultra-Fast Image Canvas */}
              <div className="hidden lg:block col-span-6">
                {(() => {
                  const activeSpotlight = FULL_STAGE_ITEMS.find(c => c.id === activeHoverId) || FULL_STAGE_ITEMS[0];
                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSpotlight.id}
                        initial={{ 
                          opacity: 0,
                          scale: 1.04,
                        }}
                        animate={{ 
                          opacity: 1,
                          scale: 1.0,
                        }}
                        exit={{ 
                          opacity: 0,
                          scale: 0.98,
                        }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-3xl overflow-hidden border border-white/25 bg-navy/60 backdrop-blur-2xl shadow-2xl p-8 flex flex-col justify-between h-[460px] group"
                      >
                        {/* Image & Gradient Stack */}
                        <Image
                          src={activeSpotlight.img}
                          alt={activeSpotlight.name}
                          fill
                          priority
                          sizes="600px"
                          className="object-cover opacity-45 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/65 to-transparent pointer-events-none" />

                        {/* Top HUD Card Header */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="bg-red text-white text-[10px] font-oswald uppercase font-bold tracking-[0.2em] px-3.5 py-1 rounded-full shadow-md border border-white/20">
                            {activeSpotlight.badge}
                          </span>

                          <span className="bg-white/10 backdrop-blur-md text-white/90 font-mono text-xs font-bold px-3.5 py-1 rounded-full border border-white/20">
                            {activeSpotlight.stats}
                          </span>
                        </div>

                        {/* Center Copy Spotlight */}
                        <div className="relative z-10 space-y-3">
                          <span className="font-mono text-5xl font-bold text-red block drop-shadow-md">
                            {activeSpotlight.num}
                          </span>
                          <h3 className="font-oswald text-4xl sm:text-5xl font-bold uppercase text-white tracking-tight leading-none">
                            {activeSpotlight.name}
                          </h3>
                          <p className="font-inter text-sm text-white/80 leading-relaxed max-w-md">
                            {activeSpotlight.description}
                          </p>
                        </div>

                        {/* Sublinks Quick Routes */}
                        {activeSpotlight.subLinks.length > 0 && (
                          <div className="relative z-10 pt-4 border-t border-white/20">
                            <span className="text-[10px] font-oswald uppercase tracking-widest text-white/50 block mb-2">
                              DIRECT SUB-ROUTES ({activeSpotlight.subLinks.length}):
                            </span>
                            <div className="flex flex-wrap items-center gap-2 max-h-[120px] overflow-y-auto pr-1">
                              {activeSpotlight.subLinks.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="bg-white/10 hover:bg-red text-white text-xs font-oswald uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105 flex items-center gap-1.5 shadow-sm"
                                >
                                  <span>{sub.name}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-red hover:text-white" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  );
                })()}
              </div>

              {/* Right Stage: Entire Row Interactive with Directional Sweep Line & Unclipped Typography */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {FULL_STAGE_ITEMS.map((cat, idx) => {
                  const isHovered = activeHoverId === cat.id;
                  const isExpanded = expandedCategory === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => {
                        setActiveHoverId(cat.id);
                        setExpandedCategory(cat.id);
                      }}
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      className="border-b border-white/15 pb-4 cursor-pointer group"
                    >
                      <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.05 * idx + 0.1 }}
                        className="flex flex-col"
                      >
                        <div className="flex items-center justify-between py-1">
                          {/* Title Link */}
                          <Link
                            href={cat.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 flex-1"
                          >
                            <span className={cn(
                              "font-mono text-xs sm:text-sm font-bold tracking-widest transition-colors duration-300",
                              isHovered ? "text-red" : "text-white/40"
                            )}>
                              {cat.num}
                            </span>
                            
                            <div className="relative py-1">
                              <span className={cn(
                                "text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight transition-colors duration-200 block",
                                isHovered ? "text-white" : "text-white/80 group-hover:text-white"
                              )}>
                                {cat.name}
                              </span>

                              {/* Clean Solid Red Directional Line Sweep */}
                              <motion.span
                                initial={false}
                                animate={{ 
                                  scaleX: isHovered ? 1 : 0,
                                }}
                                transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                                style={{ transformOrigin: isHovered ? "left" : "right" }}
                                className="absolute left-0 bottom-0 w-full h-[3px] bg-red rounded-full block"
                              />
                            </div>
                          </Link>

                          {/* Accordion Indicator Chevron */}
                          {cat.subLinks.length > 0 && (
                            <div className="p-2.5 text-white/60 group-hover:text-red transition-colors rounded-full">
                              <ChevronDown className={cn("w-7 h-7 text-red transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0")} />
                            </div>
                          )}
                        </div>

                        {/* In-Line Accordion Sublink Expansion */}
                        {cat.subLinks.length > 0 && (
                          <div
                            className={cn(
                              "grid transition-[grid-template-rows,opacity] duration-300 ease-out pl-8 sm:pl-10",
                              isExpanded ? "grid-rows-[1fr] opacity-100 pt-4 pb-2" : "grid-rows-[0fr] opacity-0 pt-0 pb-0"
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="flex flex-wrap items-center gap-2.5 font-inter text-xs font-semibold">
                                {cat.subLinks.map((sub) => (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsMobileMenuOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-red text-white transition-all border border-white/20 hover:scale-105 flex items-center gap-1.5 shadow-sm"
                                  >
                                    <span>{sub.name}</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-red hover:text-white" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Footer Section */}
            <motion.div
              initial={{ y: 35, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 25, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
              className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 relative z-20"
            >
              <div className="flex items-center gap-3">
                <span className="font-oswald text-xs font-bold text-red tracking-widest uppercase">
                  BUSINESS ENQUIRIES:
                </span>
                <a href="mailto:events@scienceclub-asiet.org" className="font-inter text-xs text-white/80 hover:text-white transition-colors">
                  events@scienceclub-asiet.org
                </a>
              </div>

              <div className="flex items-center gap-6 font-oswald text-xs uppercase tracking-widest text-white/60">
                <span className="hover:text-red transition-colors cursor-pointer">INSTAGRAM</span>
                <span className="hover:text-red transition-colors cursor-pointer">LINKEDIN</span>
                <span className="hover:text-red transition-colors cursor-pointer">GITHUB</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
