import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Route Handlers and
 * Server Actions. In Next 16 `cookies()` is async, so this helper is too.
 *
 * Reads (Server Components) work fine; writes to cookies only succeed from a
 * Server Action or Route Handler — the try/catch swallows the "can't set
 * cookies from a Server Component" error, which is safe because the session is
 * kept fresh by the middleware (see src/lib/supabase/middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore. Middleware refreshes it.
          }
        },
      },
    }
  );
}
