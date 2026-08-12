"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { 
  X, 
  MapPin, 
  Share2, 
  CheckCircle2, 
  Download,
  Sparkles,
  Calendar,
  User,
  Trophy,
  Globe,
  ExternalLink
} from "lucide-react";
import { ScienceEvent, formatCategoryDisplayName, getCategoryFieldLabels, formatEventPricingDisplay } from "@/lib/events";
import { cn } from "@/lib/utils";
import { RegisterButton } from "@/components/RegisterButton";

interface EventModalProps {
  event: ScienceEvent;
  onClose: () => void;
}

type ModalTab = "OVERVIEW" | "WINNERS" | "DETAILS" | "GALLERY";

// Framer Motion Staggered Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
};

export function EventModal({ event, onClose }: EventModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("OVERVIEW");
  const [copied, setCopied] = useState(false);

  // Lenis Scroll Lock on Mount & Unlock on Unmount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__lenis?.stop();
    }
    return () => {
      if (typeof window !== "undefined") {
        window.__lenis?.start();
      }
    };
  }, []);

  // One-Click .ICS iCalendar Export Handler
  const handleExportCalendar = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Science Club ASIET//Event Calendar//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, " ")}`,
      `LOCATION:${event.location || "ASIET Campus"}`,
      `DTSTART:20251012T090000Z`,
      `DTEND:20251012T170000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.toLowerCase().replace(/\s+/g, "-")}-pass.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only keep essential tabs (Overview, Winners, Details, Gallery)
  const availableTabs = [
    "OVERVIEW",
    ...(event.winners && event.winners.length > 0 && event.opStatus !== "open" ? ["WINNERS"] : []),
    ...(event.customMetadata && Object.keys(event.customMetadata).length > 0 ? ["DETAILS"] : []),
    ...(event.galleryImages && event.galleryImages.length > 0 ? ["GALLERY"] : []),
  ] as ModalTab[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-inter pt-20 sm:pt-24 pb-6"
    >
      {/* Backdrop Click Trigger */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Main Modal Card Container (max-w-4xl side-by-side layout) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl max-h-[82vh] sm:max-h-[85vh] bg-white text-navy rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto"
      >
        {/* Compact Header Banner */}
        <div className="relative w-full bg-navy text-white px-5 py-3.5 sm:px-6 sm:py-4 shrink-0 overflow-hidden border-b border-white/10">
          <Image
            src={event.img}
            alt={event.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover opacity-20 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-red text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Content */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red text-white text-[9px] font-oswald uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {event.status}
                </span>
                <span className="bg-white/15 backdrop-blur-md text-white text-[9px] font-oswald uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-white/15">
                  {formatCategoryDisplayName(event.type)}
                </span>
                {event.externalWebsiteUrl && (
                  <a
                    href={event.externalWebsiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-oswald uppercase font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/20"
                  >
                    <Globe className="w-3 h-3 text-red" />
                    <span>WEBSITE</span>
                    <ExternalLink className="w-2.5 h-2.5 text-white/70" />
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="text-white/70 hover:text-white text-[10px] font-oswald uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer ml-1"
                >
                  <Share2 className="w-3 h-3 text-red" />
                  <span>{copied ? "COPIED!" : "SHARE"}</span>
                </button>
              </div>

              <h2 className="font-oswald text-lg sm:text-2xl font-bold uppercase tracking-tight text-white leading-tight truncate">
                {event.title}
              </h2>
            </div>

            {/* Compact Date Chip */}
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
              <Calendar className="w-4 h-4 text-red" />
              <div className="text-left">
                <span className="font-oswald text-xs sm:text-sm font-bold leading-none block">{event.dateDay} {event.dateMonth}</span>
                <span className="font-oswald text-[8px] uppercase tracking-widest text-white/60 block">{event.dateYear || "2025"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
          
          {/* Segmented Tab Bar (Only displayed if multiple tabs exist) */}
          {availableTabs.length > 1 && (
            <div 
              data-lenis-prevent
              className="w-full overflow-x-auto touch-pan-x pb-2 mb-4 border-b border-gray-100 font-oswald uppercase text-xs font-bold tracking-wider shrink-0 no-scrollbar"
            >
              <div className="inline-flex bg-gray-100 p-1 rounded-full relative min-w-max">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative px-4 sm:px-5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 z-10 text-[11px]",
                      activeTab === tab ? "text-white" : "text-navy/60 hover:text-navy"
                    )}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="modal-active-tab-pill"
                        className="absolute inset-0 bg-red rounded-full -z-10 shadow-md"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flexible Internal Scroll Container */}
          <div 
            data-lenis-prevent
            className="flex-1 min-h-[260px] max-h-[480px] sm:max-h-[520px] overflow-y-auto pr-1 sm:pr-3 [scrollbar-width:thin] [scrollbar-color:#001C58_#f3f4f6] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-navy/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100/80 text-gray-600 text-sm font-normal leading-relaxed"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* OVERVIEW TAB: Full vertical uncropped poster on LEFT, details on RIGHT */}
                {activeTab === "OVERVIEW" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column (5/12): Full Uncropped Vertical Cover Image */}
                    <motion.div variants={itemVariants} className="md:col-span-5 flex flex-col gap-3">
                      {event.img ? (
                        <div className="w-full bg-navy/95 border border-navy/20 rounded-2xl overflow-hidden shadow-lg p-2 flex items-center justify-center group relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={event.img}
                            alt={event.title}
                            className="w-full h-auto max-h-[420px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-2xl bg-navy/5 border border-gray-200 flex flex-col items-center justify-center text-navy/40 gap-2 font-oswald uppercase text-xs">
                          <Sparkles className="w-6 h-6 text-red opacity-50" />
                          <span>ASIET Science Club</span>
                        </div>
                      )}
                    </motion.div>

                    {/* Right Column (7/12): Description & Spec Chips */}
                    <motion.div variants={itemVariants} className="md:col-span-7 space-y-4">
                      
                      {/* Description */}
                      <div>
                        <h4 className="font-oswald text-xs font-bold uppercase text-navy/50 tracking-wider mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-red" />
                          About This Event
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed font-normal whitespace-pre-line">
                          {event.description}
                        </p>
                      </div>

                      {/* Meta Spec Grid (2x2) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-gray-100">
                        
                        {/* Date & Time */}
                        <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/70 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-gray-400 block">Date & Time</span>
                            <span className="text-xs font-bold text-navy break-words block leading-snug">
                              {event.dateDay} {event.dateMonth} {event.dateYear || "2025"} {event.time ? `• ${event.time}` : ""}
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/70 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-gray-400 block">Location</span>
                            <span className="text-xs font-bold text-navy break-words block leading-snug">{event.location || "ASIET Campus"}</span>
                          </div>
                        </div>

                        {/* Dynamic Speaker / Departure Info */}
                        <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/70 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-gray-400 block">
                              {getCategoryFieldLabels(event.type).speakerLabel}
                            </span>
                            {(() => {
                              const raw = event.speaker || "Science Club Team";
                              const parts = raw.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
                              if (parts.length > 1) {
                                return (
                                  <ul className="mt-1 space-y-1">
                                    {parts.map((item, idx) => (
                                      <li key={idx} className="text-xs font-bold text-navy flex items-start gap-1.5 break-words leading-tight">
                                        <span className="text-red font-bold text-[10px] shrink-0 mt-0.5">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              return <span className="text-xs font-bold text-navy break-words block leading-snug">{raw}</span>;
                            })()}
                          </div>
                        </div>

                        {/* Speaker Role / Faculty Coordinators */}
                        {event.speakerRole && (
                          <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/70 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-gray-400 block">
                                {getCategoryFieldLabels(event.type).speakerRoleLabel}
                              </span>
                              {(() => {
                                const parts = event.speakerRole.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
                                if (parts.length > 1) {
                                  return (
                                    <ul className="mt-1 space-y-1">
                                      {parts.map((item, idx) => (
                                        <li key={idx} className="text-xs font-bold text-navy flex items-start gap-1.5 break-words leading-tight">
                                          <span className="text-red font-bold text-[10px] shrink-0 mt-0.5">•</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                }
                                return <span className="text-xs font-bold text-navy break-words block leading-snug">{event.speakerRole}</span>;
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Dynamic Pricing */}
                        {(() => {
                          const pricing = formatEventPricingDisplay(event);
                          if (!pricing.showPricing) return null;
                          return (
                            <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/70 flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                                ₹
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-gray-400 block">Pricing</span>
                                <span className={cn("text-xs font-bold break-words block leading-snug", pricing.isFree ? "text-green-600 font-oswald uppercase tracking-wider" : "text-navy")}>
                                  {pricing.isFree ? "Free Entry" : pricing.text}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                      </div>

                      {/* Prerequisites */}
                      {event.prerequisites && event.prerequisites.length > 0 && (
                        <div className="bg-gray-50/90 p-3.5 rounded-xl border border-gray-100 space-y-2">
                          <span className="font-oswald text-[10px] uppercase font-bold text-navy tracking-wider block">
                            PREREQUISITES & PREPARATION
                          </span>
                          <div className="grid grid-cols-1 gap-2 text-xs text-gray-700 font-medium">
                            {event.prerequisites.map((req, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200/80 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-red shrink-0" />
                                <span>{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </div>
                )}

                {/* WINNERS PODIUM TAB */}
                {activeTab === "WINNERS" && event.winners && (
                  <div className="space-y-4">
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-navy via-navy to-navy/95 text-white p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span className="font-oswald text-base font-bold uppercase tracking-wider text-white">
                          OFFICIAL WINNERS PODIUM & LEADERBOARD
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {event.winners.map((w, idx) => {
                          const isGold = idx === 0 || w.rank.toLowerCase().includes("1st") || w.rank.toLowerCase().includes("gold");
                          const isSilver = idx === 1 || w.rank.toLowerCase().includes("2nd") || w.rank.toLowerCase().includes("silver");
                          const isBronze = idx === 2 || w.rank.toLowerCase().includes("3rd") || w.rank.toLowerCase().includes("bronze");

                          return (
                            <div
                              key={idx}
                              className={cn(
                                "p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all",
                                isGold
                                  ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/40 text-amber-300"
                                  : isSilver
                                  ? "bg-gradient-to-r from-slate-400/20 via-slate-400/10 to-transparent border-slate-300/40 text-slate-200"
                                  : isBronze
                                  ? "bg-gradient-to-r from-amber-700/20 via-amber-700/10 to-transparent border-amber-600/40 text-amber-400"
                                  : "bg-white/5 border-white/10 text-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full font-oswald font-bold text-xs flex items-center justify-center shrink-0 border shadow-sm",
                                  isGold
                                    ? "bg-amber-400 text-navy border-amber-300"
                                    : isSilver
                                    ? "bg-slate-200 text-navy border-slate-100"
                                    : isBronze
                                    ? "bg-amber-700 text-white border-amber-600"
                                    : "bg-white/10 text-white border-white/20"
                                )}>
                                  #{idx + 1}
                                </div>
                                <div>
                                  <span className="font-oswald text-xs uppercase tracking-wider block font-bold">
                                    {w.rank}
                                  </span>
                                  <span className="text-sm font-bold text-white block">
                                    {w.name}
                                  </span>
                                </div>
                              </div>
                              {w.prize && (
                                <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-white/80">
                                  {w.prize}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* DETAILS TAB */}
                {activeTab === "DETAILS" && event.customMetadata && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(event.customMetadata).map(([key, val]) => (
                      <motion.div key={key} variants={itemVariants} className="bg-gray-50/90 p-4 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-oswald uppercase font-bold text-gray-400 tracking-wider block mb-1">
                          {key}
                        </span>
                        <span className="text-sm font-semibold text-navy block">
                          {String(val)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* GALLERY TAB */}
                {activeTab === "GALLERY" && (
                  <div className="space-y-4">
                    {event.galleryImages && event.galleryImages.length > 0 ? (
                      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {event.galleryImages.map((img, idx) => (
                          <div key={idx} className="aspect-video relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={`Gallery photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 font-oswald uppercase text-xs tracking-widest">
                        No gallery photos for this event yet.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="pt-3.5 mt-3.5 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
            {event.requiresRegistration !== false ? (
              <>
                {(event.opStatus === "open" || event.status === "UPCOMING") && (event.memberPrice || event.nonMemberPrice) ? (
                  <span className="text-xs text-navy font-medium">
                    Members <strong className="text-red">₹{event.memberPrice ?? 0}</strong>
                    <span className="text-gray-300 mx-2">·</span>
                    Others <strong>₹{event.nonMemberPrice ?? 0}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 font-normal hidden sm:inline-block">
                    Need assistance? Contact <strong className="text-navy font-semibold">events@scienceclub-asiet.org</strong>
                  </span>
                )}
                
                {/* Register CTA */}
                <RegisterButton
                  eventId={event.id}
                  eventTitle={event.title}
                  memberPrice={event.memberPrice}
                  nonMemberPrice={event.nonMemberPrice}
                  allowedDepartments={event.allowedDepartments}
                  allowedYears={event.allowedYears}
                  opStatus={event.opStatus || (event.status === "COMPLETED" ? "finished" : "open")}
                  formSlug={event.formSlug}
                  formId={event.registrationFormId}
                  className="w-full sm:w-auto ml-auto bg-gradient-to-r from-red via-red to-red text-white text-xs font-oswald uppercase tracking-[0.2em] font-bold px-7 py-3 rounded-full inline-flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(229,57,53,0.35)] hover:shadow-[0_15px_35px_rgba(229,57,53,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
                />
              </>
            ) : (
              <div className="w-full bg-navy/5 border border-navy/10 rounded-full px-5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-oswald uppercase font-bold text-navy tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red" /> INFORMATIONAL LOG / EXECOOM RECORD
                </span>
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">No Registration Required</span>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
