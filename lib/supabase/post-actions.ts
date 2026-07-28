"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES } from "@/lib/constants";
import { validatePostFormValues } from "@/lib/supabase/post-validation";
import type {
  DeletePostResult,
  PostFormValues,
  SavePostResult,
} from "@/lib/supabase/post-types";

/**
 * Phase 6 — Posts.
 *
 * Server Actions for writing to `public.posts`. Kept in a separate
 * "use server" module from `lib/supabase/posts.ts` (read-only, called
 * from Server Components) — same split used for the Content Task module
 * in lib/supabase/content-task-actions.ts, and for the same reason:
 * keeps the server-only Supabase client out of any client-component
 * bundle.
 *
 * IMPORTANT: a "use server" file may only export async functions.
 * Types, interfaces, and constants live in `post-types.ts`, and
 * validation lives in `post-validation.ts` — nothing else should be
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
 * Confirms the given content task belongs to a campaign belonging to a
 * client belonging to an agency owned by the current user before any
 * write. RLS enforces this too, but this gives a clear error message
 * instead of a bare Postgres permission failure.
 *
 * Done as four plain queries (rather than a PostgREST embedded/joined
 * select) so this doesn't depend on a foreign key relationship being
 * registered in PostgREST's schema cache — matching the simple
 * single-table query style used in `assertCampaignOwnership`
 * (`content-task-actions.ts`), extended one hop further for the extra
 * level in the ownership chain
 * (post -> content task -> campaign -> client -> agency).
 */
async function assertContentTaskOwnership(contentTaskId: number): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const userId = await requireAuthenticatedUserId();
  const supabase = await createClient();

  const { data: contentTask, error: contentTaskError } = await supabase
    .from("content_tasks")
    .select("campaign_id")
    .eq("id", contentTaskId)
    .maybeSingle();

  if (contentTaskError) {
    return { ok: false, error: contentTaskError.message };
  }

  if (!contentTask) {
    return { ok: false, error: "Content task not found." };
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("client_id")
    .eq("id", contentTask.campaign_id)
    .maybeSingle();

  if (campaignError) {
    return { ok: false, error: campaignError.message };
  }

  if (!campaign) {
    return { ok: false, error: "Content task not found." };
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
    return { ok: false, error: "Content task not found." };
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
    return { ok: false, error: "Content task not found for the current user." };
  }

  return { ok: true, error: null };
}

/**
 * Checks whether another post with the same title (case-insensitive)
 * already exists for this content task. Pass `excludePostId` when
 * editing so the post being edited doesn't collide with itself.
 */
async function findDuplicatePostTitle(
  contentTaskId: number,
  title: string,
  excludePostId?: number
): Promise<{ isDuplicate: boolean; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("id")
    .eq("content_task_id", contentTaskId)
    .ilike("title", title);

  if (excludePostId) {
    query = query.neq("id", excludePostId);
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
 * Creates a new post for the given content task.
 */
export async function createPostRecord(
  contentTaskId: number,
  values: PostFormValues
): Promise<SavePostResult> {
  const { cleaned, error: validationError } = validatePostFormValues(values);

  if (validationError || !cleaned) {
    return { post: null, error: validationError };
  }

  const ownership = await assertContentTaskOwnership(contentTaskId);
  if (!ownership.ok) {
    return { post: null, error: ownership.error };
  }

  const duplicate = await findDuplicatePostTitle(contentTaskId, cleaned.title);
  if (duplicate.error) {
    return { post: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      post: null,
      error: "A post with this title already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .insert({ content_task_id: contentTaskId, ...cleaned })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        post: null,
        error: "A post with this title already exists.",
      };
    }
    return { post: null, error: error.message };
  }

  return { post: data, error: null };
}

/**
 * Updates an existing post. `contentTaskId` is re-checked for ownership
 * so a post can never be reassigned outside the current user's content
 * task.
 */
export async function updatePostRecord(
  postId: number,
  contentTaskId: number,
  values: PostFormValues
): Promise<SavePostResult> {
  const { cleaned, error: validationError } = validatePostFormValues(values);

  if (validationError || !cleaned) {
    return { post: null, error: validationError };
  }

  const ownership = await assertContentTaskOwnership(contentTaskId);
  if (!ownership.ok) {
    return { post: null, error: ownership.error };
  }

  const duplicate = await findDuplicatePostTitle(
    contentTaskId,
    cleaned.title,
    postId
  );
  if (duplicate.error) {
    return { post: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      post: null,
      error: "A post with this title already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .update(cleaned)
    .eq("id", postId)
    .eq("content_task_id", contentTaskId)
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        post: null,
        error: "A post with this title already exists.",
      };
    }
    return { post: null, error: error.message };
  }

  return { post: data, error: null };
}

/**
 * Deletes a post belonging to the given content task.
 */
export async function deletePostRecord(
  postId: number,
  contentTaskId: number
): Promise<DeletePostResult> {
  const ownership = await assertContentTaskOwnership(contentTaskId);
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("content_task_id", contentTaskId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
