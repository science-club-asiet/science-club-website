"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

export type PostCategoryItem = {
  id?: string;
  name: string;
  slug: string;
  tagline?: string | null;
  sort_order?: number;
};

export async function savePost(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string || "").trim();
  const slug = (formData.get("slug") as string || "").trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const term = (formData.get("term") as string || "2025-26").trim();
  const type = (formData.get("type") as string || "news").trim();
  const status = (formData.get("status") as string || "draft").trim();
  const excerpt = (formData.get("excerpt") as string || "").trim();
  const body = (formData.get("body") as string || "").trim();
  const cover_image_url = (formData.get("cover_image_url") as string || "").trim();
  const tag = (formData.get("tag") as string || "").trim();
  const is_featured = formData.get("is_featured") === "on" || formData.get("is_featured") === "true";
  const breaking = formData.get("breaking") === "on" || formData.get("breaking") === "true";

  const payload = {
    title,
    slug,
    term,
    type,
    status,
    excerpt,
    body,
    cover_image_url,
    tag,
    is_featured,
    breaking,
    created_by: user.id,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    const res = await supabase.from("posts").update(payload).eq("id", id);
    error = res.error;
  } else {
    const res = await supabase.from("posts").insert(payload);
    error = res.error;
  }

  if (error) throw new Error("Failed to save post: " + error.message);

  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function deletePost(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error("Failed to delete post: " + error.message);
  revalidatePath("/admin/posts");
}

export async function savePostCategory(cat: PostCategoryItem) {
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
    const res = await supabase.from("post_categories").update(payload).eq("id", cat.id);
    error = res.error;
  } else {
    const res = await supabase.from("post_categories").upsert(payload, { onConflict: "slug" });
    error = res.error;
  }

  if (error) throw new Error("Failed to save post category: " + error.message);
  revalidatePath("/admin/posts");
}

export async function deletePostCategory(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("post_categories").delete().eq("id", id);
  if (error) throw new Error("Failed to delete category: " + error.message);
  revalidatePath("/admin/posts");
}
