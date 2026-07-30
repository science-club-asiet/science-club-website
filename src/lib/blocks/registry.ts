import type { ComponentType } from "react";
import {
  LayoutTemplate, Type, Timer, CalendarClock, HelpCircle, Images, BarChart3, Megaphone,
  Users, Building, Map as MapIcon, Video as VideoIcon, FormInput, Minus, Code,
  type LucideIcon,
} from "lucide-react";
import type { InspectorField } from "./types";
import {
  HeroBlock, RichTextBlock, CountdownBlock, ScheduleBlock, FaqBlock, GalleryBlock, StatsBlock, CtaBlock,
  SpeakersBlock, SponsorsBlock, MapBlock, VideoBlock, FormEmbedBlock, SpacerBlock, HtmlBlock
} from "@/components/blocks/BlockComponents";

type BlockDef = {
  label: string;
  icon: LucideIcon;
  Component: ComponentType<{ props: Record<string, unknown> }>;
  defaultProps: Record<string, unknown>;
  fields: InspectorField[];
};

const COMMON_FIELDS: InspectorField[] = [
  { key: "bgColor", label: "Background Color", type: "text" },
  { key: "padding", label: "Padding (e.g. py-12)", type: "text" },
];
const COMMON_PROPS = { bgColor: "", padding: "py-12" };

export const BLOCK_REGISTRY: Record<string, BlockDef> = {
  hero: {
    label: "Hero", icon: LayoutTemplate, Component: HeroBlock,
    defaultProps: { ...COMMON_PROPS, badge: "Hands-on Workshop", title: "Robotics Workshop", subtitle: "Build. Automate. Innovate.", image: "", buttonText: "Register", buttonLink: "#register" },
    fields: [
      { key: "badge", label: "Badge", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "image", label: "Background image", type: "image" },
      { key: "buttonText", label: "Button text", type: "text" },
      { key: "buttonLink", label: "Button link", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  richText: {
    label: "Text", icon: Type, Component: RichTextBlock,
    defaultProps: { ...COMMON_PROPS, heading: "About", body: "Write something about this…" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      ...COMMON_FIELDS,
    ],
  },
  countdown: {
    label: "Countdown", icon: Timer, Component: CountdownBlock,
    defaultProps: { ...COMMON_PROPS, label: "Event starts in", targetDate: "" },
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "targetDate", label: "Target date", type: "date" },
      ...COMMON_FIELDS,
    ],
  },
  schedule: {
    label: "Schedule", icon: CalendarClock, Component: ScheduleBlock,
    defaultProps: { ...COMMON_PROPS, heading: "Schedule", items: [{ time: "10:00 AM", title: "Opening session", description: "" }] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "items", label: "Items", type: "list", itemLabel: "Session",
        itemFields: [
          { key: "time", label: "Time", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ], defaultItem: { time: "", title: "", description: "" } },
      ...COMMON_FIELDS,
    ],
  },
  faq: {
    label: "FAQ", icon: HelpCircle, Component: FaqBlock,
    defaultProps: { ...COMMON_PROPS, heading: "FAQ", items: [{ q: "Who can attend?", a: "Everyone." }] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "items", label: "Questions", type: "list", itemLabel: "Q&A",
        itemFields: [
          { key: "q", label: "Question", type: "text" },
          { key: "a", label: "Answer", type: "textarea" },
        ], defaultItem: { q: "", a: "" } },
      ...COMMON_FIELDS,
    ],
  },
  gallery: {
    label: "Gallery", icon: Images, Component: GalleryBlock,
    defaultProps: { ...COMMON_PROPS, heading: "Gallery", images: [] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "images", label: "Images", type: "list", itemLabel: "Image",
        itemFields: [
          { key: "url", label: "Image", type: "image" },
          { key: "caption", label: "Caption", type: "text" },
        ], defaultItem: { url: "", caption: "" } },
      ...COMMON_FIELDS,
    ],
  },
  stats: {
    label: "Stats", icon: BarChart3, Component: StatsBlock,
    defaultProps: { ...COMMON_PROPS, items: [{ value: "120", label: "Seats" }, { value: "6", label: "Hours" }] },
    fields: [
      { key: "items", label: "Stats", type: "list", itemLabel: "Stat",
        itemFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ], defaultItem: { value: "", label: "" } },
      ...COMMON_FIELDS,
    ],
  },
  cta: {
    label: "Call to action", icon: Megaphone, Component: CtaBlock,
    defaultProps: { ...COMMON_PROPS, heading: "Ready to join?", text: "", buttonText: "Register now", buttonLink: "#register" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
      { key: "buttonText", label: "Button text", type: "text" },
      { key: "buttonLink", label: "Button link", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  speakers: {
    label: "Speakers", icon: Users, Component: SpeakersBlock,
    defaultProps: { ...COMMON_PROPS, heading: "Speakers", items: [{ name: "Dr. Smith", role: "Keynote", photo: "" }] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "items", label: "Speakers", type: "list", itemLabel: "Speaker",
        itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "photo", label: "Photo URL", type: "image" },
        ], defaultItem: { name: "", role: "", photo: "" } },
      ...COMMON_FIELDS,
    ],
  },
  sponsors: {
    label: "Sponsors", icon: Building, Component: SponsorsBlock,
    defaultProps: { ...COMMON_PROPS, heading: "Sponsors", items: [{ name: "Acme Corp", url: "" }] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "items", label: "Sponsors", type: "list", itemLabel: "Sponsor",
        itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "url", label: "Logo URL", type: "image" },
        ], defaultItem: { name: "", url: "" } },
      ...COMMON_FIELDS,
    ],
  },
  map: {
    label: "Map", icon: MapIcon, Component: MapBlock,
    defaultProps: { ...COMMON_PROPS, embedUrl: "" },
    fields: [
      { key: "embedUrl", label: "Google Maps Embed URL", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  video: {
    label: "Video", icon: VideoIcon, Component: VideoBlock,
    defaultProps: { ...COMMON_PROPS, embedUrl: "" },
    fields: [
      { key: "embedUrl", label: "Video Embed URL (YouTube/Vimeo)", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  form: {
    label: "Form", icon: FormInput, Component: FormEmbedBlock,
    defaultProps: { ...COMMON_PROPS, formId: "" },
    fields: [
      { key: "formId", label: "Form ID or Slug", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  spacer: {
    label: "Spacer", icon: Minus, Component: SpacerBlock,
    defaultProps: { ...COMMON_PROPS, height: "h-16" },
    fields: [
      { key: "height", label: "Height (e.g. h-16, h-32)", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  html: {
    label: "Custom HTML", icon: Code, Component: HtmlBlock,
    defaultProps: { ...COMMON_PROPS, html: "<div>Your HTML here</div>" },
    fields: [
      { key: "html", label: "HTML", type: "textarea" },
      ...COMMON_FIELDS,
    ],
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);
