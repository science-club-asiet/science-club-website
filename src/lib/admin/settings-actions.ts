"use server";

import { requireAdmin } from "./auth";
import { revalidatePath } from "next/cache";

export async function saveSiteContent(payload: Record<string, unknown>) {
  const { supabase } = await requireAdmin();

  for (const [key, value] of Object.entries(payload)) {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      throw new Error(`Failed to save ${key}: ` + error.message);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function updateUserRole(userId: string, newRole: "owner" | "admin" | "execom" | "member") {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    throw new Error("Failed to update user role: " + error.message);
  }

  revalidatePath("/admin/settings");
}

export async function toggleUserMembership(userId: string, isMember: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ is_member: isMember })
    .eq("id", userId);

  if (error) {
    throw new Error("Failed to update membership status: " + error.message);
  }

  revalidatePath("/admin/settings");
}
