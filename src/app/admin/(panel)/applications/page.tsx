import { requireAdmin } from "@/lib/admin/auth";
import { KanbanBoard } from "@/components/admin/applications/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const { supabase } = await requireAdmin();
  const { data: apps } = await supabase
    .from("membership_applications")
    .select("*")
    .order("created_at", { ascending: false });

  // 1. Make it work before the migration: derive stage from status if stage is null
  const normalizedApps = (apps ?? []).map((a) => {
    let derivedStage = "submitted";
    if (a.status === "approved") derivedStage = "accepted";
    if (a.status === "rejected") derivedStage = "rejected";
    return { ...a, stage: a.stage ?? derivedStage };
  });

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">Membership Applications</h1>
      
      <p className="text-xs text-gray-400 mt-4 max-w-2xl mb-8">
        Drag and drop applications across stages. To grant event-pricing benefits, flip the applicant&apos;s
        <strong> Member </strong> flag under <strong>Members</strong> once they have an account.
      </p>

      <KanbanBoard apps={normalizedApps} />
    </div>
  );
}
