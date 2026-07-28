import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and gates the /admin
 * area behind a logged-in user. Wired up from the root middleware.ts.
 *
 * Before env keys are configured this is a no-op, so the public site keeps
 * working during the migration (P0) without a Supabase project.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No Supabase configured yet → don't touch anything.
  if (!url || !anonKey) return supabaseResponse;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: getUser() revalidates the token and refreshes the cookie.
  // Do not add code between createServerClient and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the admin area — send unauthenticated users to /login with a return path.
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
