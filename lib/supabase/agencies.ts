import { createClient } from "@/lib/supabase/server";
import type { Agency } from "@/types";

export interface GetAgencyForUserResult {
  agency: Agency | null;
  error: string | null;
}

/**
 * Fetches the agency workspace belonging to the given authenticated user.
 *
 * Read-only for Part 2.4A — create/update/delete are not implemented here.
 * Returns `{ agency: null, error: null }` when the user has no agency yet
 * (this is a normal, expected state, not an error).
 */
export async function getAgencyForUser(
  userId: string
): Promise<GetAgencyForUserResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("agencies")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return { agency: null, error: error.message };
    }

    return { agency: data, error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching the agency workspace.";

    return { agency: null, error: message };
  }
}
