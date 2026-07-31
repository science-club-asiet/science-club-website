"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { createPublicClient } from "@/lib/supabase/public";
import type { FieldType } from "./resources";

// ── Types ────────────────────────────────────────────────────────────────────
export type Collection = {
  id: string;
  name: string;
  slug: string;
  singular: string | null;
  plural: string | null;
};
export type CollectionField = {
  id?: string;
  collection_id?: string;
  name: string;
  label: string;
  type: FieldType;
  options: string[] | null;
  required: boolean;
  sort_order: number;
};
export type CollectionItem = {
  id: string;
  collection_id: string;
  slug: string | null;
  data: Record<string, unknown>;
  is_published: boolean;
  sort_order: number;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── Collections ──────────────────────────────────────────────────────────────
export async function getCollections(): Promise<Collection[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("collections").select("*").order("created_at");
  return (data as Collection[]) ?? [];
}

export async function getCollectionBySlug(slug: string) {
  const { supabase } = await requireAdmin();
  const { data: collection } = await supabase.from("collections").select("*").eq("slug", slug).maybeSingle();
  if (!collection) return null;
  const { data: fields } = await supabase
    .from("collection_fields").select("*").eq("collection_id", collection.id).order("sort_order");
  return { collection: collection as Collection, fields: (fields as CollectionField[]) ?? [] };
}

export async function createCollection(input: {
  name: string; slug?: string; singular?: string; plural?: string; fields: CollectionField[];
}): Promise<{ error?: string; slug?: string }> {
  const { supabase } = await requireAdmin();
  const slug = slugify(input.slug || input.name);
  if (!slug) return { error: "Name is required" };

  const { data: coll, error } = await supabase
    .from("collections")
    .insert({ name: input.name, slug, singular: input.singular || input.name, plural: input.plural || input.name })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (input.fields.length) {
    const rows = input.fields.map((f, i) => ({
      collection_id: coll.id, name: slugify(f.name || f.label), label: f.label,
      type: f.type, options: f.options?.length ? f.options : null, required: !!f.required, sort_order: i,
    }));
    const { error: fe } = await supabase.from("collection_fields").insert(rows);
    if (fe) return { error: fe.message };
  }
  revalidatePath("/admin/cms");
  return { slug };
}

/** Replace a collection's field definitions (add/remove/reorder). */
export async function saveCollectionFields(collectionId: string, fields: CollectionField[]): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  await supabase.from("collection_fields").delete().eq("collection_id", collectionId);
  if (fields.length) {
    const rows = fields.map((f, i) => ({
      collection_id: collectionId, name: slugify(f.name || f.label), label: f.label,
      type: f.type, options: f.options?.length ? f.options : null, required: !!f.required, sort_order: i,
    }));
    const { error } = await supabase.from("collection_fields").insert(rows);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/cms");
  return {};
}

export async function deleteCollection(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("collections").delete().eq("id", id);
  revalidatePath("/admin/cms");
}

// ── Items ────────────────────────────────────────────────────────────────────
export async function getItems(collectionId: string): Promise<CollectionItem[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("collection_items").select("*").eq("collection_id", collectionId)
    .order("sort_order").order("created_at", { ascending: false });
  return (data as CollectionItem[]) ?? [];
}

export async function getItem(id: string): Promise<CollectionItem | null> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("collection_items").select("*").eq("id", id).maybeSingle();
  return (data as CollectionItem) ?? null;
}

export async function saveItem(input: {
  id?: string; collectionId: string; slug?: string; data: Record<string, unknown>; isPublished: boolean;
}): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const slug = input.slug ? slugify(input.slug) : slugify(String(input.data.title ?? input.data.name ?? "")) || null;
  const row = { collection_id: input.collectionId, slug, data: input.data, is_published: input.isPublished };
  const { error } = input.id
    ? await supabase.from("collection_items").update(row).eq("id", input.id)
    : await supabase.from("collection_items").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms");
  return {};
}

export async function deleteItem(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("collection_items").delete().eq("id", id);
  revalidatePath("/admin/cms");
}

// ── Public (for the builder Collection List + collection pages) ───────────────
export async function getPublishedItems(
  collectionSlug: string,
  opts?: { limit?: number; sort?: "newest" | "oldest" | "custom" }
): Promise<{ fields: CollectionField[]; items: CollectionItem[] }> {
  const sb = createPublicClient();
  const { data: collection } = await sb.from("collections").select("id").eq("slug", collectionSlug).maybeSingle();
  if (!collection) return { fields: [], items: [] };
  const { data: fields } = await sb.from("collection_fields").select("*").eq("collection_id", collection.id).order("sort_order");

  let q = sb.from("collection_items").select("*").eq("collection_id", collection.id).eq("is_published", true);
  if (opts?.sort === "oldest") q = q.order("created_at", { ascending: true });
  else if (opts?.sort === "custom") q = q.order("sort_order", { ascending: true });
  else q = q.order("created_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);

  const { data: items } = await q;
  return { fields: (fields as CollectionField[]) ?? [], items: (items as CollectionItem[]) ?? [] };
}

export async function getPublishedItem(collectionSlug: string, itemSlug: string) {
  const sb = createPublicClient();
  const { data: collection } = await sb.from("collections").select("*").eq("slug", collectionSlug).maybeSingle();
  if (!collection) return null;
  const { data: fields } = await sb.from("collection_fields").select("*").eq("collection_id", collection.id).order("sort_order");
  const { data: item } = await sb
    .from("collection_items").select("*")
    .eq("collection_id", collection.id).eq("slug", itemSlug).eq("is_published", true).maybeSingle();
  if (!item) return null;
  return { collection, fields: (fields as CollectionField[]) ?? [], item: item as CollectionItem };
}
