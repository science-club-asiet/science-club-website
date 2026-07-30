"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* eslint-disable @next/next/no-img-element */

type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");

const IST = "Asia/Kolkata";
const fmtDate = (iso: unknown) =>
  typeof iso === "string" && iso
    ? new Intl.DateTimeFormat("en-GB", { timeZone: IST, day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso))
    : "";

function Loading() {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}</div>;
}

// ── Live Execom grid (current term) ─────────────────────────────────────────
export function ExecomGridBlock({ heading }: { heading: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: ct } = await sb.from("site_content").select("value").eq("key", "current_term").maybeSingle();
      const term = (ct?.value as { term?: string } | null)?.term ?? "2025-26";
      const { data } = await sb.from("execom_members").select("*").eq("term", term).eq("is_published", true).order("display_order");
      setRows(data ?? []);
    })();
  }, []);
  return (
    <section className="py-6">
      {heading && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6 text-center">{heading}</h2>}
      {rows === null ? <Loading /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {rows.map((m, i) => (
            <div key={i} className="text-center">
              {s(m.photo_url) && <img src={s(m.photo_url)} alt={s(m.name)} className="w-24 h-24 rounded-full object-cover mx-auto mb-2" />}
              <p className="font-oswald font-bold uppercase text-navy text-sm">{s(m.name)}</p>
              <p className="text-red text-xs font-bold uppercase tracking-wide">{s(m.position)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Live Events list ────────────────────────────────────────────────────────
export function EventsListBlock({ heading, limit }: { heading: string; limit: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data } = await sb.from("events").select("*").eq("is_published", true).order("event_date", { ascending: false }).limit(limit || 6);
      setRows(data ?? []);
    })();
  }, [limit]);
  return (
    <section className="py-6">
      {heading && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6">{heading}</h2>}
      {rows === null ? <Loading /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((e, i) => (
            <a key={i} href={`/events/${s(e.slug)}`} className="block rounded-xl border border-gray-200 overflow-hidden hover:border-red transition-colors">
              {s(e.cover_image_url) && <img src={s(e.cover_image_url)} alt={s(e.title)} className="w-full aspect-[16/10] object-cover" />}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red">{s(e.category)} · {fmtDate(e.event_date)}</p>
                <p className="font-oswald font-bold uppercase text-navy mt-1">{s(e.title)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Live News feed ──────────────────────────────────────────────────────────
export function NewsFeedBlock({ heading, limit }: { heading: string; limit: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data } = await sb.from("posts").select("*").eq("type", "news").eq("status", "published").order("published_at", { ascending: false }).limit(limit || 3);
      setRows(data ?? []);
    })();
  }, [limit]);
  return (
    <section className="py-6">
      {heading && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6">{heading}</h2>}
      {rows === null ? <Loading /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rows.map((p, i) => (
            <a key={i} href={`/news/${s(p.slug)}`} className="block">
              {s(p.cover_image_url) && <img src={s(p.cover_image_url)} alt={s(p.title)} className="w-full aspect-[16/10] object-cover rounded-xl mb-3" />}
              <p className="text-[10px] font-bold uppercase tracking-widest text-red">{s(p.tag)} · {fmtDate(p.published_at)}</p>
              <p className="font-oswald font-bold uppercase text-navy mt-1">{s(p.title)}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
