"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Album } from "@/lib/data/gallery";
import { cn } from "@/lib/utils";

export function GalleryView({ albums }: { albums: Album[] }) {
  const [active, setActive] = useState<Album | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const cats = Array.from(new Set(albums.map((a) => a.category).filter(Boolean)));
  const shown = filter === "ALL" ? albums : albums.filter((a) => a.category === filter);

  // Lenis owns the scroll — pause it while the lightbox is open (repo rule).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (active) window.__lenis?.stop();
    else window.__lenis?.start();
    return () => window.__lenis?.start();
  }, [active]);

  return (
    <section className="container mx-auto px-4 lg:px-8 pb-24">
      {cats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {["ALL", ...cats].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-oswald uppercase tracking-widest font-bold transition-colors",
                filter === c ? "bg-red text-white" : "bg-gray-100 text-navy/60 hover:bg-gray-200"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 && <p className="text-gray-400">No albums yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((a) => (
          <button key={a.id} onClick={() => setActive(a)} className="group text-left">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              {a.cover && (
                <Image src={a.cover} alt={a.title} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white font-oswald uppercase font-bold text-xl">{a.title}</span>
              <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest bg-white/90 text-navy px-2 py-0.5 rounded-full">
                {a.images.length} photos
              </span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm overflow-y-auto p-4 sm:p-10"
            onClick={() => setActive(null)}
          >
            <div className="max-w-5xl mx-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 mb-6 text-white sticky top-0">
                <div>
                  <h2 className="font-oswald text-3xl font-bold uppercase">{active.title}</h2>
                  {active.description && <p className="text-white/60 text-sm mt-1">{active.description}</p>}
                </div>
                <button onClick={() => setActive(null)} aria-label="Close" className="w-10 h-10 shrink-0 rounded-full bg-white/10 hover:bg-red flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
                {active.images.map((img) => (
                  <figure key={img.id} className="break-inside-avoid rounded-xl overflow-hidden bg-white/5">
                    <div className="relative w-full aspect-[4/3]">
                      <Image src={img.url} alt={img.caption} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover" />
                    </div>
                    {img.caption && <figcaption className="text-white/70 text-xs p-2.5">{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
