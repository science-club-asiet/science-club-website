import { requireAdmin } from "@/lib/admin/auth";
import { SettingsShell } from "@/components/admin/settings/SettingsShell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, profile } = await requireAdmin();

  const { data } = await supabase.from("site_content").select("*");
  const siteMap = data?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {};

  return (
    <SettingsShell 
      initialSettings={siteMap}
    />
  );
}
