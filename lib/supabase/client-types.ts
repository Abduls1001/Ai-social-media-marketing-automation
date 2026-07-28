import type { Client } from "@/types";

/**
 * Phase 3 — Client Management.
 *
 * Types, interfaces, and constants for the client form/actions. Kept out
 * of `lib/supabase/client-actions.ts` because a `"use server"` file may
 * only export async functions — any value export (like a const array)
 * or would trigger a build error, even though type-only exports are
 * erased and technically safe. Splitting all of it out here keeps the
 * rule easy to honor going forward as this module grows.
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

/** Values after trimming and defaulting, ready to write to the database. */
export interface CleanedClientValues {
  client_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  status: ClientStatus;
  notes: string | null;
}
