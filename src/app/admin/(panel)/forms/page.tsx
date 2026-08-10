import { requireAdmin } from "@/lib/admin/auth";
import { seedDefaultTemplatesAction } from "@/lib/admin/formActions";
import { FormsManagerClient, FormItem, CategoryItem } from "@/components/admin/forms/FormsManagerClient";

export const dynamic = "force-dynamic";

export default async function FormsListPage() {
  const { supabase } = await requireAdmin();

  // Auto-seed default templates if empty
  await seedDefaultTemplatesAction();

  // Fetch all forms & templates
  const { data: formsData } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch categories table
  const { data: categoriesData } = await supabase
    .from("form_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const forms: FormItem[] = (formsData ?? []).map((f) => ({
    id: f.id,
    title: f.title,
    slug: f.slug,
    description: f.description,
    purpose: f.purpose,
    category: f.category || "General",
    is_template: Boolean(f.is_template),
    is_active: f.is_active !== false,
    created_at: f.created_at,
  }));

  const categories: CategoryItem[] = (categoriesData ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));

  return <FormsManagerClient initialForms={forms} initialCategories={categories} />;
}
