-- Phase 6 — Posts
--
-- Creates the `posts` table: the actual social media content that will
-- later be generated, edited, and published. Like `content_tasks`
-- (which already existed live), `posts` is a brand new table, so it is
-- created here with a foreign key, RLS enabled, and all four CRUD
-- policies from the start, per project convention.
--
-- `id` and `content_task_id` are both `int8` (bigint) —
-- `content_task_id` references `content_tasks.id` (also `int8`),
-- matching the `content_tasks.campaign_id` -> `campaigns.id` pattern.
--
-- One Content Task can have many Posts (future ready).

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  content_task_id bigint not null references public.content_tasks (id) on delete cascade,
  title text not null,
  caption text,
  platform text not null default 'instagram',
  status text not null default 'draft',
  scheduled_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is
  'A single piece of social media content belonging to a content task, to be generated, edited, and published by future automation.';

create index if not exists posts_content_task_id_idx
  on public.posts (content_task_id);

alter table public.posts enable row level security;

-- Ownership is resolved through content task -> campaign -> client ->
-- agency -> auth.uid(), the same chain enforced in application code by
-- lib/supabase/post-actions.ts (assertContentTaskOwnership).

create policy "Users can view their own posts"
  on public.posts
  for select
  using (
    exists (
      select 1
      from public.content_tasks ct
      join public.campaigns c on c.id = ct.campaign_id
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where ct.id = posts.content_task_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can create posts for their own content tasks"
  on public.posts
  for insert
  with check (
    exists (
      select 1
      from public.content_tasks ct
      join public.campaigns c on c.id = ct.campaign_id
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where ct.id = posts.content_task_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can update their own posts"
  on public.posts
  for update
  using (
    exists (
      select 1
      from public.content_tasks ct
      join public.campaigns c on c.id = ct.campaign_id
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where ct.id = posts.content_task_id
        and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.content_tasks ct
      join public.campaigns c on c.id = ct.campaign_id
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where ct.id = posts.content_task_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can delete their own posts"
  on public.posts
  for delete
  using (
    exists (
      select 1
      from public.content_tasks ct
      join public.campaigns c on c.id = ct.campaign_id
      join public.clients cl on cl.id = c.client_id
      join public.agencies a on a.id = cl.agency_id
      where ct.id = posts.content_task_id
        and a.user_id = auth.uid()
    )
  );
