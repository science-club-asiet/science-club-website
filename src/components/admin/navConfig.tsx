import {
  Home, Calendar, Newspaper, ClipboardList, Users, Landmark,
  Inbox, Image as ImageIcon, Globe, Settings, Files, Database, type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Grouped sidebar IA (Organization OS layout). */
export const NAV_SECTIONS: NavItem[][] = [
  [{ label: "Home", href: "/admin", icon: Home }],
  [
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Posts", href: "/admin/posts", icon: Newspaper },
    { label: "Forms", href: "/admin/forms", icon: ClipboardList },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Pages", href: "/admin/pages", icon: Files },
    { label: "CMS", href: "/admin/cms", icon: Database },
  ],
  [
    { label: "Executive Committee", href: "/admin/execom", icon: Landmark },
    { label: "Applications", href: "/admin/applications", icon: Inbox },
    { label: "Media", href: "/admin/media", icon: ImageIcon },
  ],
  [{ label: "Website", href: "/admin/website", icon: Globe }],
  [{ label: "Settings", href: "/admin/settings", icon: Settings }],
];

/** Quick-create targets, surfaced in the sidebar Create button + ⌘K palette. */
export const CREATE_ITEMS: { label: string; href: string }[] = [
  { label: "Event", href: "/admin/events/new" },
  { label: "News / Post", href: "/admin/posts/new" },
  { label: "Form", href: "/admin/forms/new" },
  { label: "Execom member", href: "/admin/execom" },
  { label: "Achievement", href: "/admin/achievements/new" },
  { label: "Page", href: "/admin/pages" },
  { label: "Collection", href: "/admin/cms/new" },
];
