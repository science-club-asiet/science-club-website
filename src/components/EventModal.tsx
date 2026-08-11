"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { 
  X, 
  Clock, 
  MapPin, 
  Share2, 
  CheckCircle2, 
  Download,
  Sparkles,
  Calendar,
  User,
  Trophy,
  Globe,
  ExternalLink,
  Sliders
} from "lucide-react";
import { ScienceEvent } from "@/lib/events";
import { cn } from "@/lib/utils";
import { RegisterButton } from "@/components/RegisterButton";

interface EventModalProps {
  event: ScienceEvent;
  onClose: () => void;
}

type ModalTab = "OVERVIEW" | "WINNERS" | "DETAILS" | "GALLERY" | "AGENDA" | "SPEAKERS" | "VENUE";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-6 overflow-y-auto font-inter pt-16 sm:pt-6"
    >
      {/* Backdrop Click Trigger */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Main Modal Card Container (Middle-Ground Proportion) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl md:max-w-4xl max-h-[85vh] sm:max-h-[90vh] bg-white text-navy rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden flex flex-col my-auto"
      >
        {/* Top Deep Navy Header Banner */}
        <div className="relative w-full bg-navy text-white p-4 sm:p-8 shrink-0 overflow-hidden">
          <Image
            src={event.img}
            alt={event.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover opacity-30 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40" />

          {/* Close Button (z-20 top-right) */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Content */}
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <span className="bg-red text-white text-[10px] font-oswald uppercase font-bold tracking-[0.2em] px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {event.status}
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-[10px] font-oswald uppercase font-bold tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/15">
                {event.type}
              </span>
              {event.externalWebsiteUrl && (
                <a
                  href={event.externalWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-xs font-oswald uppercase font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/20"
                >
                  <Globe className="w-3.5 h-3.5 text-red" />
                  <span>WEBSITE</span>
                  <ExternalLink className="w-3 h-3 text-white/70" />
                </a>
              )}
              <button
                onClick={handleShare}
                className={cn(
                  "text-white/70 hover:text-white text-xs font-oswald uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer",
                  !event.externalWebsiteUrl && "ml-auto",
                  "mr-10 sm:mr-14"
                )}
              >
                <Share2 className="w-3.5 h-3.5 text-red" />
                <span>{copied ? "COPIED!" : "SHARE"}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="text-red font-oswald uppercase text-[10px] sm:text-[11px] font-bold tracking-[0.25em] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-red" />
                  OFFICIAL EVENT FIXTURE SPECIFICATION
                </span>
                <h2 className="font-oswald text-xl sm:text-4xl font-bold uppercase tracking-tight text-white leading-tight sm:leading-none">
                  {event.title}
                </h2>
              </div>

              {/* Date Badge */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shrink-0 self-start sm:self-auto">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-red" />
                <div className="text-left">
                  <span className="font-oswald text-base sm:text-lg font-bold leading-none block">{event.dateDay} {event.dateMonth}</span>
                  <span className="font-oswald text-[9px] uppercase tracking-widest text-white/60 block">{event.dateYear || "2025"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-8 flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
          
          {/* Segmented Tab Slider Bar with Touch Pan & Lenis Protection */}
          <div 
            data-lenis-prevent
            className="w-full overflow-x-auto touch-pan-x pb-2 mb-4 border-b border-gray-100 font-oswald uppercase text-xs font-bold tracking-wider shrink-0 no-scrollbar"
          >
            <div className="inline-flex bg-gray-100 p-1 rounded-full relative min-w-max">
              {(
                [
                  "OVERVIEW",
                  ...(event.winners && event.winners.length > 0 && event.opStatus !== "open" ? ["WINNERS"] : []),
                  ...(event.customMetadata && Object.keys(event.customMetadata).length > 0 ? ["DETAILS"] : []),
                  ...(event.galleryImages && event.galleryImages.length > 0 ? ["GALLERY"] : []),
                  "AGENDA",
                  "SPEAKERS",
                  "VENUE",
                ] as ModalTab[]
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-4 sm:px-5 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 z-10 text-[11px] sm:text-xs",
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
                  {tab === "VENUE" ? "VENUE & PASS" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Flexible Internal Scroll Container */}
          <div 
            data-lenis-prevent
            className="flex-1 min-h-[200px] max-h-[300px] sm:max-h-[360px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin text-gray-600 text-sm font-normal leading-relaxed"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* OVERVIEW TAB */}
                {activeTab === "OVERVIEW" && (
                  <div className="space-y-4">
                    <motion.p variants={itemVariants} className="text-gray-700 text-base leading-relaxed font-normal">
                      {event.description}
                    </motion.p>

                    {event.prerequisites && (
                      <motion.div variants={itemVariants} className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100 space-y-3">
                        <span className="font-oswald text-xs uppercase font-bold text-navy tracking-wider block mb-1">
                          PREREQUISITES & PREPARATION
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700 font-medium">
                          {event.prerequisites.map((req, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-gray-200/80 shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-red shrink-0" />
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                {/* WINNERS PODIUM TAB */}
                {activeTab === "WINNERS" && event.winners && (
                  <div className="space-y-4">
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-navy via-navy to-navy/95 text-white p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
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
                                "p-4 rounded-xl border flex items-center justify-between gap-3 transition-all",
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
                                  "w-9 h-9 rounded-full font-oswald font-bold text-xs flex items-center justify-center shrink-0 border shadow-sm",
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
                                  <span className="font-inter text-sm font-semibold text-white block">
                                    {w.name}
                                  </span>
                                </div>
                              </div>

                              {w.prize && (
                                <span className="font-mono text-xs font-bold bg-white/15 px-3 py-1.5 rounded-full border border-white/10 text-white">
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

                {/* EXTRA DETAILS & CUSTOM METADATA TAB */}
                {activeTab === "DETAILS" && event.customMetadata && (
                  <div className="space-y-4">
                    <motion.div variants={itemVariants} className="bg-gray-50/90 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                      <span className="font-oswald text-xs uppercase font-bold text-navy tracking-wider flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Sliders className="w-4 h-4 text-red" /> ADDITIONAL EVENT SPECIFICATIONS
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(event.customMetadata).map(([key, val], idx) => (
                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                            <span className="font-oswald text-[11px] uppercase font-bold text-navy/60 tracking-wider block">
                              {key}
                            </span>
                            <span className="font-inter text-xs text-navy font-semibold block break-all">
                              {val.startsWith("http") ? (
                                <a href={val} target="_blank" rel="noreferrer" className="text-red hover:underline inline-flex items-center gap-1">
                                  {val} <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                val
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* REDESIGNED AGENDA TIMELINE TAB */}
                {activeTab === "AGENDA" && (
                  <div className="space-y-3">
                    {(event.agenda || [
                      { time: "09:00 AM", title: "Registration & Welcome Coffee", description: "Collect participant badges and preliminary networking session." },
                      { time: "10:00 AM", title: "Keynote Address: Scientific Frontiers", description: "Presented by senior faculty researchers and keynote academic speakers." },
                      { time: "01:00 PM", title: "Networking Lunch & Poster Showcase", description: "Student paper showcases and poster evaluations." },
                      { time: "02:30 PM", title: "Interactive Laboratory Workshop", description: "Hands-on physical laboratory experiments." }
                    ]).map((item, idx) => (
                      <motion.div 
                        key={idx} 
                        variants={itemVariants} 
                        className="bg-gray-50/90 hover:bg-gray-100/90 p-4 sm:p-5 rounded-2xl border border-gray-200/80 transition-all flex items-start gap-4 group"
                      >
                        {/* Time Badge */}
                        <div className="bg-navy text-white px-3.5 py-2 rounded-xl font-oswald text-xs font-bold text-center shrink-0 shadow-sm group-hover:bg-red transition-colors">
                          <span className="block leading-none">{item.time}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-oswald text-base font-bold uppercase text-navy group-hover:text-red transition-colors truncate">
                              {item.title}
                            </h4>
                            <span className="text-[9px] font-oswald uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-navy/10 text-navy shrink-0">
                              SESSION {idx + 1}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 font-normal leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* SPEAKERS TAB */}
                {activeTab === "SPEAKERS" && (
                  <div className="space-y-4">
                    {event.speaker ? (
                      <motion.div variants={itemVariants} className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-100 flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center font-oswald font-bold text-2xl shrink-0 shadow-md border-2 border-red">
                          {event.speaker.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-oswald uppercase font-bold text-red tracking-widest block">
                            KEYNOTE PRESENTER
                          </span>
                          <h4 className="font-oswald text-2xl font-bold uppercase text-navy">
                            {event.speaker}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pb-1">
                            <User className="w-3.5 h-3.5 text-red" />
                            <span>{event.speakerRole || "Guest Academic Specialist"}</span>
                          </div>
                          <p className="text-xs text-gray-600 font-normal leading-relaxed">
                            Leading active research initiatives at Science Club ASIET with domain expertise in empirical methodologies.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 font-oswald uppercase text-xs tracking-widest">
                        Speaker details will be announced soon.
                      </div>
                    )}
                  </div>
                )}

                {/* VENUE & PASS TAB */}
                {activeTab === "VENUE" && (
                  <div className="space-y-4">
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-oswald uppercase font-bold text-red tracking-widest block mb-1.5">
                          LOCATION & VENUE
                        </span>
                        <div className="flex items-center gap-2.5 text-navy font-bold text-base font-oswald uppercase">
                          <MapPin className="w-4.5 h-4.5 text-red shrink-0" />
                          <span className="truncate">{event.location || "Main Auditorium, Science Block"}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-oswald uppercase font-bold text-red tracking-widest block mb-1.5">
                          SCHEDULED TIME SLOT
                        </span>
                        <div className="flex items-center gap-2.5 text-navy font-bold text-base font-oswald uppercase">
                          <Clock className="w-4.5 h-4.5 text-red shrink-0" />
                          <span>{event.time || "09:00 AM - 05:00 PM"}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* One-Click .ICS Pass Export Card */}
                    <motion.div variants={itemVariants} className="bg-navy text-white p-5 sm:p-6 rounded-2xl border border-navy/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                      <div>
                        <h4 className="font-oswald text-xl font-bold uppercase tracking-tight text-white">
                          EXPORT CALENDAR PASS (.ICS)
                        </h4>
                        <p className="text-xs text-white/70 font-normal mt-0.5">
                          Save this event directly to Apple Calendar, Outlook, or Google Calendar.
                        </p>
                      </div>
                      <button
                        onClick={handleExportCalendar}
                        className="bg-red hover:bg-white hover:text-navy text-white text-xs font-oswald uppercase font-bold tracking-wider px-6 py-3 rounded-xl inline-flex items-center gap-2.5 transition-all cursor-pointer shrink-0 shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>DOWNLOAD .ICS</span>
                      </button>
                    </motion.div>
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
          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
            {event.requiresRegistration !== false ? (
              <>
                {(event.opStatus === "open" || event.status === "UPCOMING") && (event.memberPrice || event.nonMemberPrice) ? (
                  <span className="text-sm text-navy font-medium">
                    Members <strong className="text-red">₹{event.memberPrice ?? 0}</strong>
                    <span className="text-gray-300 mx-2">·</span>
                    Others <strong>₹{event.nonMemberPrice ?? 0}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 font-normal hidden sm:inline-block">
                    Need assistance? Contact <strong className="text-navy font-semibold">events@scienceclub-asiet.org</strong>
                  </span>
                )}
                
                {/* Register CTA — real registration via /api/events/[id]/register or linked form */}
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
                  className="w-full sm:w-auto ml-auto bg-gradient-to-r from-red via-red to-red text-white text-sm font-oswald uppercase tracking-[0.2em] font-bold px-8 py-3.5 rounded-full inline-flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(229,57,53,0.35)] hover:shadow-[0_15px_35px_rgba(229,57,53,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
                />
              </>
            ) : (
              <div className="w-full bg-navy/5 border border-navy/10 rounded-full px-5 py-3 flex items-center justify-between">
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
