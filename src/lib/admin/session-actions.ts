"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export async function setAdminTermCookie(term: string) {
  await requireAdmin();
  const c = await cookies();
  c.set("admin_term", term, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30 days
  revalidatePath("/admin", "layout");
}

export async function setSiteCurrentTerm(term: string) {
  const { supabase } = await requireAdmin();
  
  const { error } = await supabase
    .from("site_content")
    .update({ value: { term } })
    .eq("key", "current_term");
    
  if (error) {
    throw new Error("Failed to set current term: " + error.message);
  }
  
  // Update cookie as well so the admin is now in sync
  const c = await cookies();
  c.set("admin_term", term, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  
  // Revalidate both admin and public site
  revalidatePath("/", "layout");
}
