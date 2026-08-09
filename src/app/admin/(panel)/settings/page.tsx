import { requireAdmin } from "@/lib/admin/auth";
import { SettingsShell } from "@/components/admin/settings/SettingsShell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();

  // Fetch site_content singletons
  const { data: siteData } = await supabase.from("site_content").select("*");
  const siteMap = siteData?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {};

  // Fetch user profiles for Users & Roles tab
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, department, year_of_study, role, is_member, created_at")
    .order("created_at", { ascending: false });

  // Fetch media assets stats for Storage tab
  const { data: mediaAssets } = await supabase
    .from("media_assets")
    .select("id, size, folder");

  return (
    <SettingsShell
      initialSettings={siteMap}
      profiles={profiles ?? []}
      mediaAssets={mediaAssets ?? []}
    />
  );
}
