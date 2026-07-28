"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES } from "@/lib/constants";
import type { Agency } from "@/types";

/**
 * Phase 2.5 — Agency Setup (Create / Edit Agency).
 *
 * Server Actions for writing to `public.agencies`. Kept in a separate
 * "use server" module from `lib/supabase/agencies.ts` (which stays
 * read-only and is called directly from Server Components) so that the
 * write path can be invoked from the client-side agency form without
 * pulling a browser Supabase client into the same module as the
 * server-only one.
 */

export interface AgencyFormValues {
  agency_name: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  timezone: string;
}

export interface SaveAgencyResult {
  agency: Agency | null;
  error: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Trims all form values and validates them. Returns the cleaned values on
 * success, or a field-agnostic error message on failure. Kept intentionally
 * simple (single error message) to match the scope of Phase 2.5.
 */
function validate(values: AgencyFormValues): {
  cleaned: AgencyFormValues | null;
  error: string | null;
} {
  const cleaned: AgencyFormValues = {
    agency_name: values.agency_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    website: values.website.trim(),
    country: values.country.trim(),
    timezone: values.timezone.trim(),
  };

  if (!cleaned.agency_name) {
    return { cleaned: null, error: "Agency name is required." };
  }

  if (!cleaned.email) {
    return { cleaned: null, error: "Email is required." };
  }

  if (!EMAIL_PATTERN.test(cleaned.email)) {
    return { cleaned: null, error: "Enter a valid email address." };
  }

  if (!cleaned.phone) {
    return { cleaned: null, error: "Phone is required." };
  }

  if (!cleaned.website) {
    return { cleaned: null, error: "Website is required." };
  }

  if (!cleaned.country) {
    return { cleaned: null, error: "Country is required." };
  }

  if (!cleaned.timezone) {
    return { cleaned: null, error: "Time zone is required." };
  }

  return { cleaned, error: null };
}

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return user.id;
}

/**
 * Creates the agency workspace for the current user. Fails if the user
 * already has one (enforced by the `agencies_user_id_key` unique index).
 */
export async function createAgency(
  values: AgencyFormValues
): Promise<SaveAgencyResult> {
  const { cleaned, error: validationError } = validate(values);

  if (validationError || !cleaned) {
    return { agency: null, error: validationError };
  }

  const userId = await getAuthenticatedUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agencies")
    .insert({ user_id: userId, ...cleaned })
    .select()
    .single();

  if (error) {
    return { agency: null, error: error.message };
  }

  return { agency: data, error: null };
}

/**
 * Updates the agency workspace belonging to the current user.
 */
export async function updateAgency(
  values: AgencyFormValues
): Promise<SaveAgencyResult> {
  const { cleaned, error: validationError } = validate(values);

  if (validationError || !cleaned) {
    return { agency: null, error: validationError };
  }

  const userId = await getAuthenticatedUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agencies")
    .update(cleaned)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { agency: null, error: error.message };
  }

  return { agency: data, error: null };
}
