import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types";

export interface GetClientsForAgencyResult {
  clients: Client[];
  error: string | null;
}

/**
 * Fetches all clients belonging to the given agency, most recently
 * created first.
 *
 * Read-only — create/update/delete live in lib/supabase/client-actions.ts.
 * Returns `{ clients: [], error: null }` when the agency has no clients
 * yet (a normal, expected state, not an error).
 */
export async function getClientsForAgency(
  agencyId: number
): Promise<GetClientsForAgencyResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      return { clients: [], error: error.message };
    }

    return { clients: data ?? [], error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching clients.";

    return { clients: [], error: message };
  }
}
