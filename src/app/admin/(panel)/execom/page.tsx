import { requireAdmin } from "@/lib/admin/auth";
import { ExecomWorkspaceClient } from "@/components/admin/execom/ExecomWorkspaceClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ExecomPage() {
  const { supabase } = await requireAdmin();
  
  // 1. Fetch current active term from site_content
  const { data: siteData } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "current_term")
    .maybeSingle();
  
  const activeTerm = (siteData?.value as { term?: string } | null)?.term ?? "2025-26";
  
  // 2. Determine viewed term from cookie
  const c = await cookies();
  const viewedTerm = c.get("admin_term")?.value ?? activeTerm;

  // 3. Fetch categories (teams) and terms
  const [{ data: teams }, { data: terms }] = await Promise.all([
    supabase.from("teams").select("*").order("sort_order", { ascending: true }),
    supabase.from("terms").select("*").order("sort_order", { ascending: true }),
  ]);

  // 4. Fetch members for viewed term
  const { data: members } = await supabase
    .from("execom_members")
    .select("*")
    .eq("term", viewedTerm)
    .order("display_order", { ascending: true });

  return (
    <ExecomWorkspaceClient
      key={viewedTerm}
      activeTerm={activeTerm}
      viewedTerm={viewedTerm}
      initialMembers={members ?? []}
      categories={teams ?? []}
      terms={terms ?? []}
    />
  );
}
