// Editors for non-row content: site_content singletons (jsonb) and the `teams`
// table (slug PK) — neither fits the id-based generic CRUD engine.

export type EditorFieldType = "text" | "textarea" | "json" | "number" | "select" | "boolean" | "date" | "datetime";
export type EditorField = { name: string; label: string; type: EditorFieldType; help?: string; options?: string[] };

export type SingletonDef = { key: string; label: string; revalidate: string[]; fields: EditorField[] };

// json fields that should default to an array (vs object) when left blank.
export const JSON_ARRAY_FIELDS = new Set(["stats", "columns"]);

export const SINGLETONS: SingletonDef[] = [
  { key: "hero", label: "Hero", revalidate: ["/"], fields: [
    { name: "badge", label: "Badge", type: "text" },
    { name: "title", label: "Title", type: "text" },
  ] },
  { key: "marquee", label: "Marquee", revalidate: ["/"], fields: [
    { name: "text", label: "Text", type: "text" },
  ] },
  { key: "about_stats", label: "About stats", revalidate: ["/", "/info/about"], fields: [
    { name: "stats", label: "Stats", type: "json", help: "[{\"value\":\"240+\",\"label\":\"Active Members\"}]" },
  ] },
  { key: "contact", label: "Contact", revalidate: ["/"], fields: [
    { name: "email", label: "Email", type: "text" },
    { name: "blurb", label: "Blurb", type: "textarea" },
    { name: "socials", label: "Socials", type: "json", help: "{\"github\":\"…\",\"linkedin\":\"…\",\"instagram\":\"…\"}" },
  ] },
  { key: "location", label: "Location", revalidate: ["/"], fields: [
    { name: "address", label: "Address", type: "text" },
    { name: "hours", label: "Hours", type: "textarea" },
    { name: "maps_url", label: "Directions URL", type: "text" },
    { name: "embed_url", label: "Map embed URL", type: "text" },
  ] },
  { key: "footer", label: "Footer", revalidate: ["/"], fields: [
    { name: "columns", label: "Columns", type: "json", help: "[{\"heading\":\"…\",\"links\":[\"…\"]}]" },
  ] },
  { key: "current_term", label: "Current term", revalidate: ["/", "/info/execom"], fields: [
    { name: "term", label: "Term", type: "text", help: "e.g. 2025-26 — controls which execom is 'current'" },
  ] },
];

export const TEAM_FIELDS: EditorField[] = [
  { name: "label", label: "Label", type: "text", help: "e.g. 01" },
  { name: "name", label: "Name", type: "text" },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sort_order", label: "Sort order", type: "number" },
];
