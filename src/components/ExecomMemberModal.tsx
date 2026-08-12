"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Mail, ShieldCheck, ArrowUpRight } from "lucide-react";

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export type ExecomModalMember = {
  name: string;
  role: string;
  bio?: string;
  img?: string;
  year?: string;
  team_slug?: string;
  category?: string;
  email?: string;
  linkedin?: string;
};

interface ExecomMemberModalProps {
  member: ExecomModalMember | null;
  onClose: () => void;
}

export function ExecomMemberModal({ member, onClose }: ExecomMemberModalProps) {
  useEffect(() => {
    if (member) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [member]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!member) return null;

  const linkedinUrl = member.linkedin || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(member.name + " Science Club ASIET")}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-gray-100 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-navy/10 hover:bg-red text-navy hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image & Badges */}
          <div className="w-full md:w-5/12 bg-navy relative min-h-[260px] md:min-h-[380px] flex items-center justify-center overflow-hidden shrink-0">
            <Image
              src={member.img || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%231e293b'/><circle cx='50' cy='38' r='20' fill='%2394a3b8'/><path d='M20 85 a30 30 0 1 60 0' fill='%2394a3b8'/></svg>"}
              alt={member.name}
              fill
              unoptimized={!member.img || member.img.startsWith("data:") || member.img.endsWith(".svg")}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-80" />
            
            {member.year && (
              <span className="absolute bottom-4 left-4 bg-red text-white text-[10px] font-oswald uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                TERM • {member.year}
              </span>
            )}
          </div>

          {/* Right Column: Profile Specs & Bio */}
          <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-red" />
                <span className="font-oswald text-xs uppercase font-bold text-red tracking-widest">
                  {member.role}
                </span>
              </div>

              <h3 className="font-oswald text-2xl md:text-3xl font-bold uppercase text-navy leading-tight mb-4">
                {member.name}
              </h3>

              <div className="h-[2px] w-12 bg-red mb-4" />

              <p className="font-inter text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line mb-6">
                {member.bio || `${member.name} serves as ${member.role} for the Science Club Executive Committee.`}
              </p>
            </div>

            {/* Social Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-navy text-white hover:bg-red transition-colors font-oswald text-xs font-bold uppercase tracking-wider shadow-md"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-red transition-colors font-oswald uppercase tracking-wider"
                >
                  <Mail className="w-4 h-4 text-red" />
                  <span>Email Member</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
