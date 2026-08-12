import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPublishedPosts } from "@/lib/data/posts";

export const revalidate = 300;

export const metadata = { title: "News · Science Club" };

export default async function NewsIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <span className="font-oswald uppercase tracking-[0.3em] text-red text-xs font-bold">Newsroom</span>
          <h1 className="font-oswald text-5xl md:text-7xl font-bold uppercase mt-2 mb-12 tracking-tight">Latest</h1>

          {posts.length === 0 && <p className="text-gray-400">No posts published yet.</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <Link key={p.slug} href={`/news/${p.slug}`} className="group flex flex-col">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  {p.cover && (
                    <Image src={p.cover} alt={p.title} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-oswald uppercase tracking-widest font-bold text-red mb-2">
                  <span>{p.tag || p.type}</span>
                  <span className="text-gray-400">{p.date}</span>
                </div>
                <h2 className="font-oswald text-2xl font-bold uppercase text-navy leading-tight group-hover:text-red transition-colors">
                  {p.title}
                </h2>
                <p className="text-gray-500 text-sm mt-2 line-clamp-3">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
