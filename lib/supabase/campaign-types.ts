import type { Campaign } from "@/types";

/**
 * Phase 4 — Campaign Management.
 *
 * Types, interfaces, and constants for the campaign form/actions. Kept
 * out of `lib/supabase/campaign-actions.ts` because a `"use server"`
 * file may only export async functions — same split used for the
 * Client module (`lib/supabase/client-types.ts`).
 */

export const CAMPAIGN_STATUSES = [
  "planning",
  "active",
  "paused",
  "completed",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface CampaignFormValues {
  campaign_name: string;
  objective: string;
  platform: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface SaveCampaignResult {
  campaign: Campaign | null;
  error: string | null;
}

export interface DeleteCampaignResult {
  success: boolean;
  error: string | null;
}

/** Values after trimming and defaulting, ready to write to the database. */
export interface CleanedCampaignValues {
  campaign_name: string;
  objective: string | null;
  platform: string | null;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
}
