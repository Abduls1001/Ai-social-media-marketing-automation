import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/types";

export interface GetCampaignsForClientResult {
  campaigns: Campaign[];
  error: string | null;
}

/**
 * Fetches all campaigns belonging to the given client, most recently
 * created first.
 *
 * Read-only — create/update/delete live in
 * lib/supabase/campaign-actions.ts. Returns `{ campaigns: [], error: null }`
 * when the client has no campaigns yet (a normal, expected state, not an
 * error).
 */
export async function getCampaignsForClient(
  clientId: number
): Promise<GetCampaignsForClientResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      return { campaigns: [], error: error.message };
    }

    return { campaigns: data ?? [], error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching campaigns.";

    return { campaigns: [], error: message };
  }
}
