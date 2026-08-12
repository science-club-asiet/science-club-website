import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NexusRenderer } from "@/packages/nexus-builder/NexusRenderer";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createPublicClient();
  const { data: page } = await sb.from("pages").select("title").eq("slug", slug).eq("is_published", true).maybeSingle();
  return { title: page ? `${page.title} · Science Club` : "Page · Science Club" };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createPublicClient();
  const { data: page } = await sb.from("pages").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!page) notFound();

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white pt-32 pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {page.nexus_data ? (
            <NexusRenderer data={page.nexus_data} />
          ) : (
            <p className="text-gray-400">This page is empty.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
