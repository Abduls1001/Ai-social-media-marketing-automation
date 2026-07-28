import type { ContentTask } from "@/types";

/**
 * Phase 5 — Content Task Management.
 *
 * Types, interfaces, and constants for the content task form/actions.
 * Kept out of `lib/supabase/content-task-actions.ts` because a
 * `"use server"` file may only export async functions — same split used
 * for the Campaign module (`lib/supabase/campaign-types.ts`).
 */

export const CONTENT_TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "done",
] as const;
export type ContentTaskStatus = (typeof CONTENT_TASK_STATUSES)[number];

export const CONTENT_TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;
export type ContentTaskPriority = (typeof CONTENT_TASK_PRIORITIES)[number];

export const CONTENT_TASK_PLATFORMS = [
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "x",
  "youtube",
  "blog",
] as const;
export type ContentTaskPlatform = (typeof CONTENT_TASK_PLATFORMS)[number];

export const CONTENT_TASK_TYPES = [
  "post",
  "reel",
  "carousel",
  "story",
  "short_video",
  "blog",
] as const;
export type ContentTaskType = (typeof CONTENT_TASK_TYPES)[number];

export interface ContentTaskFormValues {
  title: string;
  description: string;
  platform: string;
  content_type: string;
  priority: string;
  status: string;
  due_date: string;
}

export interface SaveContentTaskResult {
  contentTask: ContentTask | null;
  error: string | null;
}

export interface DeleteContentTaskResult {
  success: boolean;
  error: string | null;
}

/** Values after trimming and defaulting, ready to write to the database. */
export interface CleanedContentTaskValues {
  title: string;
  description: string | null;
  platform: ContentTaskPlatform;
  content_type: ContentTaskType;
  priority: ContentTaskPriority;
  status: ContentTaskStatus;
  due_date: string | null;
}
