import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Data } from "@measured/puck";
import { getPostBySlug } from "@/lib/data/posts";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { PuckRender } from "@/components/builder/PuckRender";
import type { Block } from "@/lib/blocks/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post ? `${post.title} · Science Club` : "News · Science Club" };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-b border-gray-200/50 rounded-b-3xl pt-32 pb-24">
        <article className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Link href="/news" className="text-xs font-oswald uppercase tracking-widest font-bold text-navy/50 hover:text-red">
            ← Newsroom
          </Link>
          <div className="flex items-center gap-3 text-xs font-oswald uppercase tracking-widest font-bold text-red mt-6 mb-3">
            <span>{post.tag || post.type}</span>
            <span className="text-gray-400">{post.date}</span>
          </div>
          <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase text-navy leading-[0.95] tracking-tight mb-8">
            {post.title}
          </h1>
          {post.cover && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-10">
              <Image src={post.cover} alt={post.title} fill priority sizes="(max-width:1024px) 100vw, 768px" className="object-cover" />
            </div>
          )}
          {(post.layout as { content?: unknown[] } | null)?.content?.length ? (
            <div className="w-full mt-8"><PuckRender data={post.layout as Data} /></div>
          ) : post.blocks && post.blocks.length > 0 ? (
            <div className="w-full mt-8">
              <BlockRenderer blocks={post.blocks as Block[]} />
            </div>
          ) : (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {post.body || post.excerpt}
            </div>
          )}
        </article>
      </main>
      <div className="md:sticky md:bottom-0 md:z-0 z-10 relative">
        <Footer />
      </div>
    </div>
  );
}
