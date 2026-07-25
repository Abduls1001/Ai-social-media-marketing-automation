import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types";

/**
 * Creates a Supabase client for use on the server (Server Components,
 * Server Actions, Route Handlers). Reads and writes auth cookies via
 * Next.js' cookies() API.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
            // `setAll` was called from a Server Component that cannot set
            // cookies. This is safe to ignore as long as middleware is
            // refreshing the user session (see lib/supabase/middleware.ts).
          }
        },
      },
    }
  );
}
