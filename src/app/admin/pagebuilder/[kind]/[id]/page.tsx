import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { NexusEditor } from "@/packages/nexus-builder/NexusEditor";

const TABLE: Record<string, string> = { event: "events", post: "posts", form: "forms", page: "pages" };

export const dynamic = "force-dynamic";

export default async function PageBuilderRoute({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const table = TABLE[kind];
  if (!table) notFound();

  const { supabase } = await requireAdmin();
  const { data: row } = await supabase.from(table).select("*").eq("id", id).single();
  if (!row) notFound();

  const data = row.nexus_data ?? {};
  const backHref = table === "forms" ? `/admin/forms/${id}` : `/admin/${table}`;
  const previewHref =
    kind === "form" && row.slug ? `/forms/${row.slug}` :
    kind === "event" && row.slug ? `/events/${row.slug}` :
    kind === "post" && row.slug ? `/news/${row.slug}` : undefined;

  return (
    <NexusEditor
      kind={kind}
      id={id}
      data={data}
      title={row.title ?? "Untitled"}
      backHref={backHref}
      previewHref={previewHref}
    />
  );
}
