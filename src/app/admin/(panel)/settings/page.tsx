import { requireAdmin } from "@/lib/admin/auth";
import { SettingsShell } from "@/components/admin/settings/SettingsShell";

export const dynamic = "force-dynamic";

function getDisplayName(
  fullName?: string | null,
  email?: string | null,
  fallback: string = "User"
): string {
  if (fullName && fullName.trim().length > 0) {
    const trimmed = fullName.trim();
    // Do not display raw UUID string IDs
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed;
    }
  }

  if (email && email.trim().length > 0) {
    const handle = email.split("@")[0].replace(/[._-]/g, " ");
    return handle
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return fallback;
}

export default async function SettingsPage() {
  const { user, profile, supabase } = await requireAdmin();

  const currentAdminName = getDisplayName(profile?.full_name, user?.email, "Admin User");
  const adminRole = profile?.role ? profile.role.toUpperCase() : "ADMIN";

  const startTime = Date.now();

  // Fetch site_content, profiles, media_assets, and recent activity streams across 9 tables in parallel
  const [
    { data: siteData },
    { data: profiles },
    { data: mediaAssets },
    { data: recentEvents },
    { data: recentPosts },
    { data: recentApps },
    { data: recentMedia },
    { data: recentRegistrations },
    { data: recentForms },
    { data: recentPages },
    { data: recentSiteContent },
  ] = await Promise.all([
    supabase.from("site_content").select("*"),
    supabase
      .from("profiles")
      .select("id, full_name, email, department, year_of_study, role, is_member, created_at, tags")
      .order("created_at", { ascending: false }),
    supabase.from("media_assets").select("id, name, size, folder, created_at").order("created_at", { ascending: false }),
    supabase.from("events").select("id, title, created_at, updated_at, created_by, profiles:created_by(full_name, email, role)").order("updated_at", { ascending: false }).limit(10),
    supabase.from("posts").select("id, title, created_at, updated_at, author_id, profiles:author_id(full_name, email, role)").order("updated_at", { ascending: false }).limit(10),
    supabase.from("membership_applications").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("media_assets").select("id, name, created_at, created_by, profiles:created_by(full_name, email, role)").order("created_at", { ascending: false }).limit(10),
    supabase.from("event_registrations").select("id, registered_at, profiles:profile_id(full_name, email, role), events:event_id(title)").order("registered_at", { ascending: false }).limit(10),
    supabase.from("forms").select("id, title, created_at, updated_at").order("updated_at", { ascending: false }).limit(10),
    supabase.from("pages").select("id, title, slug, updated_at").order("updated_at", { ascending: false }).limit(10),
    supabase.from("site_content").select("key, updated_at").order("updated_at", { ascending: false }).limit(10),
  ]);

  const dbLatency = Date.now() - startTime;

  const siteMap = siteData?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {};

  // Build profile lookup map by ID
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Use the active logged-in admin for untracked system action fallbacks
  const fallbackAdminName = currentAdminName || "System Admin";

  function resolveActor(
    relProfile: unknown,
    userId: string | null | undefined,
    defaultName: string,
    defaultRole: string
  ) {
    // 1. Check direct profile map first (highest priority, has latest public.profiles full_name)
    if (userId && profileMap.has(userId)) {
      const p = profileMap.get(userId)!;
      const name = getDisplayName(p.full_name, p.email, defaultName);
      return { name, role: (p.role || defaultRole).toUpperCase() };
    }

    // 2. Check relational profile payload from foreign key join
    const raw = Array.isArray(relProfile) ? relProfile[0] : relProfile;
    if (raw && typeof raw === "object") {
      const p = raw as { full_name?: string | null; email?: string | null; role?: string };
      const name = getDisplayName(p.full_name, p.email, defaultName);
      return { name, role: (p.role || defaultRole).toUpperCase() };
    }

    return { name: defaultName, role: defaultRole.toUpperCase() };
  }

  type ActivityItem = {
    action: string;
    user: string;
    userRole?: string;
    category?: string;
    created_at: string;
  };

  // Build comprehensive dynamic activity stream across all platform entities
  const activities: ActivityItem[] = [
    ...(recentEvents ?? []).map((e) => {
      const actor = resolveActor(e.profiles, e.created_by, fallbackAdminName, adminRole);
      return {
        action: `Event Updated '${e.title}'`,
        user: actor.name,
        userRole: actor.role,
        category: "Event",
        created_at: e.updated_at || e.created_at,
      };
    }),
    ...(recentPosts ?? []).map((p) => {
      const actor = resolveActor(p.profiles, p.author_id, fallbackAdminName, adminRole);
      return {
        action: `Post Updated '${p.title}'`,
        user: actor.name,
        userRole: actor.role,
        category: "Post",
        created_at: p.updated_at || p.created_at,
      };
    }),
    ...(recentApps ?? []).map((a) => ({
      action: `Membership Application Submitted`,
      user: getDisplayName(a.full_name, a.email, "Applicant"),
      userRole: "APPLICANT",
      category: "Application",
      created_at: a.created_at,
    })),
    ...(recentMedia ?? []).map((m) => {
      const actor = resolveActor(m.profiles, m.created_by, fallbackAdminName, adminRole);
      return {
        action: `Uploaded Asset '${m.name || "File"}'`,
        user: actor.name,
        userRole: actor.role,
        category: "Media",
        created_at: m.created_at,
      };
    }),
    ...(recentRegistrations ?? []).map((reg) => {
      const p = Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles;
      const ev = Array.isArray(reg.events) ? reg.events[0] : reg.events;
      const profObj = p as { full_name?: string; email?: string } | undefined;
      const userName = getDisplayName(profObj?.full_name, profObj?.email, "Student Member");
      return {
        action: `Registered for '${(ev as { title?: string })?.title || "Event"}'`,
        user: userName,
        userRole: "MEMBER",
        category: "Registration",
        created_at: reg.registered_at,
      };
    }),
    ...(recentForms ?? []).map((f) => ({
      action: `Form Updated '${f.title}'`,
      user: fallbackAdminName,
      userRole: adminRole,
      category: "Form",
      created_at: f.updated_at || f.created_at,
    })),
    ...(recentPages ?? []).map((p) => ({
      action: `Builder Page Saved '/${p.slug || p.title}'`,
      user: fallbackAdminName,
      userRole: adminRole,
      category: "Page",
      created_at: p.updated_at,
    })),
    ...(recentSiteContent ?? []).map((sc) => ({
      action: `Updated Site Setting '${sc.key}'`,
      user: fallbackAdminName,
      userRole: adminRole,
      category: "Content",
      created_at: sc.updated_at,
    })),
    ...(profiles ?? []).map((p) => ({
      action: `New User Sign Up`,
      user: getDisplayName(p.full_name, p.email, "New User"),
      userRole: (p.role || "MEMBER").toUpperCase(),
      category: "User",
      created_at: p.created_at,
    })),
  ]
    .filter((item) => Boolean(item.created_at))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30);

  const envConfig = {
    resendConfigured: Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST),
    supabaseAuthConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    uploadThingConfigured: Boolean(process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET),
  };

  return (
    <SettingsShell
      initialSettings={siteMap}
      profiles={profiles ?? []}
      mediaAssets={mediaAssets ?? []}
      recentActivities={activities}
      dbLatency={dbLatency}
      envConfig={envConfig}
    />
  );
}

