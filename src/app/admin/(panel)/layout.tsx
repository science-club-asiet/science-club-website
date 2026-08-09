import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Execute requireAdmin auth check, site_content term lookup, cookies read, and terms query in parallel
  const [{ profile, supabase }, { data: ct }, c, { data: termsTable }] = await Promise.all([
    requireAdmin(),
    createClient().then((client) =>
      client.from("site_content").select("value").eq("key", "current_term").maybeSingle()
    ),
    cookies(),
    createClient().then((client) =>
      client.from("terms").select("name").order("sort_order", { ascending: true })
    ),
  ]);

  const activeTerm = (ct?.value as { term?: string } | null)?.term ?? "2025-26";
  const sessionTerm = c.get("admin_term")?.value ?? activeTerm;

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
