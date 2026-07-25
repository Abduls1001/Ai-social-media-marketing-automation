import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types";

/**
 * Creates a Supabase client for use in the browser (Client Components).
 *
 * Only call this inside event handlers or effects, never at module scope,
 * so it is never evaluated during server-side rendering.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
