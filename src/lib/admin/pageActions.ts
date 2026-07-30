"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export async function createPage(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "Untitled page";
  const baseSlug = String(formData.get("slug") ?? "").trim() || slugify(title);
  let slug = baseSlug;
  let inserted = await supabase.from("pages").insert({ title, slug, created_by: user!.id }).select("id").single();
  if (inserted.error?.code === "23505") {
    slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    inserted = await supabase.from("pages").insert({ title, slug, created_by: user!.id }).select("id").single();
  }
  if (inserted.error) throw new Error(inserted.error.message);
  revalidatePath("/admin/pages");
  redirect(`/admin/pagebuilder/page/${inserted.data.id}`);
}

export async function deletePage(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("pages").delete().eq("id", id);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function setPagePublished(id: string, next: boolean): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("pages").update({ is_published: next }).eq("id", id);
  revalidatePath("/admin/pages");
}
