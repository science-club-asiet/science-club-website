"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { Block } from "@/lib/blocks/types";

const TABLE: Record<string, string> = { event: "events", post: "posts" };

export async function saveBlocksAction(kind: string, id: string, blocks: Block[]): Promise<{ error?: string }> {
  const table = TABLE[kind];
  if (!table) return { error: "Unknown kind" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).update({ blocks }).eq("id", id);
  if (error) return { error: error.message };
  if (kind === "event") revalidatePath("/events");
  if (kind === "post") revalidatePath("/news");
  return {};
}
