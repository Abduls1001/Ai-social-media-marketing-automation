import {
  POST_PLATFORMS,
  POST_STATUSES,
  type CleanedPostValues,
  type PostFormValues,
  type PostPlatform,
  type PostStatus,
} from "@/lib/supabase/post-types";

/**
 * Phase 6 — Posts.
 *
 * Validation for the post form, kept out of the `"use server"` file
 * (`lib/supabase/post-actions.ts`) alongside the types it depends on —
 * same split used for the Content Task module.
 */

/**
 * Trims all form values and validates the required field (title).
 * Everything else is optional or defaulted, matching the schema (only
 * `title` is NOT NULL besides the defaulted enum columns on
 * `public.posts`).
 */
export function validatePostFormValues(values: PostFormValues): {
  cleaned: CleanedPostValues | null;
  error: string | null;
} {
  const title = values.title.trim();

  if (!title) {
    return { cleaned: null, error: "Title is required." };
  }

  const platform = values.platform.trim().toLowerCase();
  const safePlatform: PostPlatform = (
    POST_PLATFORMS as readonly string[]
  ).includes(platform)
    ? (platform as PostPlatform)
    : "instagram";

  const status = values.status.trim().toLowerCase();
  const safeStatus: PostStatus = (
    POST_STATUSES as readonly string[]
  ).includes(status)
    ? (status as PostStatus)
    : "draft";

  const caption = values.caption.trim();
  const scheduledDate = values.scheduled_date.trim();

  return {
    cleaned: {
      title,
      caption: caption.length > 0 ? caption : null,
      platform: safePlatform,
      status: safeStatus,
      scheduled_date: scheduledDate.length > 0 ? scheduledDate : null,
    },
    error: null,
  };
}
