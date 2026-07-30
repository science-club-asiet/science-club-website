"use server";

import { requireAdmin } from "@/lib/admin/auth";

export type Template = {
  id: string;
  kind: string;
  name: string;
  description: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export async function saveTemplateAction(
  kind: string,
  name: string,
  description: string,
  payload: Record<string, unknown>
) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("templates")
    .insert({
      kind,
      name,
      description,
      payload,
      created_by: user.id,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTemplates(kind: string): Promise<Template[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("kind", kind)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
  return data as Template[];
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    console.error("Failed to fetch template:", error);
    return null;
  }
  return data as Template;
}
