/**
 * Row shape for the `public.agencies` table.
 * Keep in sync with supabase/migrations/0001_create_agencies_table.sql.
 */
export interface Agency {
  id: string;
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
}

/**
 * Minimal Supabase Database type, hand-written to cover the tables this
 * app currently queries. Extend as new tables are introduced.
 */
export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: Agency;
        Insert: Partial<Agency> & {
          user_id: string;
          agency_name: string;
        };
        Update: Partial<Agency>;
      };
    };
  };
}
