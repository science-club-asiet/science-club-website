import React, { useState } from "react";
import { AppWindow, Rows3, GalleryHorizontal, Menu, ChevronLeft, ChevronRight, ChevronDown, Code2 } from "lucide-react";
import type { FieldSchema, RegistryEntry } from "./types";

/*
 * Advanced widgets. Interactive state lives in these child components so the
 * registry `render` functions stay hook-free (they just return `<div><Widget/></div>`).
 * None of these lock page scroll, so they're inherently safe alongside Lenis
 * (AGENTS.md scroll rules) — no navbar overlay / modal that would need
 * `window.__lenis?.stop()`.
 */

// ── Tabs ─────────────────────────────────────────────────────────────────────
function TabsWidget({ tabs = [] }: { tabs: { label: string; content: string }[] }) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];
  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              i === active ? "border-red text-navy" : "border-transparent text-gray-500 hover:text-navy"
            }`}
          >
            {t.label || `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="py-4 text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: current?.content ?? "" }} />
    </div>
  );
}

// ── Accordion ────────────────────────────────────────────────────────────────
function AccordionWidget({ items = [] }: { items: { title: string; content: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
      {items.map((it, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy hover:bg-gray-50"
          >
            {it.title || `Item ${i + 1}`}
            <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: it.content ?? "" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Slider ───────────────────────────────────────────────────────────────────
function SliderWidget({ slides = [] }: { slides: { image: string; caption?: string }[] }) {
  const [i, setI] = useState(0);
  const count = slides.length || 1;
  const go = (dir: number) => setI((prev) => (prev + dir + count) % count);
  const slide = slides[i];
  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-100">
      {slide?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={slide.image} alt={slide.caption ?? ""} className="w-full h-72 object-cover" />
      ) : (
        <div className="w-full h-72 flex items-center justify-center text-gray-400 text-sm">No slides</div>
      )}
      {slide?.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent text-white p-4 text-sm">
          {slide.caption}
        </div>
      )}
      {count > 1 && (
        <>
          <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
            {slides.map((_, idx) => (
              <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Navbar (no scroll-locking mobile overlay — Lenis-safe) ───────────────────
function NavbarWidget({ brand = "Science Club", links = [] }: { brand?: string; links?: { label: string; url: string }[] }) {
  return (
    <nav className="flex items-center justify-between flex-wrap gap-3 py-3">
      <span className="font-oswald uppercase font-bold text-navy text-lg">{brand}</span>
      <div className="flex items-center gap-5 flex-wrap">
        {links.map((l, i) => (
          <a key={i} href={l.url || "#"} className="text-sm font-medium text-gray-600 hover:text-red transition-colors">
            {l.label || "Link"}
          </a>
        ))}
      </div>
    </nav>
  );
}

const richItem: FieldSchema[] = [
  { kind: "text", name: "label", label: "Label" },
  { kind: "textarea", name: "content", label: "Content (HTML allowed)" },
];

export const advancedEntries: RegistryEntry[] = [
  {
    type: "Tabs",
    label: "Tabs",
    icon: AppWindow,
    category: "advanced",
    editorInert: true,
    render: ({ tabs, style }: { tabs?: { label: string; content: string }[]; style?: React.CSSProperties }) => (
      <div style={style}><TabsWidget tabs={tabs ?? []} /></div>
    ),
    defaultProps: {
      tabs: [
        { label: "Tab 1", content: "<p>First tab content.</p>" },
        { label: "Tab 2", content: "<p>Second tab content.</p>" },
      ],
      style: { width: "100%" },
    },
    settings: [{ kind: "array", name: "tabs", label: "Tabs", itemLabel: "Tab", item: richItem }],
  },
  {
    type: "Accordion",
    label: "Accordion",
    icon: Rows3,
    category: "advanced",
    editorInert: true,
    render: ({ items, style }: { items?: { title: string; content: string }[]; style?: React.CSSProperties }) => (
      <div style={style}><AccordionWidget items={items ?? []} /></div>
    ),
    defaultProps: {
      items: [
        { title: "Question one", content: "<p>Answer one.</p>" },
        { title: "Question two", content: "<p>Answer two.</p>" },
      ],
      style: { width: "100%" },
    },
    settings: [
      {
        kind: "array", name: "items", label: "Items", itemLabel: "Item",
        item: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "content", label: "Content (HTML allowed)" },
        ],
      },
    ],
  },
  {
    type: "Slider",
    label: "Slider",
    icon: GalleryHorizontal,
    category: "advanced",
    editorInert: true,
    render: ({ slides, style }: { slides?: { image: string; caption?: string }[]; style?: React.CSSProperties }) => (
      <div style={style}><SliderWidget slides={slides ?? []} /></div>
    ),
    defaultProps: {
      slides: [
        { image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop", caption: "First slide" },
        { image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop", caption: "Second slide" },
      ],
      style: { width: "100%" },
    },
    settings: [
      {
        kind: "array", name: "slides", label: "Slides", itemLabel: "Slide",
        item: [
          { kind: "image", name: "image", label: "Image" },
          { kind: "text", name: "caption", label: "Caption" },
        ],
      },
    ],
  },
  {
    type: "Navbar",
    label: "Navbar",
    icon: Menu,
    category: "advanced",
    editorInert: true,
    render: ({ brand, links, style }: { brand?: string; links?: { label: string; url: string }[]; style?: React.CSSProperties }) => (
      <div style={style}><NavbarWidget brand={brand} links={links} /></div>
    ),
    defaultProps: {
      brand: "Science Club",
      links: [
        { label: "Home", url: "/" },
        { label: "Events", url: "/events" },
        { label: "About", url: "/info/about" },
      ],
      style: { width: "100%" },
    },
    settings: [
      { kind: "text", name: "brand", label: "Brand" },
      {
        kind: "array", name: "links", label: "Links", itemLabel: "Link",
        item: [
          { kind: "text", name: "label", label: "Label" },
          { kind: "link", name: "url", label: "URL" },
        ],
      },
    ],
  },
  {
    type: "Embed",
    label: "Embed",
    icon: Code2,
    category: "advanced",
    editorInert: true,
    render: ({ html, style }: { html?: string; style?: React.CSSProperties }) => (
      <div style={style} dangerouslySetInnerHTML={{ __html: html || '<div style="padding:16px;color:#94a3b8;border:1px dashed #cbd5e1;text-align:center;font-size:12px">Empty embed — paste HTML in settings</div>' }} />
    ),
    defaultProps: { html: "", style: { width: "100%" } },
    settings: [
      { kind: "textarea", name: "html", label: "HTML / embed code" },
      { kind: "visibility", name: "hideOn", label: "Visibility" },
    ],
  },
];
