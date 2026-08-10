"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* eslint-disable @next/next/no-img-element */

type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown) => (typeof v === "number" ? v : 0);
const Skeleton = () => <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />;

function useRows(fetcher: () => Promise<Row[]>) {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    let ignore = false;
    void fetcher().then((data) => {
      if (!ignore) setRows(data);
    });
    return () => {
      ignore = true;
    };
  }, [fetcher]);
  return rows;
}

function Head({ heading }: { heading: string }) {
  return heading ? <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6">{heading}</h2> : null;
}

export function PillarsSectionBlock({ heading }: { heading: string }) {
  const rows = useRows(async () => (await createClient().from("pillars").select("*").eq("is_published", true).order("sort_order")).data ?? []);
  return (
    <section className="py-6"><Head heading={heading} />
      {rows === null ? <Skeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((p, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5">
              <span className="text-red font-oswald font-bold">{s(p.num)}</span>
              <p className="font-oswald font-bold uppercase text-navy mt-1">{s(p.title)}</p>
              <p className="text-gray-500 text-sm mt-1">{s(p.short)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function GoalsSectionBlock({ heading }: { heading: string }) {
  const rows = useRows(async () => (await createClient().from("goals").select("*").eq("is_published", true).order("sort_order")).data ?? []);
  return (
    <section className="py-6"><Head heading={heading} />
      {rows === null ? <Skeleton /> : (
        <div className="space-y-3">
          {rows.map((g, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between text-sm"><span className="font-oswald font-bold uppercase text-navy">{s(g.title)}</span><span className="text-gray-400">{s(g.target_year)}</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-red" style={{ width: `${n(g.progress)}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function TimelineSectionBlock({ heading }: { heading: string }) {
  const rows = useRows(async () => (await createClient().from("story_eras").select("*").eq("is_published", true).order("sort_order")).data ?? []);
  return (
    <section className="py-6"><Head heading={heading} />
      {rows === null ? <Skeleton /> : (
        <div className="space-y-6 border-l-2 border-gray-100 pl-6">
          {rows.map((e, i) => (
            <div key={i}>
              <p className="font-oswald text-red font-bold">{s(e.year)}</p>
              <p className="font-oswald font-bold uppercase text-navy">{s(e.title)}</p>
              <p className="text-gray-500 text-sm mt-1" dangerouslySetInnerHTML={{ __html: s(e.description) }} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function FaqSectionBlock({ heading }: { heading: string }) {
  const rows = useRows(async () => (await createClient().from("faqs").select("*").eq("is_published", true).order("sort_order")).data ?? []);
  return (
    <section className="py-6"><Head heading={heading} />
      {rows === null ? <Skeleton /> : (
        <div className="divide-y divide-gray-100">
          {rows.map((f, i) => (
            <div key={i} className="py-4">
              <p className="font-oswald font-bold uppercase text-navy">{s(f.question)}</p>
              <p className="text-gray-500 text-sm mt-1">{s(f.answer)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function PerksSectionBlock({ heading }: { heading: string }) {
  const rows = useRows(async () => (await createClient().from("perks").select("*").eq("is_published", true).order("sort_order")).data ?? []);
  return (
    <section className="py-6"><Head heading={heading} />
      {rows === null ? <Skeleton /> : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><span className="text-red mt-0.5">✓</span> {s(p.text)}</li>)}
        </ul>
      )}
    </section>
  );
}

export function GallerySectionBlock({ heading }: { heading: string }) {
  const rows = useRows(async () => (await createClient().from("media_images").select("*").eq("is_published", true).order("display_order").limit(12)).data ?? []);
  return (
    <section className="py-6"><Head heading={heading} />
      {rows === null ? <Skeleton /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rows.map((im, i) => <img key={i} src={s(im.image_url)} alt={s(im.caption)} className="w-full aspect-[4/3] object-cover rounded-xl" />)}
        </div>
      )}
    </section>
  );
}

export function StatsSectionBlock({ heading }: { heading: string }) {
  const [stats, setStats] = useState<Row[] | null>(null);
  useEffect(() => {
    createClient().from("site_content").select("value").eq("key", "about_stats").maybeSingle().then(({ data }) => {
      const arr = (data?.value as { stats?: Row[] } | null)?.stats;
      setStats(Array.isArray(arr) ? arr : []);
    });
  }, []);
  return (
    <section className="py-6"><Head heading={heading} />
      {stats === null ? <Skeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((st, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5 text-center">
              <p className="font-oswald text-4xl font-bold text-navy">{s(st.value)}</p>
              <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mt-1">{s(st.label)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
