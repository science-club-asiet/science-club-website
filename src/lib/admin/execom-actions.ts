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
