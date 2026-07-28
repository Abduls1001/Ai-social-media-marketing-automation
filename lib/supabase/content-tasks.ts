import { createClient } from "@/lib/supabase/server";
import type { ContentTask } from "@/types";

export interface GetContentTaskByIdResult {
  contentTask: ContentTask | null;
  error: string | null;
}

/**
 * Fetches a single content task by id. Used by the Posts page to resolve
 * which content task's posts to show from the `?contentTask=` query
 * param — same precedent as `getCampaignById` (added for the Content
 * Tasks page) and `getClientById` (added for the Campaigns page).
 *
 * Returns `{ contentTask: null, error: null }` when no content task
 * matches the id (not treated as an error — the caller decides how to
 * handle "not found", e.g. showing a "select a content task" state).
 */
export async function getContentTaskById(
  contentTaskId: number
): Promise<GetContentTaskByIdResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("content_tasks")
      .select("*")
      .eq("id", contentTaskId)
      .maybeSingle();

    if (error) {
      return { contentTask: null, error: error.message };
    }

    return { contentTask: data ?? null, error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching the content task.";

    return { contentTask: null, error: message };
  }
}

export interface GetContentTasksForCampaignResult {
  contentTasks: ContentTask[];
  error: string | null;
}

/**
 * Fetches all content tasks belonging to the given campaign, most
 * recently created first.
 *
 * Read-only — create/update/delete live in
 * lib/supabase/content-task-actions.ts. Returns
 * `{ contentTasks: [], error: null }` when the campaign has no content
 * tasks yet (a normal, expected state, not an error).
 */
export async function getContentTasksForCampaign(
  campaignId: number
): Promise<GetContentTasksForCampaignResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("content_tasks")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) {
      return { contentTasks: [], error: error.message };
    }

    return { contentTasks: data ?? [], error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching content tasks.";

    return { contentTasks: [], error: message };
  }
}
