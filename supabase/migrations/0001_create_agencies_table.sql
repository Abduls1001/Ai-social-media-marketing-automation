-- Part 2.4A — Agency Database
--
-- Creates the `agencies` table: one workspace profile per authenticated
-- user. Read-only for this part — only a SELECT policy is defined here.
-- Insert/update/delete policies will be added in Part 2.4B alongside the
-- CRUD implementation.

create extension if not exists "pgcrypto";

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agency_name text not null,
  description text,
  email text,
  phone text,
  website text,
  country text,
  timezone text,
  primary_color text,
  secondary_color text,
  logo_url text,
  favicon_url text,
  workspace_plan text not null default 'free_trial',
  workspace_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.agencies is
  'One agency workspace profile per authenticated user.';

-- One agency workspace per user for now.
create unique index if not exists agencies_user_id_key
  on public.agencies (user_id);

alter table public.agencies enable row level security;

-- Read-only policy for Part 2.4A. Users may only read their own agency.
create policy "Users can view their own agency"
  on public.agencies
  for select
  using (auth.uid() = user_id);
