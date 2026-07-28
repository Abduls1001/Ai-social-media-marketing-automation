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
 * Row shape for the `public.campaigns` table (Phase 4 — Campaign
 * Management).
 *
 * `id` and `client_id` are both `int8` in the live database —
 * `client_id` is a foreign key to `clients.id` (also `int8`), NOT a
 * `uuid` — same pattern as `clients.agency_id` -> `agencies.id`.
 *
 * This is intentionally NOT a CRM: it exists to organize future
 * automation (content tasks, posts) under a client's campaigns.
 */
export type Campaign = {
  id: number;
  client_id: number;
  campaign_name: string;
  objective: string | null;
  platform: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Row shape for the `public.content_tasks` table (Phase 5 — Content
 * Task Management).
 *
 * `id` and `campaign_id` are both `int8` in the live database —
 * `campaign_id` is a foreign key to `campaigns.id` (also `int8`), NOT a
 * `uuid` — same pattern as `campaigns.client_id` -> `clients.id`.
 *
 * A Content Task is not a note: it's the structured input future AI
 * automation will use to generate captions, images, and posts. Kept to
 * automation-essential fields only.
 */
export type ContentTask = {
  id: number;
  campaign_id: number;
  title: string;
  description: string | null;
  platform: string;
  content_type: string;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Row shape for the `public.posts` table (Phase 6 — Posts).
 *
 * `id` and `content_task_id` are both `int8` in the live database —
 * `content_task_id` is a foreign key to `content_tasks.id` (also
 * `int8`), NOT a `uuid` — same pattern as `content_tasks.campaign_id`
 * -> `campaigns.id`.
 *
 * A Post is the actual piece of social media content that will later be
 * generated, edited, and published. One Content Task can have many
 * Posts (future ready). Kept to automation-essential fields only.
 */
export type Post = {
  id: number;
  content_task_id: number;
  title: string;
  caption: string | null;
  platform: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Minimal Supabase Database type, hand-written to cover the tables this
 * app currently queries. Extend as new tables are introduced.
 *
 * Note: `Row`/`Insert`/`Update` are written as plain object types rather
 * than `Partial<Row> & {...}` intersections, and `Agency`/`Client`/
 * `Campaign` are `type` aliases rather than `interface`s — both were
 * found (via isolated reproduction) to be required for the installed
 * postgrest-js version to correctly resolve `.insert()`/`.update()`
 * payload types.
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
      campaigns: {
        Row: Campaign;
        Insert: {
          id?: number;
          client_id: number;
          campaign_name: string;
          objective?: string | null;
          platform?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          client_id?: number;
          campaign_name?: string;
          objective?: string | null;
          platform?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_tasks: {
        Row: ContentTask;
        Insert: {
          id?: number;
          campaign_id: number;
          title: string;
          description?: string | null;
          platform?: string;
          content_type?: string;
          priority?: string;
          status?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          campaign_id?: number;
          title?: string;
          description?: string | null;
          platform?: string;
          content_type?: string;
          priority?: string;
          status?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: {
          id?: number;
          content_task_id: number;
          title: string;
          caption?: string | null;
          platform?: string;
          status?: string;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          content_task_id?: number;
          title?: string;
          caption?: string | null;
          platform?: string;
          status?: string;
          scheduled_date?: string | null;
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
