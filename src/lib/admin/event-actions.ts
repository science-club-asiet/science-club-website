"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

export interface CategoryFieldDef {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "date" | "winners" | "prerequisites";
  placeholder?: string;
  required?: boolean;
  hidden?: boolean;
  visible_statuses?: ("open" | "closed" | "finished" | "draft")[];
  order?: number;
}

export type EventCategoryItem = {
  id?: string;
  name: string;
  slug: string;
  tagline?: string | null;
  sort_order?: number;
  field_schema?: CategoryFieldDef[];
};

export async function saveEvent(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string || "").trim();
  const slug = (formData.get("slug") as string || "").trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const term = (formData.get("term") as string || "2025-26").trim();
  const category = (formData.get("category") as string || "talk").trim();
  const description = (formData.get("description") as string || "").trim();
  const event_date = formData.get("event_date") as string || null;
  const location = (formData.get("location") as string || "").trim();
  const speaker = (formData.get("speaker") as string || "").trim();
  const speaker_role = (formData.get("speaker_role") as string || "").trim();
  const has_pricing = formData.get("has_pricing") === "true";
  const member_price = has_pricing ? parseFloat((formData.get("member_price") as string) || "0") : null;
  const non_member_price = has_pricing ? parseFloat((formData.get("non_member_price") as string) || "0") : null;
  const seats_remaining = formData.get("seats_remaining") ? parseInt(formData.get("seats_remaining") as string, 10) : null;
  const cover_image_url = (formData.get("cover_image_url") as string || "").trim();
  const is_published = formData.get("is_published") === "on" || formData.get("is_published") === "true";
  const rawStatus = (formData.get("status") as string || "").trim();
  const status = rawStatus || (is_published ? "open" : "draft");
  const registration_form_id = (formData.get("registration_form_id") as string || "").trim() || null;
  const external_website_url = (formData.get("external_website_url") as string || "").trim() || null;
  const requires_registration = formData.get("requires_registration") !== "false";

  let gallery_images: string[] = [];
  const rawGallery = formData.get("gallery_images_json") as string || null;
  if (rawGallery) {
    try {
      gallery_images = JSON.parse(rawGallery);
    } catch {
      gallery_images = [];
    }
  }

  let winners = [];
  const rawWinners = formData.get("winners_json") as string || null;
  if (rawWinners) {
    try {
      winners = JSON.parse(rawWinners);
    } catch {
      winners = [];
    }
  }

  let custom_metadata: Record<string, string> = {};
  const rawMetadata = formData.get("custom_metadata_json") as string || null;
  if (rawMetadata) {
    try {
      custom_metadata = JSON.parse(rawMetadata);
    } catch {
      custom_metadata = {};
    }
  }

  const payload = {
    title,
    slug,
    term,
    category,
    description,
    event_date: event_date ? new Date(event_date).toISOString() : null,
    location,
    speaker,
    speaker_role,
    member_price,
    non_member_price,
    seats_remaining,
    cover_image_url,
    is_published: status !== "draft",
    status,
    registration_form_id,
    external_website_url,
    requires_registration,
    has_pricing,
    winners,
    custom_metadata,
    gallery_images,
    created_by: user.id,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    const res = await supabase.from("events").update(payload).eq("id", id);
    error = res.error;
  } else {
    const res = await supabase.from("events").insert(payload);
    error = res.error;
  }

  if (error) throw new Error("Failed to save event: " + error.message);

  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error("Failed to delete event: " + error.message);
  revalidatePath("/admin/events");
}

export async function saveEventCategory(cat: EventCategoryItem) {
  const { supabase } = await requireAdmin();
  const slug = cat.slug.trim() || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const payload = {
    name: cat.name.trim(),
    slug,
    tagline: cat.tagline?.trim() || null,
    sort_order: cat.sort_order ?? 0,
    field_schema: cat.field_schema || [],
    updated_at: new Date().toISOString(),
  };

  let error;
  if (cat.id) {
    const res = await supabase.from("event_categories").update(payload).eq("id", cat.id);
    error = res.error;
  } else {
    const res = await supabase.from("event_categories").upsert(payload, { onConflict: "slug" });
    error = res.error;
  }

  if (error) throw new Error("Failed to save event category: " + error.message);
  revalidatePath("/admin/events");
}

export async function deleteEventCategory(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("event_categories").delete().eq("id", id);
  if (error) throw new Error("Failed to delete category: " + error.message);
  revalidatePath("/admin/events");
}

export async function reorderEventsAction(orderedIds: string[]) {
  if (!orderedIds || orderedIds.length === 0) return;
  const { supabase } = await requireAdmin();

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    await supabase.from("events").update({ display_order: i, sort_order: i }).eq("id", id);
  }

  await supabase.from("site_content").upsert({
    key: "event_order",
    value: orderedIds,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
