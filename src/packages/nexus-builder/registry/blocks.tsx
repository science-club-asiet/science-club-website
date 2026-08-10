import React from "react";
import {
  CalendarDays, Newspaper, Users, Columns3, Target, Clock, HelpCircle, Gift, Images, BarChart3,
} from "lucide-react";
import { ExecomGridBlock, EventsListBlock, NewsFeedBlock } from "@/components/blocks/DataBlocks";
import {
  PillarsSectionBlock, GoalsSectionBlock, TimelineSectionBlock, FaqSectionBlock,
  PerksSectionBlock, GallerySectionBlock, StatsSectionBlock,
} from "@/components/blocks/DataBlocks2";
import type { FieldSchema, RegistryEntry } from "./types";

const headingField: FieldSchema = { kind: "text", name: "heading", label: "Heading" };
const limitField: FieldSchema = { kind: "number", name: "limit", label: "Count", min: 1, max: 12 };

/** A live section that reads live data and takes a single `heading`. */
function headingBlock(
  type: string,
  label: string,
  icon: RegistryEntry["icon"],
  Block: React.FC<{ heading: string }>,
  defaultHeading: string
): RegistryEntry {
  return {
    type,
    label,
    icon,
    category: "sections",
    editorInert: true,
    render: ({ heading, style }: { heading?: string; style?: React.CSSProperties }) => (
      <div style={style}>
        <Block heading={heading || defaultHeading} />
      </div>
    ),
    defaultProps: { heading: defaultHeading, style: {} },
    settings: [headingField],
  };
}

export const blockEntries: RegistryEntry[] = [
  {
    type: "EventsList",
    label: "Events List",
    icon: CalendarDays,
    category: "sections",
    editorInert: true,
    render: ({ heading, limit, style }: { heading?: string; limit?: number; style?: React.CSSProperties }) => (
      <div style={style}>
        <EventsListBlock heading={heading || "Upcoming Events"} limit={limit ?? 6} />
      </div>
    ),
    defaultProps: { heading: "Upcoming Events", limit: 6, style: {} },
    settings: [headingField, limitField],
  },
  {
    type: "NewsFeed",
    label: "News Feed",
    icon: Newspaper,
    category: "sections",
    editorInert: true,
    render: ({ heading, limit, style }: { heading?: string; limit?: number; style?: React.CSSProperties }) => (
      <div style={style}>
        <NewsFeedBlock heading={heading || "Latest News"} limit={limit ?? 6} />
      </div>
    ),
    defaultProps: { heading: "Latest News", limit: 6, style: {} },
    settings: [headingField, limitField],
  },
  headingBlock("ExecomGrid", "Execom Grid", Users, ExecomGridBlock, "Our Team"),
  headingBlock("Pillars", "Pillars", Columns3, PillarsSectionBlock, "Our Pillars"),
  headingBlock("Goals", "Goals", Target, GoalsSectionBlock, "Strategic Goals"),
  headingBlock("Timeline", "Timeline", Clock, TimelineSectionBlock, "Our Story"),
  headingBlock("FaqLive", "FAQ", HelpCircle, FaqSectionBlock, "FAQ"),
  headingBlock("PerksLive", "Perks", Gift, PerksSectionBlock, "Member Perks"),
  headingBlock("GalleryLive", "Gallery", Images, GallerySectionBlock, "Gallery"),
  headingBlock("StatsLive", "Stats", BarChart3, StatsSectionBlock, "By the Numbers"),
];
