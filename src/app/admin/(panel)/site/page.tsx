import { requireAdmin } from "@/lib/admin/auth";
import { SINGLETONS } from "@/lib/admin/singletons";
import { saveSingletonAction } from "@/lib/admin/actions";
import { EditorForm } from "@/components/admin/EditorForm";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_content").select("key, value");
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, Record<string, unknown>>;

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-2">Site Content</h1>
      <p className="text-gray-500 text-sm mb-8">Hero copy, marquee, contact, location, footer and the current execom term.</p>
      <div className="grid gap-6 max-w-2xl">
        {SINGLETONS.map((s) => (
          <EditorForm
            key={s.key}
            title={s.label}
            fields={s.fields}
            initial={map[s.key] ?? {}}
            action={saveSingletonAction.bind(null, s.key)}
          />
        ))}
      </div>
    </div>
  );
}
