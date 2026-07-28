-- Part 2.4B / Phase 2.5 — Agency Setup (Create / Edit Agency)
--
-- Part 2.4A only defined a SELECT policy on public.agencies. This
-- migration adds the INSERT and UPDATE policies needed so an authenticated
-- user can create their own agency workspace and edit it afterwards.
-- No new tables or columns are introduced.

-- Users may create exactly one agency row for themselves.
create policy "Users can create their own agency"
  on public.agencies
  for insert
  with check (auth.uid() = user_id);

-- Users may update only their own agency row.
create policy "Users can update their own agency"
  on public.agencies
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
