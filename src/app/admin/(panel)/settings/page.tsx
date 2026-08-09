import { requireAdmin } from "@/lib/admin/auth";
import { SettingsShell } from "@/components/admin/settings/SettingsShell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();

  // Fetch site_content, profiles, and media_assets in parallel
  const [{ data: siteData }, { data: profiles }, { data: mediaAssets }] = await Promise.all([
    supabase.from("site_content").select("*"),
    supabase
      .from("profiles")
      .select("id, full_name, email, department, year_of_study, role, is_member, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("media_assets").select("id, size, folder"),
  ]);

  const siteMap = siteData?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {};

  return (
    <SettingsShell
      initialSettings={siteMap}
      profiles={profiles ?? []}
      mediaAssets={mediaAssets ?? []}
    />
  );
}
