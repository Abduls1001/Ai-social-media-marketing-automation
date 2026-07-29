import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types";

export interface GetPostByIdResult {
  post: Post | null;
  error: string | null;
}

/**
 * Fetches a single post by id. Used by the AI caption Server Action
 * (`lib/supabase/post-ai-actions.ts`) to load the post it's generating
 * a caption for — same precedent as `getContentTaskById`,
 * `getCampaignById`, and `getClientById` added for the pages above this
 * one in the hierarchy.
 *
 * Returns `{ post: null, error: null }` when no post matches the id
 * (not treated as an error — the caller decides how to handle "not
 * found").
 */
export async function getPostById(
  postId: number
): Promise<GetPostByIdResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error) {
      return { post: null, error: error.message };
    }

    return { post: data ?? null, error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching the post.";

    return { post: null, error: message };
  }
}

export interface GetPostsForContentTaskResult {
  posts: Post[];
  error: string | null;
}

/**
 * Fetches all posts belonging to the given content task, most recently
 * created first.
 *
 * Read-only — create/update/delete live in lib/supabase/post-actions.ts.
 * Returns `{ posts: [], error: null }` when the content task has no
 * posts yet (a normal, expected state, not an error).
 */
export async function getPostsForContentTask(
  contentTaskId: number
): Promise<GetPostsForContentTaskResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("content_task_id", contentTaskId)
      .order("created_at", { ascending: false });

    if (error) {
      return { posts: [], error: error.message };
    }

    return { posts: data ?? [], error: null };
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unknown error while fetching posts.";

    return { posts: [], error: message };
  }
}
