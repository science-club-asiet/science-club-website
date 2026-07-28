import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "member" | "execom" | "admin" | "owner";
  is_member: boolean;
};

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_member")
    .eq("id", user.id)
    .single();
  return { user, profile: (profile as Profile) ?? null, supabase };
}

/** Guard for the admin panel — members/guests are bounced out. */
export async function requireAdmin() {
  const ctx = await getSessionProfile();
  if (!ctx.user) redirect("/login?next=/admin");
  if (!ctx.profile || (ctx.profile.role !== "admin" && ctx.profile.role !== "owner")) {
    redirect("/?denied=admin");
  }
  return ctx;
}

/** Owner-only actions (user/role management). */
export async function requireOwner() {
  const ctx = await requireAdmin();
  if (ctx.profile!.role !== "owner") redirect("/admin");
  return ctx;
}
