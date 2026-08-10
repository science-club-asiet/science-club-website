import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import MemberDetailClient, { Registration } from "@/components/admin/members/MemberDetailClient";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile: currentUser } = await requireAdmin();

  // Fetch the profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch their event registrations with event details
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      id,
      attended,
      price_paid,
      certificate_id,
      registered_at,
      events (
        id,
        title,
        event_date
      )
    `)
    .eq("profile_id", id)
    .order("registered_at", { ascending: false });

  const isOwner = currentUser?.role === "owner";

  return (
    <div className="max-w-5xl">
      <MemberDetailClient 
        profile={profile} 
        registrations={(registrations as unknown as Registration[]) || []} 
        isOwner={isOwner} 
      />
    </div>
  );
}
