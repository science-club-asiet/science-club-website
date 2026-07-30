import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { BlockBuilder } from "@/components/admin/builder/BlockBuilder";
import type { Block } from "@/lib/blocks/types";

const TABLE: Record<string, string> = { event: "events", post: "posts" };

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const table = TABLE[kind];
  if (!table) notFound();

  const { supabase } = await requireAdmin();
  const { data: row } = await supabase.from(table).select("*").eq("id", id).single();
  if (!row) notFound();

  const blocks: Block[] = Array.isArray(row.blocks) ? row.blocks : [];
  const previewHref =
    kind === "event" && row.slug ? `/events/${row.slug}` :
    kind === "post" && row.slug ? `/news/${row.slug}` : undefined;

  return (
    <BlockBuilder
      kind={kind}
      id={id}
      title={row.title ?? "Untitled"}
      initialBlocks={blocks}
      previewHref={previewHref}
      backHref={`/admin/${table}`}
    />
  );
}
