import { requireAdmin } from "@/lib/admin/auth";
import { EventsWorkspaceClient } from "@/components/admin/events/EventsWorkspaceClient";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();

  // Parallelize data fetching for events, categories, terms, and forms
  const [eventsRes, { data: categories }, { data: termsData }, { data: forms }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("event_categories")
      .select("id, name, slug, tagline, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("terms")
      .select("name")
      .order("sort_order", { ascending: true }),
    supabase
      .from("forms")
      .select("id, title, slug, is_active")
      .order("title", { ascending: true }),
  ]);

  if (eventsRes.error) {
    console.error("[AdminEventsPage] Error fetching events:", eventsRes.error.message);
  }

  const events = eventsRes.data ?? [];

  const termsList = termsData && termsData.length > 0 ? termsData.map((t) => t.name) : ["2025-26", "2024-25", "2023-24", "2022-23"];

  const fallbackCategories = [
    { name: "Talk & Seminar", slug: "talk", tagline: "Expert keynotes, tech talks, and guest lectures", sort_order: 1 },
    { name: "Hands-on Workshop", slug: "workshop", tagline: "Interactive technical building sessions", sort_order: 2 },
    { name: "Gaming & Hackathon", slug: "game", tagline: "Competitions, LAN parties, and hackathons", sort_order: 3 },
    { name: "Field Trip & Visit", slug: "trip", tagline: "Industrial visits and outdoor tech excursions", sort_order: 4 },
  ];

  return (
    <EventsWorkspaceClient
      events={events ?? []}
      categories={categories && categories.length > 0 ? categories : fallbackCategories}
      terms={termsList}
      forms={forms ?? []}
    />
  );
}
