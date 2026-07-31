import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FormRenderer } from "@/components/FormRenderer";
import { NexusFormRender } from "@/packages/nexus-builder/NexusFormRender";
import { getFormBySlug } from "@/lib/data/forms";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  return { title: form ? `${form.title} · Science Club` : "Form · Science Club" };
}

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { slug } = await params;
  const { event } = await searchParams;
  const form = await getFormBySlug(slug);
  if (!form) notFound();

  return (
    <div className="bg-white text-navy selection:bg-red selection:text-white min-h-screen flex flex-col relative w-full font-inter">
      <Header />
      <main className="relative z-10 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-b border-gray-200/50 rounded-b-3xl pt-32 pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase text-navy leading-tight tracking-tight mb-3">
            {form.title}
          </h1>
          {form.description && <p className="text-gray-500 mb-10 max-w-xl">{form.description}</p>}
          {form.nexus_data ? (
            <NexusFormRender data={form.nexus_data} formId={form.id} eventId={event} />
          ) : form.fields.length === 0 ? (
            <p className="text-gray-400">This form has no fields yet.</p>
          ) : (
            <FormRenderer form={form} eventId={event} />
          )}
        </div>
      </main>
      <div className="md:sticky md:bottom-0 md:z-0 z-10 relative">
        <Footer />
      </div>
    </div>
  );
}
