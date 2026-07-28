"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES } from "@/lib/constants";
import { validateCampaignFormValues } from "@/lib/supabase/campaign-validation";
import type {
  CampaignFormValues,
  DeleteCampaignResult,
  SaveCampaignResult,
} from "@/lib/supabase/campaign-types";

/**
 * Phase 4 — Campaign Management.
 *
 * Server Actions for writing to `public.campaigns`. Kept in a separate
 * "use server" module from `lib/supabase/campaigns.ts` (read-only,
 * called from Server Components) — same split used for the Client
 * module in lib/supabase/client-actions.ts, and for the same reason:
 * keeps the server-only Supabase client out of any client-component
 * bundle.
 *
 * IMPORTANT: a "use server" file may only export async functions.
 * Types, interfaces, and constants live in `campaign-types.ts`, and
 * validation lives in `campaign-validation.ts` — nothing else should be
 * exported from this file besides the three Server Actions below.
 */

async function requireAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return user.id;
}

/**
 * Confirms the given client belongs to an agency owned by the current
 * user before any write. RLS enforces this too, but this gives a clear
 * error message instead of a bare Postgres permission failure.
 *
 * Done as two plain queries (rather than a PostgREST embedded/joined
 * select) so this doesn't depend on a foreign key relationship being
 * registered in PostgREST's schema cache — matching the simple
 * single-table query style used elsewhere in this codebase.
 */
async function assertClientOwnership(clientId: number): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const userId = await requireAuthenticatedUserId();
  const supabase = await createClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("agency_id")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError) {
    return { ok: false, error: clientError.message };
  }

  if (!client) {
    return { ok: false, error: "Client not found." };
  }

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .select("id")
    .eq("id", client.agency_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (agencyError) {
    return { ok: false, error: agencyError.message };
  }

  if (!agency) {
    return { ok: false, error: "Client not found for the current user." };
  }

  return { ok: true, error: null };
}

/**
 * Checks whether another campaign with the same name (case-insensitive)
 * already exists for this client. Pass `excludeCampaignId` when editing
 * so the campaign being edited doesn't collide with itself.
 */
async function findDuplicateCampaignName(
  clientId: number,
  campaignName: string,
  excludeCampaignId?: number
): Promise<{ isDuplicate: boolean; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select("id")
    .eq("client_id", clientId)
    .ilike("campaign_name", campaignName);

  if (excludeCampaignId) {
    query = query.neq("id", excludeCampaignId);
  }

  const { data, error } = await query;

  if (error) {
    return { isDuplicate: false, error: error.message };
  }

  return { isDuplicate: (data?.length ?? 0) > 0, error: null };
}

/** Postgres unique_violation error code, for the duplicate-name safety net. */
const UNIQUE_VIOLATION = "23505";

/**
 * Creates a new campaign for the given client.
 */
export async function createCampaignRecord(
  clientId: number,
  values: CampaignFormValues
): Promise<SaveCampaignResult> {
  const { cleaned, error: validationError } =
    validateCampaignFormValues(values);

  if (validationError || !cleaned) {
    return { campaign: null, error: validationError };
  }

  const ownership = await assertClientOwnership(clientId);
  if (!ownership.ok) {
    return { campaign: null, error: ownership.error };
  }

  const duplicate = await findDuplicateCampaignName(
    clientId,
    cleaned.campaign_name
  );
  if (duplicate.error) {
    return { campaign: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      campaign: null,
      error: "A campaign with this name already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({ client_id: clientId, ...cleaned })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        campaign: null,
        error: "A campaign with this name already exists.",
      };
    }
    return { campaign: null, error: error.message };
  }

  return { campaign: data, error: null };
}

/**
 * Updates an existing campaign. `clientId` is re-checked for ownership so
 * a campaign can never be reassigned outside the current user's client.
 */
export async function updateCampaignRecord(
  campaignId: number,
  clientId: number,
  values: CampaignFormValues
): Promise<SaveCampaignResult> {
  const { cleaned, error: validationError } =
    validateCampaignFormValues(values);

  if (validationError || !cleaned) {
    return { campaign: null, error: validationError };
  }

  const ownership = await assertClientOwnership(clientId);
  if (!ownership.ok) {
    return { campaign: null, error: ownership.error };
  }

  const duplicate = await findDuplicateCampaignName(
    clientId,
    cleaned.campaign_name,
    campaignId
  );
  if (duplicate.error) {
    return { campaign: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      campaign: null,
      error: "A campaign with this name already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .update(cleaned)
    .eq("id", campaignId)
    .eq("client_id", clientId)
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        campaign: null,
        error: "A campaign with this name already exists.",
      };
    }
    return { campaign: null, error: error.message };
  }

  return { campaign: data, error: null };
}

/**
 * Deletes a campaign belonging to the given client.
 */
export async function deleteCampaignRecord(
  campaignId: number,
  clientId: number
): Promise<DeleteCampaignResult> {
  const ownership = await assertClientOwnership(clientId);
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId)
    .eq("client_id", clientId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
