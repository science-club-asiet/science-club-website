/**
 * One-time content migration: Puck `layout` → Nexus `nexus_data` (Craft.js tree).
 *
 * Best-effort: maps the components both builders share. Review each page in the
 * Nexus builder after running, before you delete the `layout` column / remove Puck.
 *
 * Run (dry-run, prints what it would do):
 *   node --env-file=.env.local scripts/migrate-puck-to-nexus.mjs
 * Apply for real:
 *   node --env-file=.env.local scripts/migrate-puck-to-nexus.mjs --apply
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env file.
 * Idempotent: rows that already have `nexus_data` are skipped.
 */
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const rootStyle = {
  display: "flex", flexDirection: "column", width: "100%",
  paddingTop: "0px", paddingBottom: "0px", paddingLeft: "0px", paddingRight: "0px",
  marginTop: "0px", marginBottom: "0px", backgroundColor: "transparent", position: "relative",
};

// Puck type → Craft node factory. `canvas`/`zones` drive child resolution.
const MAP = {
  Heading: (p) => ({ type: "Heading", props: { text: p.text ?? "Heading", tagName: p.level ?? "h1", style: { fontFamily: "var(--font-oswald), sans-serif", fontWeight: "700", textAlign: p.align ?? "left", color: p.color ?? "#111827", marginBottom: "16px" } } }),
  Text: (p) => ({ type: "Text", props: { text: p.text ?? "", style: { textAlign: p.align ?? "left", color: p.color ?? "#4B5563", fontSize: p.size ?? "16px", marginBottom: "16px" } } }),
  ImageBlock: (p) => ({ type: "Image", props: { src: p.url ?? "", alt: p.alt ?? "", style: { width: "100%", display: "block", objectFit: "cover", borderRadius: p.radius ?? "0px", maxHeight: p.maxHeight || undefined } } }),
  ButtonBlock: (p) => ({ type: "Button", props: { text: p.label ?? "Button", url: p.href ?? "#", target: "_self", style: { display: "inline-block", backgroundColor: p.bg ?? "#2563EB", color: p.color ?? "#ffffff", paddingTop: "12px", paddingBottom: "12px", paddingLeft: "24px", paddingRight: "24px", borderRadius: "6px", textDecoration: "none", fontWeight: "500", fontSize: "14px" } } }),
  Divider: (p) => ({ type: "Divider", props: { style: { width: "100%", border: "none", borderTop: `1px solid ${p.color ?? "#E5E7EB"}`, marginTop: "20px", marginBottom: "20px" } } }),
  Space: (p) => ({ type: "Spacer", props: { style: { width: "100%", height: `${p.size ?? 24}px` } } }),
  Container: (p) => ({ type: "Container", canvas: true, zones: ["content"], props: { style: { display: "flex", flexDirection: "column", width: "100%", paddingTop: p.padding ?? "24px", paddingBottom: p.padding ?? "24px", paddingLeft: p.padding ?? "24px", paddingRight: p.padding ?? "24px", backgroundColor: p.background ?? "transparent", maxWidth: p.maxWidth || undefined, marginLeft: p.maxWidth ? "auto" : undefined, marginRight: p.maxWidth ? "auto" : undefined, position: "relative" } } }),
  Columns: (p) => ({ type: "Columns", canvas: true, zones: Array.from({ length: p.columns ?? 2 }, (_, i) => `col-${i}`), props: { style: { display: "flex", flexDirection: "row", gap: p.gap ?? "16px", width: "100%", position: "relative" } } }),
  // Form fields
  ShortText: (p) => ({ type: "Input", props: { label: p.label ?? "Short answer", name: p.name ?? "short_text", placeholder: p.placeholder ?? "", required: !!p.required, style: { marginBottom: "16px", width: "100%", display: "block" } } }),
  EmailField: (p) => ({ type: "EmailField", props: { label: p.label ?? "Email", name: p.name ?? "email", placeholder: p.placeholder ?? "", required: !!p.required, style: { marginBottom: "16px", width: "100%", display: "block" } } }),
  TextareaField: (p) => ({ type: "TextareaField", props: { label: p.label ?? "Long answer", name: p.name ?? "long_text", placeholder: p.placeholder ?? "", required: !!p.required, style: { marginBottom: "16px", width: "100%", display: "block" } } }),
  SelectField: (p) => ({ type: "SelectField", props: { label: p.label ?? "Select", name: p.name ?? "select", required: !!p.required, options: p.options ?? [{ label: "Option 1" }], style: { marginBottom: "16px", width: "100%", display: "block" } } }),
  CheckboxField: (p) => ({ type: "CheckboxField", props: { label: p.label ?? "I agree", name: p.name ?? "agree", style: { marginBottom: "16px", display: "flex" } } }),
  // Live sections (heading, optional limit)
  ExecomGrid: (p) => ({ type: "ExecomGrid", props: { heading: p.heading ?? "Our Team", style: {} } }),
  EventsList: (p) => ({ type: "EventsList", props: { heading: p.heading ?? "Upcoming Events", limit: p.limit ?? 6, style: {} } }),
  NewsFeed: (p) => ({ type: "NewsFeed", props: { heading: p.heading ?? "Latest News", limit: p.limit ?? 6, style: {} } }),
  Pillars: (p) => ({ type: "Pillars", props: { heading: p.heading ?? "Our Pillars", style: {} } }),
  Goals: (p) => ({ type: "Goals", props: { heading: p.heading ?? "Strategic Goals", style: {} } }),
  Timeline: (p) => ({ type: "Timeline", props: { heading: p.heading ?? "Our Story", style: {} } }),
  FaqLive: (p) => ({ type: "FaqLive", props: { heading: p.heading ?? "FAQ", style: {} } }),
  PerksLive: (p) => ({ type: "PerksLive", props: { heading: p.heading ?? "Member Perks", style: {} } }),
  GalleryLive: (p) => ({ type: "GalleryLive", props: { heading: p.heading ?? "Gallery", style: {} } }),
  StatsLive: (p) => ({ type: "StatsLive", props: { heading: p.heading ?? "By the Numbers", style: {} } }),
};

function addNode(item, parentId, out, zones, unknown) {
  const factory = MAP[item.type];
  if (!factory) { unknown.add(item.type); return null; }
  const mapped = factory(item.props ?? {});
  const id = genId();
  out[id] = {
    type: { resolvedName: mapped.type },
    isCanvas: !!mapped.canvas,
    props: mapped.props ?? {},
    displayName: mapped.type,
    custom: {},
    parent: parentId,
    hidden: false,
    nodes: [],
    linkedNodes: {},
  };
  const itemId = item.props?.id;
  if (mapped.canvas && itemId) {
    for (const zn of mapped.zones ?? ["content"]) {
      for (const child of zones[`${itemId}:${zn}`] ?? []) {
        const cid = addNode(child, id, out, zones, unknown);
        if (cid) out[id].nodes.push(cid);
      }
    }
  }
  return id;
}

function convert(layout, unknown) {
  const zones = layout.zones ?? {};
  const out = {
    ROOT: { type: { resolvedName: "Container" }, isCanvas: true, props: { style: { ...rootStyle } }, displayName: "Container", custom: {}, parent: null, hidden: false, nodes: [], linkedNodes: {} },
  };
  for (const item of layout.content ?? []) {
    const cid = addNode(item, "ROOT", out, zones, unknown);
    if (cid) out.ROOT.nodes.push(cid);
  }
  return out;
}

const TABLES = ["events", "posts", "pages", "forms"];
const unknown = new Set();
let converted = 0, skipped = 0;

for (const table of TABLES) {
  const { data, error } = await sb.from(table).select("id, layout, nexus_data");
  if (error) { console.error(`[${table}] ${error.message}`); continue; }
  for (const row of data ?? []) {
    if (row.nexus_data) { skipped++; continue; }
    const layout = row.layout;
    if (!layout || !Array.isArray(layout.content) || layout.content.length === 0) { skipped++; continue; }
    const tree = convert(layout, unknown);
    const nodeCount = Object.keys(tree).length;
    if (!APPLY) { console.log(`[dry] ${table}/${row.id} → ${nodeCount} nodes`); converted++; continue; }
    const { error: upErr } = await sb.from(table).update({ nexus_data: tree }).eq("id", row.id);
    if (upErr) console.error(`[${table}/${row.id}] ${upErr.message}`);
    else { console.log(`[ok] ${table}/${row.id} → ${nodeCount} nodes`); converted++; }
  }
}

console.log(`\n${APPLY ? "Applied" : "Would convert"}: ${converted}. Skipped (already migrated / empty): ${skipped}.`);
if (unknown.size) console.log(`Unmapped Puck components (left out — rebuild manually): ${[...unknown].join(", ")}`);
if (!APPLY) console.log("Dry run — re-run with --apply to write nexus_data.");
