import type { Post } from "@/types";

/**
 * Phase 6 — Posts.
 *
 * Types, interfaces, and constants for the post form/actions. Kept out
 * of `lib/supabase/post-actions.ts` because a `"use server"` file may
 * only export async functions — same split used for the Content Task
 * module (`lib/supabase/content-task-types.ts`).
 */

export const POST_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "cancelled",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_PLATFORMS = [
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "x",
  "youtube",
  "blog",
] as const;
export type PostPlatform = (typeof POST_PLATFORMS)[number];

export interface PostFormValues {
  title: string;
  caption: string;
  platform: string;
  status: string;
  scheduled_date: string;
}

export interface SavePostResult {
  post: Post | null;
  error: string | null;
}

export interface DeletePostResult {
  success: boolean;
  error: string | null;
}

/** Values after trimming and defaulting, ready to write to the database. */
export interface CleanedPostValues {
  title: string;
  caption: string | null;
  platform: PostPlatform;
  status: PostStatus;
  scheduled_date: string | null;
}
