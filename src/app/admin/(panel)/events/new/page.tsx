import { requireAdmin } from "@/lib/admin/auth";
import { EventEditorClient } from "@/components/admin/events/EventEditorClient";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: termsData }] = await Promise.all([
    supabase.from("event_categories").select("id, name, slug, tagline, sort_order").order("sort_order", { ascending: true }),
    supabase.from("terms").select("name").order("sort_order", { ascending: true }),
  ]);

  const termsList = termsData && termsData.length > 0 ? termsData.map((t) => t.name) : ["2025-26", "2024-25", "2023-24", "2022-23"];

  const fallbackCategories = [
    { name: "Talk & Seminar", slug: "talk" },
    { name: "Hands-on Workshop", slug: "workshop" },
    { name: "Gaming & Hackathon", slug: "game" },
    { name: "Field Trip & Visit", slug: "trip" },
  ];

  return (
    <EventEditorClient
      categories={categories && categories.length > 0 ? categories : fallbackCategories}
      terms={termsList}
    />
  );
}
