import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPublishedItem } from "@/lib/admin/cmsActions";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ collection: string; slug: string }> }) {
  const { collection, slug } = await params;
  const data = await getPublishedItem(collection, slug);
  const title = data ? String(data.item.data[data.fields.find((f) => f.type === "text")?.name ?? "title"] ?? "Entry") : "Entry";
  return { title: `${title} · Science Club` };
}

export default async function CollectionItemPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
  const { collection, slug } = await params;
  const data = await getPublishedItem(collection, slug);
  if (!data) notFound();
  const { fields, item } = data;

  const titleField = fields.find((f) => f.type === "text")?.name;
  const imageField = fields.find((f) => f.type === "image")?.name;
  const bodyFields = fields.filter((f) => f.name !== titleField && f.name !== imageField);
  const title = titleField ? String(item.data[titleField] ?? "") : "";
  const cover = imageField ? (item.data[imageField] as string) : "";

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-b border-gray-200/50 rounded-b-3xl pt-32 pb-24">
        <article className="container mx-auto px-4 lg:px-8 max-w-3xl">
          {title && <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase text-navy leading-[0.95] tracking-tight mb-8">{title}</h1>}
          {cover && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-10">
              <Image src={cover} alt={title} fill sizes="(max-width:1024px) 100vw, 768px" className="object-cover" />
            </div>
          )}
          <div className="space-y-6">
            {bodyFields.map((f) => {
              const v = item.data[f.name];
              if (v == null || v === "") return null;
              if (f.type === "richtext") return <div key={f.name} className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: String(v) }} />;
              if (f.type === "textarea") return <p key={f.name} className="text-gray-700 leading-relaxed whitespace-pre-line">{String(v)}</p>;
              if (f.type === "boolean") return null;
              return (
                <p key={f.name} className="text-gray-700">
                  <span className="text-xs font-oswald uppercase tracking-widest text-navy/50 mr-2">{f.label}:</span>
                  {Array.isArray(v) ? v.join(", ") : String(v)}
                </p>
              );
            })}
          </div>
        </article>
      </main>
      <div className="md:sticky md:bottom-0 md:z-0 z-10 relative">
        <Footer />
      </div>
    </div>
  );
}
