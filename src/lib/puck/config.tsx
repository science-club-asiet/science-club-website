import type { ReactNode } from "react";
import { DropZone, type Config } from "@measured/puck";
import { ExecomGridBlock, EventsListBlock, NewsFeedBlock } from "@/components/blocks/DataBlocks";
import { PillarsSectionBlock, GoalsSectionBlock, TimelineSectionBlock, FaqSectionBlock, PerksSectionBlock, GallerySectionBlock, StatsSectionBlock } from "@/components/blocks/DataBlocks2";

/* eslint-disable @next/next/no-img-element */

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";

function FieldWrap({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, color: "#4b5563" }}>
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

type FieldProps = { label: string; name: string; placeholder: string; required: boolean };

export type PuckProps = {
  Container: { padding: string; background: string; maxWidth: string };
  Columns: { columns: number; gap: string };
  Heading: { text: string; level: "h1" | "h2" | "h3" | "h4"; align: "left" | "center" | "right"; color: string };
  Text: { text: string; align: "left" | "center" | "right"; color: string; size: string };
  ImageBlock: { url: string; alt: string; radius: string; maxHeight: string };
  ButtonBlock: { label: string; href: string; bg: string; color: string };
  Divider: { color: string };
  Space: { size: number };
  ShortText: FieldProps;
  EmailField: FieldProps;
  TextareaField: FieldProps;
  SelectField: { label: string; name: string; required: boolean; options: { label: string }[] };
  CheckboxField: { label: string; name: string };
  ExecomGrid: { heading: string };
  EventsList: { heading: string; limit: number };
  NewsFeed: { heading: string; limit: number };
  Pillars: { heading: string };
  Goals: { heading: string };
  Timeline: { heading: string };
  FaqLive: { heading: string };
  PerksLive: { heading: string };
  GalleryLive: { heading: string };
  StatsLive: { heading: string };
};

const align = { type: "select" as const, options: [
  { label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" },
] };

export const puckConfig: Config<PuckProps> = {
  categories: {
    layout: { title: "Layout", components: ["Container", "Columns", "Divider", "Space"] },
    content: { title: "Content", components: ["Heading", "Text", "ImageBlock", "ButtonBlock"] },
    fields: { title: "Form Fields", components: ["ShortText", "EmailField", "TextareaField", "SelectField", "CheckboxField"] },
    sections: { title: "Live Sections", components: ["ExecomGrid", "EventsList", "NewsFeed", "Pillars", "Goals", "Timeline", "FaqLive", "PerksLive", "GalleryLive", "StatsLive"] },
  },
  components: {
    // ── Layout ──────────────────────────────────────────────────────────────
    Container: {
      fields: { padding: { type: "text" }, background: { type: "text" }, maxWidth: { type: "text" } },
      defaultProps: { padding: "24px", background: "transparent", maxWidth: "" },
      render: ({ padding, background, maxWidth }) => (
        <div style={{ padding, background, maxWidth: maxWidth || undefined, marginLeft: maxWidth ? "auto" : undefined, marginRight: maxWidth ? "auto" : undefined }}>
          <DropZone zone="content" />
        </div>
      ),
    },
    Columns: {
      fields: { columns: { type: "number", min: 1, max: 4 }, gap: { type: "text" } },
      defaultProps: { columns: 2, gap: "16px" },
      render: ({ columns, gap }) => (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns || 1}, minmax(0,1fr))`, gap }}>
          {Array.from({ length: columns || 1 }).map((_, i) => <DropZone key={i} zone={`col-${i}`} />)}
        </div>
      ),
    },
    Divider: {
      fields: { color: { type: "text" } },
      defaultProps: { color: "#e5e7eb" },
      render: ({ color }) => <hr style={{ border: 0, borderTop: `1px solid ${color || "#e5e7eb"}`, margin: "16px 0" }} />,
    },
    Space: {
      fields: { size: { type: "number", min: 0, max: 200 } },
      defaultProps: { size: 32 },
      render: ({ size }) => <div style={{ height: size }} />,
    },
    // ── Content ─────────────────────────────────────────────────────────────
    Heading: {
      fields: {
        text: { type: "text" },
        level: { type: "select", options: [{ label: "H1", value: "h1" }, { label: "H2", value: "h2" }, { label: "H3", value: "h3" }, { label: "H4", value: "h4" }] },
        align, color: { type: "text" },
      },
      defaultProps: { text: "Heading", level: "h2", align: "left", color: "#0b1220" },
      render: ({ text, level, align, color }) => {
        const Tag = level as keyof React.JSX.IntrinsicElements;
        return <Tag style={{ textAlign: align, color: color || undefined, margin: 0, fontWeight: 700 }} className="font-oswald uppercase">{text}</Tag>;
      },
    },
    Text: {
      fields: { text: { type: "textarea" }, align, color: { type: "text" }, size: { type: "text" } },
      defaultProps: { text: "Some text…", align: "left", color: "#4b5563", size: "16px" },
      render: ({ text, align, color, size }) => (
        <p style={{ textAlign: align, color: color || undefined, fontSize: size || undefined, whiteSpace: "pre-line", margin: 0 }}>{text}</p>
      ),
    },
    ImageBlock: {
      fields: { url: { type: "text" }, alt: { type: "text" }, radius: { type: "text" }, maxHeight: { type: "text" } },
      defaultProps: { url: "", alt: "", radius: "12px", maxHeight: "" },
      render: ({ url, alt, radius, maxHeight }) =>
        url ? <img src={url} alt={alt} style={{ width: "100%", maxHeight: maxHeight || undefined, objectFit: "cover", borderRadius: radius || undefined, display: "block" }} />
            : <div style={{ background: "#f3f4f6", borderRadius: 12, height: 160, display: "grid", placeItems: "center", color: "#9ca3af", fontSize: 13 }}>Image URL not set</div>,
    },
    ButtonBlock: {
      fields: { label: { type: "text" }, href: { type: "text" }, bg: { type: "text" }, color: { type: "text" } },
      defaultProps: { label: "Button", href: "#", bg: "#e5322d", color: "#ffffff" },
      render: ({ label, href, bg, color }) => (
        <a href={href} style={{ display: "inline-block", background: bg, color, padding: "10px 22px", borderRadius: 999, fontWeight: 700, textTransform: "uppercase", fontSize: 13, letterSpacing: "0.05em", textDecoration: "none" }}>{label}</a>
      ),
    },
    // ── Form fields ─────────────────────────────────────────────────────────
    ShortText: {
      fields: { label: { type: "text" }, name: { type: "text" }, placeholder: { type: "text" }, required: { type: "radio", options: [{ label: "Required", value: true }, { label: "Optional", value: false }] } },
      defaultProps: { label: "Short answer", name: "short_text", placeholder: "", required: false },
      render: ({ label, name, placeholder, required }) => <FieldWrap label={label} required={required}><input name={name} placeholder={placeholder} required={required} className={inputCls} /></FieldWrap>,
    },
    EmailField: {
      fields: { label: { type: "text" }, name: { type: "text" }, placeholder: { type: "text" }, required: { type: "radio", options: [{ label: "Required", value: true }, { label: "Optional", value: false }] } },
      defaultProps: { label: "Email", name: "email", placeholder: "you@email.com", required: true },
      render: ({ label, name, placeholder, required }) => <FieldWrap label={label} required={required}><input type="email" name={name} placeholder={placeholder} required={required} className={inputCls} /></FieldWrap>,
    },
    TextareaField: {
      fields: { label: { type: "text" }, name: { type: "text" }, placeholder: { type: "text" }, required: { type: "radio", options: [{ label: "Required", value: true }, { label: "Optional", value: false }] } },
      defaultProps: { label: "Long answer", name: "long_text", placeholder: "", required: false },
      render: ({ label, name, placeholder, required }) => <FieldWrap label={label} required={required}><textarea name={name} placeholder={placeholder} required={required} rows={4} className={inputCls} /></FieldWrap>,
    },
    SelectField: {
      fields: {
        label: { type: "text" }, name: { type: "text" },
        required: { type: "radio", options: [{ label: "Required", value: true }, { label: "Optional", value: false }] },
        options: { type: "array", arrayFields: { label: { type: "text" } }, defaultItemProps: { label: "Option" }, getItemSummary: (i) => i.label || "Option" },
      },
      defaultProps: { label: "Select", name: "select", required: false, options: [{ label: "Option 1" }, { label: "Option 2" }] },
      render: ({ label, name, required, options }) => (
        <FieldWrap label={label} required={required}>
          <select name={name} required={required} className={inputCls} defaultValue="">
            <option value="" disabled>Choose…</option>
            {(options ?? []).map((o, i) => <option key={i} value={o.label}>{o.label}</option>)}
          </select>
        </FieldWrap>
      ),
    },
    CheckboxField: {
      fields: { label: { type: "text" }, name: { type: "text" } },
      defaultProps: { label: "I agree", name: "agree" },
      render: ({ label, name }) => (
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
          <input type="checkbox" name={name} /> {label}
        </label>
      ),
    },
    // ── Live data sections (pull real content from the DB) ────────────────────
    ExecomGrid: {
      fields: { heading: { type: "text" } },
      defaultProps: { heading: "Executive Committee" },
      render: ({ heading }) => <ExecomGridBlock heading={heading} />,
    },
    EventsList: {
      fields: { heading: { type: "text" }, limit: { type: "number", min: 1, max: 12 } },
      defaultProps: { heading: "Upcoming Events", limit: 6 },
      render: ({ heading, limit }) => <EventsListBlock heading={heading} limit={limit} />,
    },
    NewsFeed: {
      fields: { heading: { type: "text" }, limit: { type: "number", min: 1, max: 12 } },
      defaultProps: { heading: "Latest News", limit: 3 },
      render: ({ heading, limit }) => <NewsFeedBlock heading={heading} limit={limit} />,
    },
    Pillars: { fields: { heading: { type: "text" } }, defaultProps: { heading: "Our Pillars" }, render: ({ heading }) => <PillarsSectionBlock heading={heading} /> },
    Goals: { fields: { heading: { type: "text" } }, defaultProps: { heading: "Strategic Goals" }, render: ({ heading }) => <GoalsSectionBlock heading={heading} /> },
    Timeline: { fields: { heading: { type: "text" } }, defaultProps: { heading: "Our Story" }, render: ({ heading }) => <TimelineSectionBlock heading={heading} /> },
    FaqLive: { fields: { heading: { type: "text" } }, defaultProps: { heading: "FAQ" }, render: ({ heading }) => <FaqSectionBlock heading={heading} /> },
    PerksLive: { fields: { heading: { type: "text" } }, defaultProps: { heading: "Member Perks" }, render: ({ heading }) => <PerksSectionBlock heading={heading} /> },
    GalleryLive: { fields: { heading: { type: "text" } }, defaultProps: { heading: "Gallery" }, render: ({ heading }) => <GallerySectionBlock heading={heading} /> },
    StatsLive: { fields: { heading: { type: "text" } }, defaultProps: { heading: "By the Numbers" }, render: ({ heading }) => <StatsSectionBlock heading={heading} /> },
  },
};
