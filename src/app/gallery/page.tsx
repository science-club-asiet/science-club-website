import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GalleryView } from "./GalleryView";
import { getAlbums } from "@/lib/data/gallery";

export const revalidate = 300;

export const metadata = { title: "Gallery · Science Club" };

export default async function GalleryPage() {
  const albums = await getAlbums();

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white pt-32 pb-8">
        <div className="container mx-auto px-4 lg:px-8 mb-12">
          <span className="font-oswald uppercase tracking-[0.3em] text-red text-xs font-bold">Gallery</span>
          <h1 className="font-oswald text-5xl md:text-7xl font-bold uppercase mt-2 tracking-tight">Moments</h1>
          <p className="text-gray-500 mt-3 max-w-xl">Talks, workshops, builds and celebrations — the club in motion.</p>
        </div>
        <GalleryView albums={albums} />
      </main>
      <Footer />
    </div>
  );
}
