import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { PostEditorClient } from "@/components/admin/posts/PostEditorClient";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const [{ data: categories }, { data: termsData }] = await Promise.all([
    supabase.from("post_categories").select("id, name, slug, tagline, sort_order").order("sort_order", { ascending: true }),
    supabase.from("terms").select("name").order("sort_order", { ascending: true }),
  ]);

  const termsList = termsData && termsData.length > 0 ? termsData.map((t) => t.name) : ["2025-26", "2024-25", "2023-24", "2022-23"];

  const fallbackCategories = [
    { name: "Latest News", slug: "news" },
    { name: "Tech Article", slug: "article" },
    { name: "Research Paper", slug: "paper" },
    { name: "Member Blog", slug: "blog" },
    { name: "Announcement", slug: "announcement" },
  ];

  return (
    <PostEditorClient
      initialData={post}
      categories={categories && categories.length > 0 ? categories : fallbackCategories}
      terms={termsList}
    />
  );
}
