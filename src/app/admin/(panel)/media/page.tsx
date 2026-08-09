import { createClient } from "@/lib/supabase/server";
import { MediaLibraryClient } from "@/components/admin/media/MediaLibraryClient";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const supabase = await createClient();

  const { data: assets } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="h-[calc(100vh-6rem)]">
      <MediaLibraryClient initialAssets={assets ?? []} />
    </div>
  );
}
