"use server";

import { requireAdmin } from "./auth";
import { revalidatePath } from "next/cache";

export async function saveSiteContent(payload: Record<string, unknown>) {
  const { supabase } = await requireAdmin();

  for (const [key, value] of Object.entries(payload)) {
    // Upsert or update, since key is unique. 
    // In Supabase, if the row exists we update, else insert.
    // Assuming `site_content` table has unique `key`.
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value: { value } }, { onConflict: "key" });
      
    if (error) {
      throw new Error(`Failed to save ${key}: ` + error.message);
    }
  }

  revalidatePath("/", "layout");
}
