import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await requireAdmin();
  const { data: ct } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "current_term")
    .maybeSingle();
  const c = await cookies();
  const activeTerm = (ct?.value as { term?: string } | null)?.term ?? "2025-26";
  const sessionTerm = c.get("admin_term")?.value ?? activeTerm;

  const { data: termsTable } = await supabase.from("terms").select("name").order("sort_order", { ascending: true });
  let fetchedTerms = (termsTable ?? []).map((t) => t.name);

  if (fetchedTerms.length === 0) {
    const { data: allTermsData } = await supabase.from("execom_members").select("term");
    fetchedTerms = Array.from(new Set((allTermsData ?? []).map((r) => r.term))).sort().reverse();
  }

  const uniqueTerms = Array.from(new Set(fetchedTerms));
  if (!uniqueTerms.includes(activeTerm)) uniqueTerms.push(activeTerm);
  if (!uniqueTerms.includes(sessionTerm)) uniqueTerms.push(sessionTerm);
  uniqueTerms.sort().reverse();

  return (
    <AdminShell email={profile?.email ?? ""} role={profile?.role ?? "admin"} term={sessionTerm} availableTerms={uniqueTerms} activeTerm={activeTerm}>
      {children}
    </AdminShell>
  );
}
