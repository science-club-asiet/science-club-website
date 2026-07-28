import { createClient } from "@supabase/supabase-js";

/**
 * Cookieless anon Supabase client for reading PUBLIC content in Server
 * Components (events, execom, posts, site copy). Because it carries no auth
 * cookie, pages that use it can be statically rendered / ISR-cached — unlike
 * the cookie-based server client, which forces dynamic rendering.
 *
 * RLS still applies: the anon role only sees published rows.
 * For member/admin reads (own registrations, admin lists) use the cookie
 * client in ./server.ts instead.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
