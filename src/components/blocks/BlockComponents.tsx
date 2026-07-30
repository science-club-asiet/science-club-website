"use client";

import { useEffect, useState } from "react";

// ── prop readers (blocks come from jsonb → unknown) ─────────────────────────
type P = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown) => (Array.isArray(v) ? (v as unknown[]) : []);
const rec = (v: unknown) => (v && typeof v === "object" ? (v as P) : {});

/* eslint-disable @next/next/no-img-element */

export function HeroBlock({ props }: { props: P }) {
  const image = s(props.image);
  return (
    <section className="relative overflow-hidden rounded-2xl bg-navy text-white">
      {image && <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/30" />
      <div className="relative z-10 p-8 sm:p-14 min-h-[300px] flex flex-col justify-end">
        {s(props.badge) && (
          <span className="bg-red text-white text-[11px] font-oswald uppercase font-bold tracking-widest px-3 py-1 rounded-full w-fit mb-4">{s(props.badge)}</span>
        )}
        <h1 className="font-oswald text-4xl sm:text-6xl font-bold uppercase leading-[0.95] tracking-tight">{s(props.title) || "Untitled"}</h1>
        {s(props.subtitle) && <p className="text-white/70 mt-3 text-lg max-w-xl">{s(props.subtitle)}</p>}
        {s(props.buttonText) && (
          <a href={s(props.buttonLink) || "#"} className="mt-6 bg-red text-white px-6 py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold w-fit hover:bg-white hover:text-navy transition-colors">
            {s(props.buttonText)}
          </a>
        )}
      </div>
    </section>
  );
}

export function RichTextBlock({ props }: { props: P }) {
  return (
    <section className="py-4">
      {s(props.heading) && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-4">{s(props.heading)}</h2>}
      <p className="text-gray-600 leading-relaxed whitespace-pre-line max-w-2xl">{s(props.body)}</p>
    </section>
  );
}

export function CountdownBlock({ props }: { props: P }) {
  const target = s(props.targetDate);
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white py-8 px-6 flex flex-col sm:flex-row items-center justify-center gap-6">
      <span className="font-oswald uppercase tracking-widest text-xs font-bold text-red">{s(props.label) || "Starts in"}</span>
      <div className="flex gap-4 sm:gap-8">
        {([["d", "Days"], ["h", "Hours"], ["m", "Min"], ["s", "Sec"]] as const).map(([k, lbl]) => (
          <div key={k} className="text-center">
            <p className="font-oswald text-4xl font-bold text-navy tabular-nums">{String(left[k]).padStart(2, "0")}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{lbl}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ScheduleBlock({ props }: { props: P }) {
  const items = arr(props.items).map(rec);
  return (
    <section className="py-4">
      {s(props.heading) && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6">{s(props.heading)}</h2>}
      <div className="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {items.length === 0 && <p className="p-6 text-gray-400 text-sm">No items yet.</p>}
        {items.map((it, i) => (
          <div key={i} className="flex gap-5 p-5">
            <span className="font-oswald font-bold text-red uppercase tracking-wide text-sm w-24 shrink-0">{s(it.time)}</span>
            <div>
              <p className="font-oswald font-bold uppercase text-navy">{s(it.title)}</p>
              {s(it.description) && <p className="text-gray-500 text-sm mt-0.5">{s(it.description)}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqBlock({ props }: { props: P }) {
  const items = arr(props.items).map(rec);
  return (
    <section className="py-4">
      {s(props.heading) && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6">{s(props.heading)}</h2>}
      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((it, i) => (
          <div key={i} className="py-5">
            <p className="font-oswald text-lg font-bold uppercase text-navy mb-2">{s(it.q)}</p>
            <p className="text-gray-500 text-sm leading-relaxed">{s(it.a)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GalleryBlock({ props }: { props: P }) {
  const images = arr(props.images).map(rec);
  return (
    <section className="py-4">
      {s(props.heading) && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6">{s(props.heading)}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((im, i) => (
          <figure key={i} className="rounded-xl overflow-hidden bg-gray-100">
            {s(im.url) && <img src={s(im.url)} alt={s(im.caption)} className="w-full aspect-[4/3] object-cover" />}
            {s(im.caption) && <figcaption className="text-xs text-gray-500 p-2">{s(im.caption)}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function StatsBlock({ props }: { props: P }) {
  const items = arr(props.items).map(rec);
  return (
    <section className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <p className="font-oswald text-4xl font-bold text-navy">{s(it.value)}</p>
          <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mt-1">{s(it.label)}</p>
        </div>
      ))}
    </section>
  );
}

export function CtaBlock({ props }: { props: P }) {
  return (
    <section className="rounded-2xl bg-navy text-white text-center py-12 px-6">
      <h2 className="font-oswald text-3xl sm:text-4xl font-bold uppercase">{s(props.heading) || "Join us"}</h2>
      {s(props.text) && <p className="text-white/70 mt-3 max-w-lg mx-auto">{s(props.text)}</p>}
      {s(props.buttonText) && (
        <a href={s(props.buttonLink) || "#"} className="inline-block mt-6 bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-navy transition-colors">
          {s(props.buttonText)}
        </a>
      )}
    </section>
  );
}

export function SpeakersBlock({ props }: { props: P }) {
  const items = arr(props.items).map(rec);
  return (
    <section className={`py-8 ${s(props.padding)}`} style={{ backgroundColor: s(props.bgColor) || undefined }}>
      {s(props.heading) && <h2 className="font-oswald text-3xl font-bold uppercase text-navy mb-6 text-center">{s(props.heading)}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 mb-4 border-4 border-white shadow-sm">
              {s(it.photo) ? (
                <img src={s(it.photo)} alt={s(it.name)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-oswald uppercase">
                  {(s(it.name) || "?")[0]}
                </div>
              )}
            </div>
            <p className="font-oswald text-lg font-bold uppercase text-navy">{s(it.name)}</p>
            <p className="text-xs uppercase tracking-widest text-red font-bold mt-1">{s(it.role)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SponsorsBlock({ props }: { props: P }) {
  const items = arr(props.items).map(rec);
  return (
    <section className={`py-8 ${s(props.padding)}`} style={{ backgroundColor: s(props.bgColor) || undefined }}>
      {s(props.heading) && <h2 className="font-oswald text-xl font-bold uppercase text-gray-400 mb-6 text-center tracking-widest">{s(props.heading)}</h2>}
      <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-70 hover:opacity-100 transition-opacity">
        {items.map((it, i) => (
          <div key={i} className="h-12 sm:h-16 flex items-center justify-center">
            {s(it.url) ? (
              <img src={s(it.url)} alt={s(it.name)} className="max-h-full max-w-[150px] object-contain grayscale hover:grayscale-0 transition-all duration-300" />
            ) : (
              <span className="font-oswald font-bold text-gray-400 text-lg uppercase">{s(it.name)}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function MapBlock({ props }: { props: P }) {
  const url = s(props.embedUrl);
  return (
    <section className={`py-4 ${s(props.padding)}`} style={{ backgroundColor: s(props.bgColor) || undefined }}>
      <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        {url ? (
          <iframe src={url} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No map URL provided</div>
        )}
      </div>
    </section>
  );
}

export function VideoBlock({ props }: { props: P }) {
  const url = s(props.embedUrl);
  return (
    <section className={`py-4 ${s(props.padding)}`} style={{ backgroundColor: s(props.bgColor) || undefined }}>
      <div className="w-full max-w-4xl mx-auto aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
        {url ? (
          <iframe src={url} width="100%" height="100%" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">No video URL provided</div>
        )}
      </div>
    </section>
  );
}

export function FormEmbedBlock({ props }: { props: P }) {
  return (
    <section className={`py-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 ${s(props.padding)}`} style={{ backgroundColor: s(props.bgColor) || undefined }}>
      <p className="font-oswald uppercase tracking-widest text-sm font-bold text-navy mb-2">Registration Form Embedded</p>
      <p className="text-gray-500 text-xs">Form ID: {s(props.formId) || "None selected"}</p>
      <p className="text-[10px] text-gray-400 mt-2">(In a full implementation, this would render the live form component here)</p>
    </section>
  );
}

export function SpacerBlock({ props }: { props: P }) {
  return (
    <div className={s(props.height) || "h-16"} style={{ backgroundColor: s(props.bgColor) || undefined }} />
  );
}

export function HtmlBlock({ props }: { props: P }) {
  return (
    <section className={`${s(props.padding)}`} style={{ backgroundColor: s(props.bgColor) || undefined }}>
      <div dangerouslySetInnerHTML={{ __html: s(props.html) }} />
    </section>
  );
}
