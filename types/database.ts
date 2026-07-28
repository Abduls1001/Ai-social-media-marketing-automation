/**
 * Row shape for the `public.agencies` table.
 *
 * `id` is `int8` (bigint) in the live database — represented here as
 * `number`, matching how PostgREST serializes it and how Supabase's own
 * `gen types typescript` would type it. `user_id` is the Supabase Auth
 * user's `uuid` and stays a `string`.
 */
export type Agency = {
  id: number;
  user_id: string;
  agency_name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  timezone: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  workspace_plan: string;
  workspace_status: string;
  created_at: string;
  updated_at: string;
};

/**
 * Row shape for the `public.clients` table (Phase 3 — Client Management).
 *
 * `id` and `agency_id` are both `int8` in the live database — `agency_id`
 * is a foreign key to `agencies.id` (also `int8`), NOT a `uuid`.
 *
 * This is intentionally NOT a CRM: it exists so future automation
 * (campaigns, content tasks, posts) can attribute work to the agency's
 * client, nothing more.
 */
export type Client = {
  id: number;
  agency_id: number;
  client_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Minimal Supabase Database type, hand-written to cover the tables this
 * app currently queries. Extend as new tables are introduced.
 *
 * Note: `Row`/`Insert`/`Update` are written as plain object types rather
 * than `Partial<Row> & {...}` intersections, and `Agency`/`Client` are
 * `type` aliases rather than `interface`s — both were found (via
 * isolated reproduction) to be required for the installed postgrest-js
 * version to correctly resolve `.insert()`/`.update()` payload types.
 */
export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      agencies: {
        Row: Agency;
        Insert: {
          id?: number;
          user_id: string;
          agency_name: string;
          description?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          country?: string | null;
          timezone?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          workspace_plan?: string;
          workspace_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          agency_name?: string;
          description?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          country?: string | null;
          timezone?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          workspace_plan?: string;
          workspace_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: {
          id?: number;
          agency_id: number;
          client_name: string;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          industry?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          agency_id?: number;
          client_name?: string;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          industry?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
