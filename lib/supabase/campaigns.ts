import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/types";

export interface GetCampaignByIdResult {
  campaign: Campaign | null;
  error: string | null;
}

/**
 * Fetches a single campaign by id. Used by the Content Tasks page to
 * resolve which campaign's content tasks to show from the `?campaign=`
 * query param.
 *
 * Returns `{ campaign: null, error: null }` when no campaign matches the
 * id (not treated as an error — the caller decides how to handle "not
 * found", e.g. showing a "select a campaign" state).
 */
export async function getCampaignById(
  campaignId: number
): Promise<GetCampaignByIdResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();

    if (error) {
      return { campaign: null, error: error.message };
    }

    return { campaign: data ?? null, error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching the campaign.";

    return { campaign: null, error: message };
  }
}

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
