"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Atom, MapPin, Mail, Clock, Globe, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

const footerLinks = [
  {
    heading: "Science Club",
    links: ["News", "First Team", "Club History", "Join The Board"],
  },
  {
    heading: "Explore",
    links: ["My Account", "Events & Experiences", "Resources", "Contact Us"],
  },
];

export function Footer() {
  const [firstTeamLink, setFirstTeamLink] = useState("/info/execom");

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

  return (
    <footer className="bg-navy pt-20 pb-12 font-inter text-white border-t border-white/10 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16 items-start">
          
          {/* Brand & Mission Column (4/12) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 flex flex-col justify-between"
          >
            <div>
              <Link href="/" className="flex items-center gap-4 group mb-6 w-fit">
                <Atom className="w-12 h-12 text-red transition-transform duration-700 group-hover:rotate-180" />
                <span className="font-oswald text-3xl sm:text-4xl uppercase font-bold tracking-wide group-hover:text-red transition-colors duration-300">
                  Science Club
                </span>
              </Link>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm font-medium mb-6">
                Empowering student innovators, scientific researchers, and technology pioneers through hands-on labs, guest lectures, and interdisciplinary engineering challenges at ASIET.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80 font-oswald uppercase tracking-widest w-fit">
                <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
                EST. 2018 • ASIET KALADY
              </div>

              <div className="flex items-center gap-2">
                {[Globe, MessageCircle, Share2].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    aria-label="Social Link"
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white hover:text-navy transition-colors duration-300"
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Science Club Links (2/12) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
            <h4 className="font-oswald text-xl uppercase font-bold mb-6 tracking-wider text-white/50">
              Science Club
            </h4>
            <ul className="space-y-4">
              {footerLinks[0].links.map((label) => {
                const href = label === "First Team" ? firstTeamLink : LINK_MAP[label] || "/";
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm transition-all duration-200 hover:text-red"
                    >
                      <span className="w-0 h-[1px] bg-red group-hover:w-4 transition-all duration-300 ease-out" />
                      <span className="transform group-hover:translate-x-1 transition-transform duration-200">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Explore Links (2/12) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
            <h4 className="font-oswald text-xl uppercase font-bold mb-6 tracking-wider text-white/50">
              Explore
            </h4>
            <ul className="space-y-4">
              {footerLinks[1].links.map((label) => {
                const href = LINK_MAP[label] || "/";
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm transition-all duration-200 hover:text-red"
                    >
                      <span className="w-0 h-[1px] bg-red group-hover:w-4 transition-all duration-300 ease-out" />
                      <span className="transform group-hover:translate-x-1 transition-transform duration-200">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Headquarters & Contact Summary Card (4/12) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 bg-white/5 border border-white/10 p-6 sm:p-7 rounded-2xl flex flex-col gap-4 shadow-xl hover:border-white/20 transition-colors"
          >
            <h4 className="font-oswald text-lg uppercase font-bold tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin className="w-4 h-4 text-red" />
              Headquarters
            </h4>
            
            <div className="space-y-3.5 text-xs text-white/70 font-medium">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                <span>Adi Shankara Institute of Engineering and Technology, Kalady, Kerala - 683574</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/40 shrink-0" />
                <a href="mailto:scienceclub@adishankara.ac.in" className="hover:text-red transition-colors">
                  scienceclub@adishankara.ac.in
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/40 shrink-0" />
                <span>Mon - Fri • 9:00 AM - 4:00 PM</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4 text-xs opacity-50"
        >
          <p>&copy; {new Date().getFullYear()} Science Club ASIET. All rights reserved.</p>
          <p className="font-oswald uppercase tracking-widest text-[11px]">Driven by Curiosity & Technical Excellence</p>
        </motion.div>

      </div>
    </footer>
  );
}
