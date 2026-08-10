import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  redirect(`/admin/pagebuilder/${kind}/${id}`);
}

