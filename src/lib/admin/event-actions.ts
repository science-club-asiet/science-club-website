"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

export type EventCategoryItem = {
  id?: string;
  name: string;
  slug: string;
  tagline?: string | null;
  sort_order?: number;
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
  const member_price = parseFloat((formData.get("member_price") as string) || "0");
  const non_member_price = parseFloat((formData.get("non_member_price") as string) || "0");
  const seats_remaining = formData.get("seats_remaining") ? parseInt(formData.get("seats_remaining") as string, 10) : null;
  const cover_image_url = (formData.get("cover_image_url") as string || "").trim();
  const is_published = formData.get("is_published") === "on" || formData.get("is_published") === "true";
  const rawStatus = (formData.get("status") as string || "").trim();
  const status = rawStatus || (is_published ? "open" : "draft");
  const registration_form_id = (formData.get("registration_form_id") as string || "").trim() || null;

  let gallery_images: string[] = [];
  const rawGallery = formData.get("gallery_images_json") as string || null;
  if (rawGallery) {
    try {
      gallery_images = JSON.parse(rawGallery);
    } catch {
      gallery_images = [];
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
