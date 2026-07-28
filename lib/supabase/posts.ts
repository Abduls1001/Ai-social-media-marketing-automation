import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types";

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
