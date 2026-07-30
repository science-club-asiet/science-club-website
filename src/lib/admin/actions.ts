"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RESOURCES, coerceField, reorderSortField } from "@/lib/admin/resources";
import { SINGLETONS, TEAM_FIELDS, JSON_ARRAY_FIELDS } from "@/lib/admin/singletons";
import { requireAdmin, requireOwner } from "@/lib/admin/auth";

export type SaveState = { error?: string } | null;
export type EditorState = { error?: string; ok?: boolean } | null;

// ─── Generic resource CRUD ──────────────────────────────────────────────────

export async function saveResourceAction(
  key: string,
  id: string | null,
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const res = RESOURCES[key];
  if (!res) return { error: "Unknown resource." };
  const { supabase } = await requireAdmin();

  let payload: Record<string, unknown>;
  try {
    payload = {};
    for (const f of res.fields) payload[f.name] = coerceField(f, formData);
  } catch {
    return { error: "A JSON field contains invalid JSON." };
  }

  const { error } = id
    ? await supabase.from(res.table).update(payload).eq("id", id)
    : await supabase.from(res.table).insert(payload);

  if (error) return { error: error.message };

  for (const p of res.revalidate) revalidatePath(p);
  revalidatePath(`/admin/${key}`);
  redirect(`/admin/${key}`);
}

export async function reorderResource(key: string, orderedIds: string[]): Promise<void> {
  const res = RESOURCES[key];
  if (!res) return;
  const sortField = reorderSortField(res);
  if (!sortField) return;
  const { supabase } = await requireAdmin();
  await Promise.all(
    orderedIds.map((id, i) => supabase.from(res.table).update({ [sortField]: i }).eq("id", id))
  );
  for (const p of res.revalidate) revalidatePath(p);
  revalidatePath(`/admin/${key}`);
}

export async function deleteResourceAction(key: string, id: string): Promise<void> {
  const res = RESOURCES[key];
  if (!res) return;
  const { supabase } = await requireAdmin();
  await supabase.from(res.table).delete().eq("id", id);
  for (const p of res.revalidate) revalidatePath(p);
  revalidatePath(`/admin/${key}`);
  redirect(`/admin/${key}`);
}

// ─── Site content singletons + teams ────────────────────────────────────────

export async function saveSingletonAction(
  key: string,
  _prev: EditorState,
  formData: FormData
): Promise<EditorState> {
  const s = SINGLETONS.find((x) => x.key === key);
  if (!s) return { error: "Unknown section." };
  const { supabase } = await requireAdmin();

  const value: Record<string, unknown> = {};
  try {
    for (const f of s.fields) {
      const raw = String(formData.get(f.name) ?? "").trim();
      if (f.type === "json") {
        value[f.name] = raw ? JSON.parse(raw) : JSON_ARRAY_FIELDS.has(f.name) ? [] : {};
      } else if (f.type === "number") {
        value[f.name] = raw === "" ? 0 : Number(raw);
      } else {
        value[f.name] = raw;
      }
    }
  } catch {
    return { error: "A JSON field contains invalid JSON." };
  }

  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { error: error.message };

  for (const p of s.revalidate) revalidatePath(p);
  revalidatePath("/admin/site");
  return { ok: true };
}

export async function saveTeamAction(
  slug: string,
  _prev: EditorState,
  formData: FormData
): Promise<EditorState> {
  const { supabase } = await requireAdmin();
  const payload: Record<string, unknown> = {};
  for (const f of TEAM_FIELDS) {
    const raw = String(formData.get(f.name) ?? "").trim();
    payload[f.name] = f.type === "number" ? (raw === "" ? 0 : Number(raw)) : raw || null;
  }
  const { error } = await supabase.from("teams").update(payload).eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/info/execom");
  revalidatePath("/admin/teams");
  return { ok: true };
}

// ─── Membership applications ────────────────────────────────────────────────

export async function setApplicationStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<void> {
  const { supabase, user } = await requireAdmin();
  await supabase
    .from("membership_applications")
    .update({ status, reviewed_by: user!.id })
    .eq("id", id);
  revalidatePath("/admin/applications");
}

export async function setApplicationStage(
  id: string,
  stage: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  
  let status = "pending";
  if (stage === "accepted") status = "approved";
  else if (stage === "rejected") status = "rejected";

  const { error } = await supabase
    .from("membership_applications")
    .update({ stage, status, reviewed_by: user!.id })
    .eq("id", id);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/applications");
  return {};
}

// ─── Members / profiles ─────────────────────────────────────────────────────

export async function setMembership(profileId: string, isMember: boolean): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ is_member: isMember }).eq("id", profileId);
  revalidatePath("/admin/members");
}

export async function setRole(profileId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireOwner();
  const role = String(formData.get("role") ?? "member");
  await supabase.from("profiles").update({ role }).eq("id", profileId);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${profileId}`);
}

export async function updateProfile(profileId: string, formData: FormData): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const full_name = String(formData.get("full_name") ?? "").trim() || null;
  const department = String(formData.get("department") ?? "").trim() || null;
  const year_of_study = String(formData.get("year_of_study") ?? "").trim() || null;
  
  const { error } = await supabase
    .from("profiles")
    .update({ full_name, department, year_of_study })
    .eq("id", profileId);
    
  if (error) return { error: error.message };
  revalidatePath(`/admin/members`);
  revalidatePath(`/admin/members/${profileId}`);
  return {};
}

export async function updateTags(profileId: string, tags: string[]): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ tags })
    .eq("id", profileId);
    
  if (error) return { error: error.message };
  revalidatePath(`/admin/members`);
  revalidatePath(`/admin/members/${profileId}`);
  return {};
}

// ─── Attendance ─────────────────────────────────────────────────────────────

export async function setAttendance(
  eventId: string,
  registrationId: string,
  attended: boolean
): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("event_registrations").update({ attended }).eq("id", registrationId);
  revalidatePath(`/admin/registrations/${eventId}`);
}
