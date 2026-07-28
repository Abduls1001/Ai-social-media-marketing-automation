import { createClient } from "@/lib/supabase/server";
import type { ContentTask } from "@/types";

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
