"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Atom, Globe, MessageCircle, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LINK_MAP: Record<string, string> = {
  "News": "/news",
  "First Team": "/info/execom",
  "Club History": "/info/about",
  "Join The Board": "/login?mode=signup",
  "My Account": "/admin",
  "Events & Experiences": "/events",
  "Resources": "/info/mission",
  "Campus Tour": "/info/about",
  "Legal Notice": "/info/about",
  "Privacy Policy": "/info/about",
  "Help Center": "/login?mode=signup",
  "Cookie Preferences": "/info/about",
};

const footerLinks = [
  {
    heading: "Science Club",
    links: ["News", "First Team", "Club History", "Join The Board"],
  },
  {
    heading: "Explore",
    links: ["My Account", "Events & Experiences", "Resources", "Campus Tour"],
  },
  {
    heading: "Help",
    links: ["Legal Notice", "Privacy Policy", "Help Center", "Cookie Preferences"],
  },
];

export function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [subState, setSubState] = useState<"idle" | "done" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if ((formEl.querySelector<HTMLInputElement>("#nl_hp")?.value ?? "").trim()) return; // honeypot
    const email = (formEl.querySelector<HTMLInputElement>("#nl_email")?.value ?? "").trim();
    if (!email) return;
    const { error } = await createClient().from("newsletter_subscribers").insert({ email });
    // Duplicate email (already subscribed) counts as success.
    if (error && error.code !== "23505") {
      setSubState("error");
      return;
    }
    formEl.reset();
    setSubState("done");
  };

  return (
    <footer ref={ref} className="bg-navy pt-24 pb-12 font-inter text-white">
      <div className="container mx-auto px-4 lg:px-6">

        {/* Top: Logo + Social */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-12 mb-12"
        >
          <Link href="/" className="flex items-center gap-4 group mb-8 md:mb-0">
            <Atom className="w-12 h-12 text-red transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-oswald text-4xl uppercase font-bold tracking-wide group-hover:text-red transition-colors duration-300">
              Science Club
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="font-oswald uppercase text-lg hidden md:block opacity-60 mr-4 tracking-wider">
              Follow Us
            </span>
            {[Globe, MessageCircle, Share2].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-navy transition-colors duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {footerLinks.map((col, ci) => (
            <motion.div
              key={col.heading}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: ci * 0.08 }}
            >
              <h4 className="font-oswald text-xl uppercase font-bold mb-6 tracking-wider text-white/50">
                {col.heading}
              </h4>
              <ul className="space-y-4">
                {col.links.map((label) => (
                  <li key={label}>
                    <Link
                      href={LINK_MAP[label] || "/"}
                      className="group flex items-center gap-2 opacity-70 hover:opacity-100 font-medium transition-all duration-200 hover:text-red"
                    >
                      <span className="w-0 h-[1px] bg-red group-hover:w-4 transition-all duration-300 ease-out" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <h4 className="font-oswald text-xl uppercase font-bold mb-6 tracking-wider text-white/50">
              Newsletter
            </h4>
            <p className="opacity-60 mb-6 font-medium text-sm leading-relaxed">
              Subscribe for the latest campus science news and tech updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex w-full rounded-2xl overflow-hidden border border-white/10 focus-within:border-red transition-colors duration-300">
              <input id="nl_hp" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <input
                id="nl_email"
                type="email"
                required
                placeholder="Enter your email"
                className="bg-white/5 px-4 py-3 outline-none focus:bg-white/10 transition-colors flex-1 min-w-0 text-sm"
              />
              <motion.button
                type="submit"
                className="bg-red hover:bg-white hover:text-navy transition-colors px-6 font-oswald uppercase tracking-wider font-bold text-sm"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Go
              </motion.button>
            </form>
            {subState === "done" && <p className="text-xs mt-3 text-white/60">Thanks — you&apos;re subscribed.</p>}
            {subState === "error" && <p className="text-xs mt-3 text-red">Couldn&apos;t subscribe. Try again.</p>}
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-center pt-8 border-t border-white/10 gap-4 text-sm opacity-40">
          <p>&copy; {new Date().getFullYear()} Science Club ASIET. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
