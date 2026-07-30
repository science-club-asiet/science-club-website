import { requireAdmin } from "@/lib/admin/auth";
import { createForm } from "@/lib/admin/formActions";
import { PageHeader, Field, Card, inputCls, btnPrimaryCls } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function NewFormPage() {
  await requireAdmin();

  return (
    <div className="max-w-lg">
      <PageHeader title="New Form" subtitle="Name it — then build the fields visually." />
      <Card className="p-6">
        <form action={createForm} className="space-y-5">
          <Field label="Title">
            <input name="title" required placeholder="e.g. Workshop Registration" className={inputCls} />
          </Field>
          <Field label="Slug" help="URL: /forms/your-slug — leave blank to auto-generate">
            <input name="slug" placeholder="workshop-registration" className={inputCls} />
          </Field>
          <Field label="Purpose">
            <select name="purpose" defaultValue="generic" className={inputCls}>
              <option value="generic">Generic</option>
              <option value="membership">Membership</option>
              <option value="event">Event</option>
            </select>
          </Field>
          <button type="submit" className={btnPrimaryCls}>Create &amp; add fields →</button>
        </form>
      </Card>
    </div>
  );
}
