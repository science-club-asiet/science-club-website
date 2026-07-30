"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { UTApi } from "uploadthing/server";

export async function updateMediaAsset(id: string, payload: { alt?: string; folder?: string; tags?: string[] }) {
  const { supabase } = await requireAdmin();
  
  const { error } = await supabase
    .from("media_assets")
    .update(payload)
    .eq("id", id);
    
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function deleteMediaAsset(id: string) {
  const { supabase } = await requireAdmin();
  
  // 1. Get the URL
  const { data: asset, error: fetchErr } = await supabase
    .from("media_assets")
    .select("url")
    .eq("id", id)
    .single();
    
  if (fetchErr || !asset) throw new Error("Asset not found");

  // 2. Delete from UploadThing
  try {
    const key = asset.url.split("/f/")[1];
    if (key) {
      const utapi = new UTApi();
      await utapi.deleteFiles(key);
    }
  } catch (err) {
    console.error("Failed to delete from UploadThing:", err);
    // Proceed to delete DB record anyway to avoid orphaned DB rows if UT fails
  }

  // 3. Delete from DB
  const { error } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id);
    
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/media");
}

export async function getMediaAssets() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}
