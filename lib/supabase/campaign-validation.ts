import {
  CAMPAIGN_STATUSES,
  type CampaignFormValues,
  type CampaignStatus,
  type CleanedCampaignValues,
} from "@/lib/supabase/campaign-types";

/**
 * Phase 4 — Campaign Management.
 *
 * Validation for the campaign form, kept out of the `"use server"` file
 * (`lib/supabase/campaign-actions.ts`) alongside the types it depends
 * on — same split used for the Client module.
 */

/**
 * Trims all form values and validates the required field
 * (campaign_name). Everything else is optional, matching the schema
 * (only campaign_name and status are NOT NULL on public.campaigns).
 */
export function validateCampaignFormValues(values: CampaignFormValues): {
  cleaned: CleanedCampaignValues | null;
  error: string | null;
} {
  const campaignName = values.campaign_name.trim();

  if (!campaignName) {
    return { cleaned: null, error: "Campaign name is required." };
  }

  const status = values.status.trim().toLowerCase();
  const safeStatus: CampaignStatus = (
    CAMPAIGN_STATUSES as readonly string[]
  ).includes(status)
    ? (status as CampaignStatus)
    : "planning";

  const asNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    cleaned: {
      campaign_name: campaignName,
      objective: asNullable(values.objective),
      platform: asNullable(values.platform),
      status: safeStatus,
      start_date: asNullable(values.start_date),
      end_date: asNullable(values.end_date),
    },
    error: null,
  };
}
