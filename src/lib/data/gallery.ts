import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type GalleryImage = { id: string; url: string; caption: string };
export type Album = {
  id: string;
  title: string;
  category: string;
  term: string;
  cover: string;
  description: string;
  images: GalleryImage[];
};

/** Published albums with their images, for the public gallery. */
export async function getAlbums(): Promise<Album[]> {
  const sb = createPublicClient();
  const { data: albums, error } = await sb
    .from("media_albums")
    .select("*")
    .eq("is_published", true)
    .order("display_order");
  if (error) {
    console.error("[getAlbums]", error.message);
    return [];
  }

  const ids = (albums ?? []).map((a) => a.id);
  const { data: images } = ids.length
    ? await sb.from("media_images").select("*").in("album_id", ids).eq("is_published", true).order("display_order")
    : { data: [] as Record<string, unknown>[] };

  return (albums ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category ?? "",
    term: a.term ?? "",
    cover: a.cover_image_url ?? "",
    description: a.description ?? "",
    images: (images ?? [])
      .filter((i) => i.album_id === a.id)
      .map((i) => ({ id: i.id as string, url: i.image_url as string, caption: (i.caption as string) ?? "" })),
  }));
}
