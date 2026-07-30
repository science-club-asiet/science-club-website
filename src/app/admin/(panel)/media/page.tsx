import { requireAdmin } from "@/lib/admin/auth";
import { MediaLibraryClient } from "@/components/admin/media/MediaLibraryClient";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const { supabase } = await requireAdmin();

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
