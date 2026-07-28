import { requireAdmin } from "@/lib/admin/auth";
import { createForm } from "@/lib/admin/formActions";

export const dynamic = "force-dynamic";

const input = "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:border-red";

export default async function NewFormPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="font-oswald text-3xl font-bold uppercase mb-8">New Form</h1>
      <form action={createForm} className="max-w-md space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Title</span>
          <input name="title" required className={input} placeholder="e.g. Workshop Registration" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Slug</span>
          <input name="slug" className={input} placeholder="auto from title if blank" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Purpose</span>
          <select name="purpose" className={input} defaultValue="generic">
            <option value="generic">generic</option>
            <option value="membership">membership</option>
            <option value="event">event</option>
          </select>
        </label>
        <button type="submit" className="bg-navy text-white px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-red transition-colors">
          Create &amp; add fields
        </button>
      </form>
    </div>
  );
}
