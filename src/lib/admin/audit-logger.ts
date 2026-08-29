import { requireAdmin } from "@/lib/admin/auth";

export type ProfileChange = {
  field: string;
  from: string | null;
  to: string | null;
};

export type AuditLogPayload = {
  adminEmail: string;
  adminId: string;
  targetId: string;
  targetName: string;
  action: "UPDATE_PROFILE" | "GRANT_PREMIUM" | "REVOKE_PREMIUM" | "CHANGE_ROLE" | "UPDATE_TAGS";
  summary: string;
  changes: ProfileChange[];
};

export async function recordProfileAuditLog(payload: AuditLogPayload) {
  try {
    const { supabase, user } = await requireAdmin();
    await supabase.from("tasks").insert({
      title: JSON.stringify(payload),
      entity_type: "profile_audit",
      entity_id: payload.targetId,
      created_by: user.id,
      is_completed: true,
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

export type ParsedAuditLog = {
  id: string;
  createdAt: string;
  adminEmail: string;
  adminId: string;
  targetId: string;
  targetName: string;
  action: string;
  summary: string;
  changes: ProfileChange[];
};

export async function getProfileAuditLogs(profileId: string): Promise<ParsedAuditLog[]> {
  try {
    const { supabase } = await requireAdmin();
    const { data } = await supabase
      .from("tasks")
      .select("id, title, created_at, created_by")
      .eq("entity_type", "profile_audit")
      .eq("entity_id", profileId)
      .order("created_at", { ascending: false });

    if (!data) return [];

    return data.map((row) => {
      try {
        const parsed = JSON.parse(row.title) as AuditLogPayload;
        return {
          id: row.id,
          createdAt: row.created_at,
          adminEmail: parsed.adminEmail || "Admin",
          adminId: parsed.adminId || row.created_by || "",
          targetId: parsed.targetId,
          targetName: parsed.targetName || "Member",
          action: parsed.action,
          summary: parsed.summary,
          changes: parsed.changes || [],
        };
      } catch {
        return {
          id: row.id,
          createdAt: row.created_at,
          adminEmail: "Admin",
          adminId: row.created_by || "",
          targetId: profileId,
          targetName: "Member",
          action: "EDIT_MEMBER",
          summary: row.title,
          changes: [],
        };
      }
    });
  } catch (err) {
    console.error("Failed to fetch profile audit logs:", err);
    return [];
  }
}
