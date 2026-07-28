import {
  CONTENT_TASK_PLATFORMS,
  CONTENT_TASK_PRIORITIES,
  CONTENT_TASK_STATUSES,
  CONTENT_TASK_TYPES,
  type CleanedContentTaskValues,
  type ContentTaskFormValues,
  type ContentTaskPlatform,
  type ContentTaskPriority,
  type ContentTaskStatus,
  type ContentTaskType,
} from "@/lib/supabase/content-task-types";

/**
 * Phase 5 — Content Task Management.
 *
 * Validation for the content task form, kept out of the `"use server"`
 * file (`lib/supabase/content-task-actions.ts`) alongside the types it
 * depends on — same split used for the Campaign module.
 */

/**
 * Trims all form values and validates the required field (title).
 * Everything else is optional or defaulted, matching the schema (only
 * `title` is NOT NULL besides the defaulted enum columns on
 * `public.content_tasks`).
 */
export function validateContentTaskFormValues(
  values: ContentTaskFormValues
): {
  cleaned: CleanedContentTaskValues | null;
  error: string | null;
} {
  const title = values.title.trim();

  if (!title) {
    return { cleaned: null, error: "Title is required." };
  }

  const platform = values.platform.trim().toLowerCase();
  const safePlatform: ContentTaskPlatform = (
    CONTENT_TASK_PLATFORMS as readonly string[]
  ).includes(platform)
    ? (platform as ContentTaskPlatform)
    : "instagram";

  const contentType = values.content_type.trim().toLowerCase();
  const safeContentType: ContentTaskType = (
    CONTENT_TASK_TYPES as readonly string[]
  ).includes(contentType)
    ? (contentType as ContentTaskType)
    : "post";

  const priority = values.priority.trim().toLowerCase();
  const safePriority: ContentTaskPriority = (
    CONTENT_TASK_PRIORITIES as readonly string[]
  ).includes(priority)
    ? (priority as ContentTaskPriority)
    : "medium";

  const status = values.status.trim().toLowerCase();
  const safeStatus: ContentTaskStatus = (
    CONTENT_TASK_STATUSES as readonly string[]
  ).includes(status)
    ? (status as ContentTaskStatus)
    : "todo";

  const description = values.description.trim();
  const dueDate = values.due_date.trim();

  return {
    cleaned: {
      title,
      description: description.length > 0 ? description : null,
      platform: safePlatform,
      content_type: safeContentType,
      priority: safePriority,
      status: safeStatus,
      due_date: dueDate.length > 0 ? dueDate : null,
    },
    error: null,
  };
}
