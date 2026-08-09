"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

export type SaveState = { error?: string } | null;

/** Create or update a single execom member */
export async function saveExecomMember(
  id: string | null,
  term: string,
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const { supabase } = await requireAdmin();

  // Handle boolean checkboxes
  const is_published = formData.get("is_published") === "on";
  
  const payload = {
    name: formData.get("name") as string,
    position: formData.get("position") as string,
    role_type: formData.get("role_type") as string,
    team_slug: formData.get("team_slug") as string,
    term: term,
    bio: (formData.get("bio") as string) || null,
    photo_url: (formData.get("photo_url") as string) || null,
    email: (formData.get("email") as string) || null,
    linkedin: (formData.get("linkedin") as string) || null,
    is_published,
  };

  let error;
  if (id) {
    const { error: err } = await supabase.from("execom_members").update(payload).eq("id", id);
    error = err;
  } else {
    // Determine the next display order for the specific team/term combination
    const { data: existing } = await supabase
      .from("execom_members")
      .select("display_order")
      .eq("term", term)
      .eq("team_slug", payload.team_slug)
      .order("display_order", { ascending: false })
      .limit(1);
    
    const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;

    const { error: err } = await supabase.from("execom_members").insert({
      ...payload,
      display_order: nextOrder,
    });
    error = err;
  }

  if (error) {
    console.error("[saveExecomMember] Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/execom");
  revalidatePath("/");
  revalidatePath("/info/execom");
  return null;
}

export async function deleteExecomMember(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("execom_members").delete().eq("id", id);
  if (error) {
    console.error("[deleteExecomMember]", error.message);
    throw new Error(error.message);
  }
  revalidatePath("/admin/execom");
  revalidatePath("/");
  revalidatePath("/info/execom");
}

export async function reorderExecomMembers(updates: { id: string; order: number }[]) {
  if (updates.length === 0) return;
  const { supabase } = await requireAdmin();

  const { error } = await supabase.rpc("reorder_execom_members", {
    updates: updates.map((u) => ({ id: u.id, sort_order: u.order })),
  });

  if (error) {
    // RPC fallback if `reorder_execom_members` doesn't exist
    for (const { id, order } of updates) {
      await supabase.from("execom_members").update({ display_order: order }).eq("id", id);
    }
  }

  revalidatePath("/admin/execom");
  revalidatePath("/");
  revalidatePath("/info/execom");
}

export async function duplicateTerm(oldTerm: string, newTerm: string) {
  const { supabase } = await requireAdmin();

  // 1. Fetch old term members
  const { data: oldMembers, error: fetchErr } = await supabase
    .from("execom_members")
    .select("*")
    .eq("term", oldTerm);

  if (fetchErr) {
    console.error("[duplicateTerm] fetch error", fetchErr.message);
    throw new Error(fetchErr.message);
  }
  if (!oldMembers || oldMembers.length === 0) {
    throw new Error("No members found in the old term.");
  }

  // 2. Prepare new payload (strip id, change term, set is_published=false)
  const newMembers = oldMembers.map((m) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, ...rest } = m;
    return {
      ...rest,
      term: newTerm,
      is_published: false,
    };
  });

  // 3. Insert
  const { error: insertErr } = await supabase.from("execom_members").insert(newMembers);
  if (insertErr) {
    console.error("[duplicateTerm] insert error", insertErr.message);
    throw new Error(insertErr.message);
  }

  revalidatePath("/admin/execom");
  // Don't revalidate public routes as it's a draft term
}

export async function publishTerm(term: string) {
  const { supabase } = await requireAdmin();

  // 1. Update site_content current_term
  const { error: siteErr } = await supabase
    .from("site_content")
    .update({ value: { term } })
    .eq("key", "current_term");
  if (siteErr) {
    console.error("[publishTerm] site_content error", siteErr.message);
    throw new Error(siteErr.message);
  }

  // 2. Publish all members in the new term
  const { error: pubErr } = await supabase
    .from("execom_members")
    .update({ is_published: true })
    .eq("term", term);
  if (pubErr) {
    console.error("[publishTerm] publish error", pubErr.message);
    throw new Error(pubErr.message);
  }

  revalidatePath("/admin/execom");
  revalidatePath("/");
  revalidatePath("/info/execom");
}

// ─── Category (Teams) CRUD ───────────────────────────────────────────────────

export async function saveCategory(slug: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const sort_order = Number(formData.get("sort_order") || 0);
  const newSlug = (formData.get("slug") as string)?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  if (!name || !label) {
    throw new Error("Name and Label are required.");
  }

  const payload = { name, label, tagline, description, sort_order, slug: newSlug };

  if (slug) {
    const { error } = await supabase.from("teams").update(payload).eq("slug", slug);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("teams").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/execom");
  revalidatePath("/admin/teams");
  revalidatePath("/");
  revalidatePath("/info/execom");
}

export async function deleteCategory(slug: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("teams").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/execom");
  revalidatePath("/admin/teams");
  revalidatePath("/");
  revalidatePath("/info/execom");
}

// ─── Terms CRUD ─────────────────────────────────────────────────────────────

export async function saveTerm(id: string | null, name: string) {
  const { supabase } = await requireAdmin();
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Term name is required.");

  if (id) {
    const { error } = await supabase.from("terms").update({ name: cleanName }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("terms").insert({ name: cleanName });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/execom");
}

export async function deleteTerm(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/execom");
}
