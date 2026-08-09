import { createClient } from "@/lib/supabase/server";
import { PostsWorkspaceClient } from "@/components/admin/posts/PostsWorkspaceClient";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const supabase = await createClient();

  // Parallelize data fetching for posts, categories, and terms
  const [{ data: posts }, { data: categories }, { data: termsData }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, term, type, status, excerpt, cover_image_url, is_featured, breaking, published_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("post_categories")
      .select("id, name, slug, tagline, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("terms")
      .select("name")
      .order("sort_order", { ascending: true }),
  ]);

  const termsList = termsData && termsData.length > 0 ? termsData.map((t) => t.name) : ["2025-26", "2024-25", "2023-24", "2022-23"];

  const fallbackCategories = [
    { name: "Latest News", slug: "news", tagline: "Official club updates and press releases", sort_order: 1 },
    { name: "Tech Article", slug: "article", tagline: "Deep dives, tutorials, and tech write-ups", sort_order: 2 },
    { name: "Research Paper", slug: "paper", tagline: "Academic research and paper publications", sort_order: 3 },
    { name: "Member Blog", slug: "blog", tagline: "Student stories, experiences, and opinions", sort_order: 4 },
    { name: "Announcement", slug: "announcement", tagline: "Important notices and deadlines", sort_order: 5 },
  ];

  return (
    <PostsWorkspaceClient
      posts={posts ?? []}
      categories={categories && categories.length > 0 ? categories : fallbackCategories}
      terms={termsList}
    />
  );
}
