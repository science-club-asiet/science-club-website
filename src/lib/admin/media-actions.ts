"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { UTApi } from "uploadthing/server";

export async function updateMediaAsset(id: string, payload: { name?: string; alt?: string; folder?: string; tags?: string[] }) {
  const { supabase } = await requireAdmin();
  
  const { error } = await supabase
    .from("media_assets")
    .update(payload)
    .eq("id", id);
    
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function renameMediaFolder(oldFolder: string, newFolder: string) {
  const { supabase } = await requireAdmin();
  const cleanOld = oldFolder.trim();
  const cleanNew = newFolder.trim();
  if (!cleanOld || !cleanNew) throw new Error("Folder names cannot be empty");

  // Fetch all assets matching or under oldFolder
  const { data: assets } = await supabase
    .from("media_assets")
    .select("id, folder");

  if (!assets) return;

  const updates = assets
    .filter((a) => a.folder === cleanOld || a.folder.startsWith(cleanOld + "/"))
    .map((a) => {
      const newPath = a.folder === cleanOld ? cleanNew : cleanNew + a.folder.slice(cleanOld.length);
      return supabase.from("media_assets").update({ folder: newPath }).eq("id", a.id);
    });

  await Promise.all(updates);
  revalidatePath("/admin/media");
}

export async function deleteMediaFolder(folderName: string) {
  const { supabase } = await requireAdmin();
  const cleanFolder = folderName.trim();
  if (!cleanFolder) return;

  // Move assets in folderName to 'general'
  const { data: assets } = await supabase.from("media_assets").select("id, folder");
  if (!assets) return;

  const updates = assets
    .filter((a) => a.folder === cleanFolder || a.folder.startsWith(cleanFolder + "/"))
    .map((a) => supabase.from("media_assets").update({ folder: "general" }).eq("id", a.id));

  await Promise.all(updates);
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

export async function syncUploadThingAssets() {
  const { supabase, user } = await requireAdmin();
  
  try {
    const utapi = new UTApi();
    const response = await utapi.listFiles({});
    if (!response || !response.files || response.files.length === 0) {
      return { synced: 0 };
    }

    const { data: existing } = await supabase.from("media_assets").select("url");
    const existingUrls = new Set((existing ?? []).map((a) => a.url));
    const existingKeys = new Set(
      (existing ?? [])
        .map((a) => {
          const parts = a.url.split("/f/");
          return parts[1] || "";
        })
        .filter(Boolean)
    );

    const newAssetsToInsert = [];
    for (const f of response.files) {
      if (!existingKeys.has(f.key)) {
        const url = `https://utfs.io/f/${f.key}`;
        newAssetsToInsert.push({
          url,
          name: f.name || `UploadThing Asset (${f.key.slice(0, 6)})`,
          mime: "image/jpeg",
          size: f.size || 0,
          folder: "general",
          created_by: user.id,
        });
      }
    }

    if (newAssetsToInsert.length > 0) {
      const { error: insertErr } = await supabase.from("media_assets").insert(newAssetsToInsert);
      if (insertErr) throw new Error(insertErr.message);
      revalidatePath("/admin/media");
    }

    return { synced: newAssetsToInsert.length };
  } catch (err: unknown) {
    console.error("UploadThing sync error:", err);
    throw new Error("Failed to sync from UploadThing: " + (err as Error).message);
  }
}

