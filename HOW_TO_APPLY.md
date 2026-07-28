# Phase 5 — how to apply this delta

This zip contains only new/changed files (mirrors the folder structure of
your repo root). 8 files are brand new, 6 are small additions to existing
files — nothing else in your Phase 1–4 code was touched.

## 1. Copy files into your repo

Copy everything in this zip on top of your project root, preserving
paths. New files (create):

- `supabase/migrations/0003_create_content_tasks_table.sql`
- `lib/supabase/content-task-types.ts`
- `lib/supabase/content-task-validation.ts`
- `lib/supabase/content-tasks.ts`
- `lib/supabase/content-task-actions.ts`
- `app/(protected)/content-tasks/_components/content-task-form-dialog.tsx`
- `app/(protected)/content-tasks/_components/content-task-status-badge.tsx`
- `app/(protected)/content-tasks/_components/content-task-priority-badge.tsx`
- `app/(protected)/content-tasks/_components/content-tasks-list.tsx`
- `app/(protected)/content-tasks/_components/content-tasks-empty-state.tsx`
- `app/(protected)/content-tasks/_components/content-tasks-error-state.tsx`
- `app/(protected)/content-tasks/_components/content-tasks-needs-campaign-state.tsx`
- `app/(protected)/content-tasks/_components/delete-content-task-dialog.tsx`

Files that **replace/modify** existing ones (overwrite):

- `types/database.ts` — added `ContentTask` type + table entry only;
  `Agency`/`Client`/`Campaign` untouched
- `types/index.ts` — added `ContentTask` to the barrel export
- `lib/supabase/campaigns.ts` — added `getCampaignById` only;
  `getCampaignsForClient` untouched
- `app/(protected)/content-tasks/page.tsx` — full replacement of the
  `PlaceholderPage` stub
- `app/(protected)/campaigns/_components/campaigns-list.tsx` — added a
  "View Content Tasks" icon button; everything else untouched
- `app/(public)/page.tsx` — Get Started button now actually navigates
- `PROJECT_STATUS.md` — Phase 5 + landing page fix documented

## 2. Run the migration

In your Supabase project's SQL editor (or `supabase db push`), run:

```
supabase/migrations/0003_create_content_tasks_table.sql
```

This is the only table in the project so far that gets a checked-in
migration — `clients`/`campaigns` already existed live per your earlier
instructions, but `content_tasks` is brand new, so it's created here
with RLS enabled and all 4 CRUD policies from the start.

## 3. Install, lint, build

I do **not** have network access in my environment, so I could not run
`npm install`, `npm run lint`, or `npm run build` myself. Please run:

```bash
npm install
npm run lint
npm run build
```

and fix anything that surfaces. I hand-traced every import, prop, and
type against your existing Campaign/Client modules, but this is
unverified until it compiles in a real environment.

## 4. Try it out

1. Go to `/clients`, click the megaphone icon on a client → `/campaigns?client={id}`
2. Click "Add Campaign" if you don't have one yet
3. Click the new checklist icon on a campaign row → `/content-tasks?campaign={id}`
4. Add/edit/delete content tasks, try the search box + status/priority filters
5. Visit `/` while logged out — "Get Started" now goes to `/login`; log in
   and it lands on `/home`. Visit `/` while logged in — "Get Started"
   goes straight to `/home`.
