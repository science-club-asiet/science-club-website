// Config-driven admin CRUD. Each resource maps a DB table to a set of form
// fields; the generic list/form pages + server actions render and persist them.
// Only tables with a uuid `id` PK belong here.

export type FieldType =
  | "text" | "textarea" | "richtext" | "number" | "boolean"
  | "select" | "image" | "date" | "tags" | "json";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  help?: string;
};

export type Resource = {
  key: string;
  label: string;
  table: string;
  titleField: string;
  statusField?: string; // is_published (bool) or status (text) for the list badge
  orderBy?: { column: string; ascending?: boolean };
  revalidate: string[]; // public paths to refresh after a write
  fields: Field[];
};

const PUBLISHED: Field = { name: "is_published", label: "Published", type: "boolean" };
const SORT: Field = { name: "sort_order", label: "Sort order", type: "number" };

export const RESOURCES: Record<string, Resource> = {
  events: {
    key: "events", label: "Events", table: "events", titleField: "title",
    statusField: "is_published", orderBy: { column: "event_date", ascending: false },
    revalidate: ["/", "/events"],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "URL-safe id, e.g. ai-summit-26" },
      { name: "category", label: "Category", type: "select", options: ["talk", "workshop", "game", "trip"] },
      { name: "event_date", label: "Date & time", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "speaker", label: "Speaker", type: "text" },
      { name: "speaker_role", label: "Speaker role", type: "text" },
      { name: "member_price", label: "Member price (₹)", type: "number" },
      { name: "non_member_price", label: "Non-member price (₹)", type: "number" },
      { name: "seats_remaining", label: "Seats remaining", type: "number" },
      { name: "cover_image_url", label: "Cover image URL", type: "image" },
      { name: "registration_code", label: "Registration code", type: "text" },
      { name: "prerequisites", label: "Prerequisites (one per line)", type: "tags" },
      { name: "agenda", label: "Agenda (JSON: [{time,title,description}])", type: "json" },
      PUBLISHED,
    ],
  },
  posts: {
    key: "posts", label: "Posts", table: "posts", titleField: "title",
    statusField: "status", orderBy: { column: "published_at", ascending: false },
    revalidate: ["/"],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      { name: "type", label: "Type", type: "select", options: ["news", "article", "paper", "blog", "announcement"] },
      { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      { name: "tag", label: "Tag", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body (markdown)", type: "richtext" },
      { name: "cover_image_url", label: "Cover image URL", type: "image" },
      { name: "published_at", label: "Published at", type: "date" },
      { name: "breaking", label: "Breaking", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "meta", label: "Meta (JSON: paper→{pdf_url,doi})", type: "json" },
      SORT,
    ],
  },
  execom_members: {
    key: "execom_members", label: "Execom", table: "execom_members", titleField: "name",
    statusField: "is_published", orderBy: { column: "display_order", ascending: true },
    revalidate: ["/", "/info/execom"],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "position", label: "Position", type: "text" },
      { name: "role_type", label: "Role type", type: "select", options: ["student", "faculty_advisor"] },
      { name: "team_slug", label: "Team", type: "select", options: ["core", "tech", "media", "events"] },
      { name: "term", label: "Term", type: "text", help: "e.g. 2025-26" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photo_url", label: "Photo URL", type: "image" },
      { name: "email", label: "Email", type: "text" },
      { name: "linkedin", label: "LinkedIn URL", type: "text" },
      { name: "display_order", label: "Display order", type: "number" },
      PUBLISHED,
    ],
  },
  pillars: {
    key: "pillars", label: "Mission · Pillars", table: "pillars", titleField: "title",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/mission"],
    fields: [
      { name: "num", label: "Number", type: "text" },
      { name: "icon", label: "Icon (Compass, Hammer, Unlock, Users2, Rocket)", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "short", label: "Short", type: "textarea" },
      { name: "detail", label: "Detail", type: "textarea" },
      { name: "image", label: "Image URL", type: "image" },
      { name: "tag", label: "Tag", type: "text" },
      SORT, PUBLISHED,
    ],
  },
  goals: {
    key: "goals", label: "Mission · Goals", table: "goals", titleField: "title",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/mission"],
    fields: [
      { name: "target_year", label: "Target year", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "status", label: "Status", type: "text" },
      { name: "progress", label: "Progress (0-100)", type: "number" },
      { name: "category", label: "Category", type: "text" },
      { name: "image", label: "Image URL", type: "image" },
      SORT, PUBLISHED,
    ],
  },
  impact_stories: {
    key: "impact_stories", label: "Mission · Stories", table: "impact_stories", titleField: "author",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/mission"],
    fields: [
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "author", label: "Author", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "tag", label: "Tag", type: "text" },
      { name: "image", label: "Image URL", type: "image" },
      SORT, PUBLISHED,
    ],
  },
  story_eras: {
    key: "story_eras", label: "About · Timeline", table: "story_eras", titleField: "title",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/about"],
    fields: [
      { name: "year", label: "Year", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description (HTML allowed)", type: "textarea" },
      { name: "img", label: "Image URL", type: "image" },
      SORT, PUBLISHED,
    ],
  },
  perks: {
    key: "perks", label: "Join · Perks", table: "perks", titleField: "text",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/join"],
    fields: [
      { name: "text", label: "Perk", type: "text" },
      SORT, PUBLISHED,
    ],
  },
  faqs: {
    key: "faqs", label: "Join · FAQs", table: "faqs", titleField: "question",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/join"],
    fields: [
      { name: "question", label: "Question", type: "text" },
      { name: "answer", label: "Answer", type: "textarea" },
      SORT, PUBLISHED,
    ],
  },
  achievements: {
    key: "achievements", label: "Execom · Achievements", table: "achievements", titleField: "title",
    statusField: "is_published", orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/info/execom"],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "icon", label: "Icon (Trophy, Award, Cpu, GraduationCap, Globe)", type: "text" },
      SORT, PUBLISHED,
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

/**
 * The column to write when drag-reordering a resource's list — but only when
 * the list is actually ordered by it (so date-ordered resources like events/
 * posts don't get a meaningless reorder handle).
 */
export function reorderSortField(res: Resource): string | null {
  const sf = res.fields.find((x) => x.name === "sort_order" || x.name === "display_order")?.name;
  return sf && res.orderBy?.column === sf ? sf : null;
}

/** Read + coerce one field's value out of submitted FormData. Throws on bad JSON. */
export function coerceField(f: Field, fd: FormData): unknown {
  const raw = fd.get(f.name);
  const str = raw == null ? "" : String(raw).trim();
  switch (f.type) {
    case "boolean":
      return raw === "on" || raw === "true";
    case "number":
      return str === "" ? null : Number(str);
    case "date":
      return str === "" ? null : new Date(str).toISOString();
    case "tags":
      return str === "" ? [] : str.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    case "json":
      if (str === "") return f.name === "meta" ? {} : [];
      return JSON.parse(str); // throws → caught by the action
    default:
      return str === "" ? null : str;
  }
}
