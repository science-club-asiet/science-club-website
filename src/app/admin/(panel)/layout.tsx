import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-navy font-inter flex">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col sticky top-0 h-screen">
        <Link href="/admin" className="font-oswald text-xl font-bold uppercase px-3 py-2 mb-2">
          Science Club
        </Link>
        <div className="overflow-y-auto flex-1">
          <AdminNav />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 px-3">
          <p className="text-xs text-gray-500 mb-2 truncate">{profile?.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 lg:p-10">{children}</main>
    </div>
  );
}
