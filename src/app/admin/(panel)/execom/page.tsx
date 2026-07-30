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

  // 3. Fetch all unique terms (not strictly needed for dropdown anymore, but Client needs to know active vs viewed)
  // We can just pass activeTerm and viewedTerm directly.
  
  // 4. Fetch members for viewed term
  const { data: members } = await supabase
    .from("execom_members")
    .select("*")
    .eq("term", viewedTerm)
    .order("display_order", { ascending: true });

  return (
    <ExecomWorkspaceClient
      activeTerm={activeTerm}
      viewedTerm={viewedTerm}
      initialMembers={members ?? []}
    />
  );
}
