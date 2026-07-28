import {
  CLIENT_STATUSES,
  type CleanedClientValues,
  type ClientFormValues,
  type ClientStatus,
} from "@/lib/supabase/client-types";

/**
 * Phase 3 — Client Management.
 *
 * Validation for the client form, kept out of the `"use server"` file
 * (`lib/supabase/client-actions.ts`) alongside the types it depends on.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Trims all form values and validates the required field (client_name)
 * plus email format when an email is provided. Everything else is
 * optional, matching the schema (only client_name and status are
 * NOT NULL on public.clients).
 */
export function validateClientFormValues(values: ClientFormValues): {
  cleaned: CleanedClientValues | null;
  error: string | null;
} {
  const clientName = values.client_name.trim();
  const email = values.email.trim();

  if (!clientName) {
    return { cleaned: null, error: "Client name is required." };
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    return { cleaned: null, error: "Enter a valid email address." };
  }

  const status = values.status.trim().toLowerCase();
  const safeStatus: ClientStatus = (
    CLIENT_STATUSES as readonly string[]
  ).includes(status)
    ? (status as ClientStatus)
    : "active";

  const asNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    cleaned: {
      client_name: clientName,
      company_name: asNullable(values.company_name),
      email: email.length > 0 ? email : null,
      phone: asNullable(values.phone),
      website: asNullable(values.website),
      industry: asNullable(values.industry),
      status: safeStatus,
      notes: asNullable(values.notes),
    },
    error: null,
  };
}
