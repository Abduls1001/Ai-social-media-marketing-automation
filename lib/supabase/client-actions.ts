"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES } from "@/lib/constants";
import type { Client } from "@/types";

/**
 * Phase 3 — Client Management.
 *
 * Server Actions for writing to `public.clients`. Kept in a separate
 * "use server" module from `lib/supabase/clients.ts` (read-only, called
 * from Server Components) — same split used for the Agency module in
 * lib/supabase/agency-actions.ts, and for the same reason: keeps the
 * server-only Supabase client out of any client-component bundle.
 */

export const CLIENT_STATUSES = ["active", "inactive", "lead"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export interface ClientFormValues {
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  status: string;
  notes: string;
}

export interface SaveClientResult {
  client: Client | null;
  error: string | null;
}

export interface DeleteClientResult {
  success: boolean;
  error: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CleanedClientValues {
  client_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  status: ClientStatus;
  notes: string | null;
}

/**
 * Trims all form values and validates the required field (client_name)
 * plus email format when an email is provided. Everything else is
 * optional, matching the schema (only client_name and status are
 * NOT NULL on public.clients).
 */
function validate(values: ClientFormValues): {
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

async function requireAuthenticatedUserId(): Promise<string> {
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
 * Confirms the given agency belongs to the current user before any
 * write. RLS enforces this too, but this gives a clear error message
 * instead of a bare Postgres permission failure.
 */
async function assertAgencyOwnership(agencyId: number): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const userId = await requireAuthenticatedUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agencies")
    .select("id")
    .eq("id", agencyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Agency not found for the current user." };
  }

  return { ok: true, error: null };
}

/**
 * Checks whether another client with the same name (case-insensitive)
 * already exists for this agency. Pass `excludeClientId` when editing so
 * the client being edited doesn't collide with itself.
 */
async function findDuplicateClientName(
  agencyId: number,
  clientName: string,
  excludeClientId?: number
): Promise<{ isDuplicate: boolean; error: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("id")
    .eq("agency_id", agencyId)
    .ilike("client_name", clientName);

  if (excludeClientId) {
    query = query.neq("id", excludeClientId);
  }

  const { data, error } = await query;

  if (error) {
    return { isDuplicate: false, error: error.message };
  }

  return { isDuplicate: (data?.length ?? 0) > 0, error: null };
}

/** Postgres unique_violation error code, for the duplicate-name safety net. */
const UNIQUE_VIOLATION = "23505";

/**
 * Creates a new client for the given agency.
 */
export async function createClientRecord(
  agencyId: number,
  values: ClientFormValues
): Promise<SaveClientResult> {
  const { cleaned, error: validationError } = validate(values);

  if (validationError || !cleaned) {
    return { client: null, error: validationError };
  }

  const ownership = await assertAgencyOwnership(agencyId);
  if (!ownership.ok) {
    return { client: null, error: ownership.error };
  }

  const duplicate = await findDuplicateClientName(
    agencyId,
    cleaned.client_name
  );
  if (duplicate.error) {
    return { client: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      client: null,
      error: "A client with this name already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({ agency_id: agencyId, ...cleaned })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        client: null,
        error: "A client with this name already exists.",
      };
    }
    return { client: null, error: error.message };
  }

  return { client: data, error: null };
}

/**
 * Updates an existing client. `agencyId` is re-checked for ownership so a
 * client can never be reassigned outside the current user's agency.
 */
export async function updateClientRecord(
  clientId: number,
  agencyId: number,
  values: ClientFormValues
): Promise<SaveClientResult> {
  const { cleaned, error: validationError } = validate(values);

  if (validationError || !cleaned) {
    return { client: null, error: validationError };
  }

  const ownership = await assertAgencyOwnership(agencyId);
  if (!ownership.ok) {
    return { client: null, error: ownership.error };
  }

  const duplicate = await findDuplicateClientName(
    agencyId,
    cleaned.client_name,
    clientId
  );
  if (duplicate.error) {
    return { client: null, error: duplicate.error };
  }
  if (duplicate.isDuplicate) {
    return {
      client: null,
      error: "A client with this name already exists.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .update(cleaned)
    .eq("id", clientId)
    .eq("agency_id", agencyId)
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        client: null,
        error: "A client with this name already exists.",
      };
    }
    return { client: null, error: error.message };
  }

  return { client: data, error: null };
}

/**
 * Deletes a client belonging to the given agency.
 */
export async function deleteClientRecord(
  clientId: number,
  agencyId: number
): Promise<DeleteClientResult> {
  const ownership = await assertAgencyOwnership(agencyId);
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("agency_id", agencyId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
