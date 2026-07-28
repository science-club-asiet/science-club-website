import Link from "next/link";
import { notFound } from "next/navigation";
import { RESOURCES, reorderSortField } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/admin/auth";
import { SortableList, type Row } from "@/components/admin/SortableList";

export const dynamic = "force-dynamic";

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const res = RESOURCES[resource];
  if (!res) notFound();

  const { supabase } = await requireAdmin();
  let query = supabase.from(res.table).select("*");
  if (res.orderBy) query = query.order(res.orderBy.column, { ascending: res.orderBy.ascending ?? true });
  const { data } = await query;

  const sortable = !!reorderSortField(res);
  const rows: Row[] = (data ?? []).map((row) => {
    const sv = res.statusField ? row[res.statusField] : undefined;
    return {
      id: row.id as string,
      title: String(row[res.titleField] ?? "—"),
      badgeLabel: res.statusField
        ? typeof sv === "boolean" ? (sv ? "Published" : "Draft") : String(sv ?? "")
        : undefined,
      badgeOn: sv === true || sv === "published",
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-oswald text-3xl font-bold uppercase">{res.label}</h1>
        <Link
          href={`/admin/${res.key}/new`}
          className="bg-navy text-white px-5 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors"
        >
          + New
        </Link>
      </div>
      {sortable && <p className="text-xs text-gray-400 mb-4">Drag the handle to reorder — saved automatically.</p>}
      {!sortable && <div className="mb-4" />}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <SortableList
          key={rows.map((r) => r.id).join("|")}
          resourceKey={res.key}
          rows={rows}
          sortable={sortable}
          showRegistrations={res.key === "events"}
        />
      </div>
    </div>
  );
}
