"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES } from "@/lib/constants";
import { validateContentTaskFormValues } from "@/lib/supabase/content-task-validation";
import type {
  ContentTaskFormValues,
  DeleteContentTaskResult,
  SaveContentTaskResult,
} from "@/lib/supabase/content-task-types";

/**
 * Phase 5 — Content Task Management.
 *
 * Server Actions for writing to `public.content_tasks`. Kept in a
 * separate "use server" module from `lib/supabase/content-tasks.ts`
 * (read-only, called from Server Components) — same split used for the
 * Campaign module in lib/supabase/campaign-actions.ts, and for the same
 * reason: keeps the server-only Supabase client out of any client-
 * component bundle.
 *
 * IMPORTANT: a "use server" file may only export async functions.
 * Types, interfaces, and constants live in `content-task-types.ts`, and
 * validation lives in `content-task-validation.ts` — nothing else should
 * be exported from this file besides the three Server Actions below.
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
 * Confirms the given campaign belongs to a client belonging to an agency
 * owned by the current user before any write. RLS enforces this too, but
 * this gives a clear error message instead of a bare Postgres permission
 * failure.
 *
 * Done as three plain queries (rather than a PostgREST embedded/joined
 * select) so this doesn't depend on a foreign key relationship being
 * registered in PostgREST's schema cache — matching the simple
 * single-table query style used in `assertClientOwnership`
 * (`campaign-actions.ts`), extended one hop further for the extra level
 * in the ownership chain (content task -> campaign -> client -> agency).
 */
async function assertCampaignOwnership(campaignId: number): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const userId = await requireAuthenticatedUserId();
  const supabase = await createClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("client_id")
    .eq("id", campaignId)
    .maybeSingle();

  if (campaignError) {
    return { ok: false, error: campaignError.message };
  }

  if (!campaign) {
    return { ok: false, error: "Campaign not found." };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("agency_id")
    .eq("id", campaign.client_id)
    .maybeSingle();

  if (clientError) {
    return { ok: false, error: clientError.message };
  }

  if (!client) {
    return { ok: false, error: "Campaign not found." };
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
    return { ok: false, error: "Campaign not found for the current user." };
  }

  return { ok: true, error: null };
}

/**
 * Checks whether another content task with the same title
 * (case-insensitive) already exists for this campaign. Pass
 * `excludeContentTaskId` when editing so the task being edited doesn't
 * collide with itself.
 */
async function findDuplicateContentTaskTitle(
  campaignId: number,
  title: string,
  excludeContentTaskId?: number
): Promise<{ isDuplicate: boolean; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("content_tasks")
    .select("id")
    .eq("campaign_id", campaignId)
    .ilike("title", title);

  if (excludeContentTaskId) {
    query = query.neq("id", excludeContentTaskId);
  }

  const { data, error } = await query;

  if (error) {
    return { isDuplicate: false, error: error.message };
  }

  return { isDuplicate: (data?.length ?? 0) > 0, error: null };
}

/** Postgres unique_violation error code, for the duplicate-title safety net. */
const UNIQUE_VIOLATION = "23505";

/**
 * Creates a new content task for the given campaign.
 */
export async function createContentTaskRecord(
  campaignId: number,
  values: ContentTaskFormValues
): Promise<SaveContentTaskResult> {
  const { cleaned, error: validationError } =
    validateContentTaskFormValues(values);

  if (validationError || !cleaned) {
    return { contentTask: null, error: validationError };
  }

  const ownership = await assertCampaignOwnership(campaignId);
  if (!ownership.ok) {
    return { contentTask: null, error: ownership.error };
  }

  const duplicate = await findDuplicateContentTaskTitle(
    campaignId,
    cleaned.title
  );
  if (duplicate.error) {
    return { contentTask: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      contentTask: null,
      error: "A content task with this title already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_tasks")
    .insert({ campaign_id: campaignId, ...cleaned })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        contentTask: null,
        error: "A content task with this title already exists.",
      };
    }
    return { contentTask: null, error: error.message };
  }

  return { contentTask: data, error: null };
}

/**
 * Updates an existing content task. `campaignId` is re-checked for
 * ownership so a content task can never be reassigned outside the
 * current user's campaign.
 */
export async function updateContentTaskRecord(
  contentTaskId: number,
  campaignId: number,
  values: ContentTaskFormValues
): Promise<SaveContentTaskResult> {
  const { cleaned, error: validationError } =
    validateContentTaskFormValues(values);

  if (validationError || !cleaned) {
    return { contentTask: null, error: validationError };
  }

  const ownership = await assertCampaignOwnership(campaignId);
  if (!ownership.ok) {
    return { contentTask: null, error: ownership.error };
  }

  const duplicate = await findDuplicateContentTaskTitle(
    campaignId,
    cleaned.title,
    contentTaskId
  );
  if (duplicate.error) {
    return { contentTask: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      contentTask: null,
      error: "A content task with this title already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_tasks")
    .update(cleaned)
    .eq("id", contentTaskId)
    .eq("campaign_id", campaignId)
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        contentTask: null,
        error: "A content task with this title already exists.",
      };
    }
    return { contentTask: null, error: error.message };
  }

  return { contentTask: data, error: null };
}

/**
 * Deletes a content task belonging to the given campaign.
 */
export async function deleteContentTaskRecord(
  contentTaskId: number,
  campaignId: number
): Promise<DeleteContentTaskResult> {
  const ownership = await assertCampaignOwnership(campaignId);
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("content_tasks")
    .delete()
    .eq("id", contentTaskId)
    .eq("campaign_id", campaignId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
