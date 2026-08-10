import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { EventEditorClient } from "@/components/admin/events/EventEditorClient";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: event }, { data: categories }, { data: termsData }, { data: forms }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase.from("event_categories").select("id, name, slug, tagline, sort_order, field_schema").order("sort_order", { ascending: true }),
    supabase.from("terms").select("name").order("sort_order", { ascending: true }),
    supabase.from("forms").select("id, title, slug, is_active, is_template").eq("is_template", false).order("title", { ascending: true }),
  ]);

  if (!event) notFound();

  const termsList = termsData && termsData.length > 0 ? termsData.map((t) => t.name) : ["2025-26", "2024-25", "2023-24", "2022-23"];

  const fallbackCategories = [
    { name: "Talk & Seminar", slug: "talk" },
    { name: "Hands-on Workshop", slug: "workshop" },
    { name: "IRL Games & Quests", slug: "game" },
    { name: "Hackathon & Buildathon", slug: "hackathon" },
    { name: "Field Trip & Visit", slug: "trip" },
  ];

  return (
    <EventEditorClient
      initialData={event}
      categories={categories && categories.length > 0 ? categories : fallbackCategories}
      terms={termsList}
      forms={forms ?? []}
    />
  );
}
