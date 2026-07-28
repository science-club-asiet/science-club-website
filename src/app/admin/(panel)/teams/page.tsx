import { requireAdmin } from "@/lib/admin/auth";
import { TEAM_FIELDS } from "@/lib/admin/singletons";
import { saveTeamAction } from "@/lib/admin/actions";
import { EditorForm } from "@/components/admin/EditorForm";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const { supabase } = await requireAdmin();
  const { data: teams } = await supabase.from("teams").select("*").order("sort_order");

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-2">Teams</h1>
      <p className="text-gray-500 text-sm mb-8">Team headers shown on the home Execom carousel. Members live under Execom.</p>
      <div className="grid gap-6 max-w-2xl">
        {(teams ?? []).map((t) => (
          <EditorForm
            key={t.slug}
            title={t.name}
            fields={TEAM_FIELDS}
            initial={t}
            action={saveTeamAction.bind(null, t.slug)}
          />
        ))}
      </div>
    </div>
  );
}
