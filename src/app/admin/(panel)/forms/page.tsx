import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteForm } from "@/lib/admin/formActions";
import { DuplicateFormButton } from "@/components/admin/forms/DuplicateFormButton";

export const dynamic = "force-dynamic";

export default async function FormsListPage() {
  const { supabase } = await requireAdmin();
  const { data: forms } = await supabase.from("forms").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-oswald text-3xl font-bold uppercase">Forms</h1>
        <Link href="/admin/forms/new" className="bg-navy text-white px-5 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors">
          + New form
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {(forms ?? []).length === 0 && <p className="p-8 text-center text-gray-400 text-sm">No forms yet.</p>}
        {(forms ?? []).map((f) => (
          <div key={f.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-[160px]">
              <p className="font-medium truncate">{f.title}</p>
              <p className="text-xs text-gray-400 font-mono">/forms/{f.slug}</p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${f.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {f.is_active ? "Active" : "Inactive"}
            </span>
            <a href={`/forms/${f.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">View</a>
            <Link href={`/admin/forms/${f.id}/submissions`} className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">Submissions</Link>
            <Link href={`/admin/forms/${f.id}`} className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">Edit</Link>
            <DuplicateFormButton formId={f.id} />
            <form action={deleteForm.bind(null, f.id)}>
              <button className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-red">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
