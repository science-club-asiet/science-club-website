import Link from "next/link";
import { getSessionProfile } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { profile, supabase } = await getSessionProfile();

  const tables: { table: string; label: string; href: string }[] = [
    { table: "events", label: "Events", href: "/admin/events" },
    { table: "posts", label: "Posts", href: "/admin/posts" },
    { table: "execom_members", label: "Execom", href: "/admin/execom_members" },
    { table: "membership_applications", label: "Applications", href: "/admin/applications" },
  ];

  const counts = await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabase.from(t.table).select("*", { count: "exact", head: true });
      return { ...t, count: count ?? 0 };
    })
  );

  return (
    <div>
      <span className="font-oswald uppercase tracking-[0.3em] text-red text-xs font-bold">
        Science Club · Admin
      </span>
      <h1 className="font-oswald text-4xl font-bold uppercase mt-2 mb-1">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        Signed in as <span className="font-bold uppercase text-navy">{profile?.role}</span>
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map((c) => (
          <Link
            key={c.table}
            href={c.href}
            className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-red transition-colors"
          >
            <p className="font-oswald text-4xl font-bold">{c.count}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
