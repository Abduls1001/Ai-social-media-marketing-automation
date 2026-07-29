"use server";

import { createClient } from "@/lib/supabase/server";
import { assertContentTaskOwnership } from "@/lib/supabase/post-actions";
import { getPostById } from "@/lib/supabase/posts";
import { getContentTaskById } from "@/lib/supabase/content-tasks";
import { getCampaignById } from "@/lib/supabase/campaigns";
import { getClientById } from "@/lib/supabase/clients";
import { generateCaptionWithAI } from "@/lib/ai/caption-service";
import type { SavePostResult } from "@/lib/supabase/post-types";

/**
 * Phase 7 — AI Content Generation.
 *
 * Server Action backing the Posts module's "Generate AI Caption" /
 * "Regenerate Caption" button. Same "use server" file may only export
 * async functions" rule as every other `*-actions.ts` file in this
 * project — this file exports exactly one Server Action.
 *
 * No duplicated logic:
 * - Ownership is checked with `assertContentTaskOwnership`, the exact
 *   same function `createPostRecord` / `updatePostRecord` /
 *   `deletePostRecord` use (imported from `post-actions.ts`).
 * - Related data is assembled with the existing read-only lookups
 *   (`getPostById`, `getContentTaskById`, `getCampaignById`,
 *   `getClientById`) — no new queries duplicate what those already do.
 * - The Gemini call itself lives in `lib/ai/caption-service.ts`, the
 *   single AI service used by the whole app.
 *
 * Writes straight to the existing `posts.caption` column — no new
 * table, no new column.
 */
export async function generateAiCaptionForPost(
  postId: number,
  contentTaskId: number
): Promise<SavePostResult> {
  const ownership = await assertContentTaskOwnership(contentTaskId);
  if (!ownership.ok) {
    return { post: null, error: ownership.error };
  }

  const { post, error: postError } = await getPostById(postId);
  if (postError) {
    return { post: null, error: postError };
  }
  if (!post || post.content_task_id !== contentTaskId) {
    return { post: null, error: "Post not found." };
  }

  const { contentTask, error: contentTaskError } =
    await getContentTaskById(contentTaskId);
  if (contentTaskError) {
    return { post: null, error: contentTaskError };
  }
  if (!contentTask) {
    return { post: null, error: "Content task not found." };
  }

  const { campaign, error: campaignError } = await getCampaignById(
    contentTask.campaign_id
  );
  if (campaignError) {
    return { post: null, error: campaignError };
  }

  // Client is one hop further than the post's own ownership chain
  // requires, so a missing/errored client is treated as "no extra
  // context" rather than a hard failure — the caption can still be
  // generated from the post/content task/campaign alone.
  let clientName: string | null = null;
  let clientIndustry: string | null = null;

  if (campaign) {
    const { client } = await getClientById(campaign.client_id);
    if (client) {
      clientName = client.client_name;
      clientIndustry = client.industry;
    }
  }

  const { caption, error: aiError } = await generateCaptionWithAI({
    postTitle: post.title,
    platform: post.platform,
    contentTaskTitle: contentTask.title,
    contentTaskDescription: contentTask.description,
    contentType: contentTask.content_type,
    priority: contentTask.priority,
    campaignName: campaign?.campaign_name ?? null,
    campaignObjective: campaign?.objective ?? null,
    clientName,
    clientIndustry,
  });

  if (aiError || !caption) {
    return {
      post: null,
      error: aiError ?? "Failed to generate a caption.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .update({ caption })
    .eq("id", postId)
    .eq("content_task_id", contentTaskId)
    .select()
    .single();

  if (error) {
    return { post: null, error: error.message };
  }

  return { post: data, error: null };
}
