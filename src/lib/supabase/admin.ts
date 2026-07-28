import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Use ONLY in trusted server code that must
 * do privileged work the user can't do directly, e.g. inserting an event
 * registration with a server-computed price, or exporting attendee CSVs.
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
