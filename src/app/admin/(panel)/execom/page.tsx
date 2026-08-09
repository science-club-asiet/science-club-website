import { requireAdmin } from "@/lib/admin/auth";
import { ExecomWorkspaceClient } from "@/components/admin/execom/ExecomWorkspaceClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ExecomPage() {
  const { supabase } = await requireAdmin();
  
  // Determine viewed term from cookie if present
  const c = await cookies();
  const cookieTerm = c.get("admin_term")?.value;

  // Fetch site content, teams, and terms in parallel
  const [{ data: siteData }, { data: teams }, { data: terms }] = await Promise.all([
    supabase.from("site_content").select("value").eq("key", "current_term").maybeSingle(),
    supabase.from("teams").select("*").order("sort_order", { ascending: true }),
    supabase.from("terms").select("*").order("sort_order", { ascending: true }),
  ]);

  const activeTerm = (siteData?.value as { term?: string } | null)?.term ?? "2025-26";
  const viewedTerm = cookieTerm ?? activeTerm;

  // Fetch members for viewed term
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
