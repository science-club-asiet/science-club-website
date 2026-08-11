import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F8]">{children}</main>
      <Footer />
    </>
  );
}
