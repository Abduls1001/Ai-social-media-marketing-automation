import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types";

export interface GetClientByIdResult {
  client: Client | null;
  error: string | null;
}

/**
 * Fetches a single client by id. Used by the Campaigns page to resolve
 * which client's campaigns to show from the `?client=` query param.
 *
 * Returns `{ client: null, error: null }` when no client matches the id
 * (not treated as an error — the caller decides how to handle "not
 * found", e.g. showing a "select a client" state).
 */
export async function getClientById(
  clientId: number
): Promise<GetClientByIdResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (error) {
      return { client: null, error: error.message };
    }

    return { client: data ?? null, error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching the client.";

    return { client: null, error: message };
  }
}

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
