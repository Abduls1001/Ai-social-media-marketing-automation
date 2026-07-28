-- Phase 5 — Content Task Management
--
-- Creates the `content_tasks` table: the structured input future AI
-- automation will use to generate captions, images, and posts. Unlike
-- `clients`/`campaigns` (which already existed live and intentionally had
-- no migration written against them), `content_tasks` is a brand new
-- table, so it is created here with a foreign key, RLS enabled, and all
-- four CRUD policies from the start, per project convention.
--
-- `id` and `campaign_id` are both `int8` (bigint) — `campaign_id`
-- references `campaigns.id` (also `int8`), matching the
-- `campaigns.client_id` -> `clients.id` pattern.

create table if not exists public.content_tasks (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  title text not null,
  description text,
  platform text not null default 'instagram',
  content_type text not null default 'post',
  priority text not null default 'medium',
  status text not null default 'todo',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.content_tasks is
  'A single content idea belonging to a campaign, to be processed by future AI automation into captions, images, and posts.';

create index if not exists content_tasks_campaign_id_idx
  on public.content_tasks (campaign_id);

alter table public.content_tasks enable row level security;

-- Ownership is resolved through campaign -> client -> agency -> auth.uid(),
-- the same chain enforced in application code by
-- lib/supabase/content-task-actions.ts (assertCampaignOwnership).

create policy "Users can view their own content tasks"
  on public.content_tasks
  for select
  using (
    exists (
      select 1
      from public.campaigns c
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where c.id = content_tasks.campaign_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can create content tasks for their own campaigns"
  on public.content_tasks
  for insert
  with check (
    exists (
      select 1
      from public.campaigns c
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where c.id = content_tasks.campaign_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can update their own content tasks"
  on public.content_tasks
  for update
  using (
    exists (
      select 1
      from public.campaigns c
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where c.id = content_tasks.campaign_id
        and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.campaigns c
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where c.id = content_tasks.campaign_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can delete their own content tasks"
  on public.content_tasks
  for delete
  using (
    exists (
      select 1
      from public.campaigns c
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where c.id = content_tasks.campaign_id
        and a.user_id = auth.uid()
    )
  );
