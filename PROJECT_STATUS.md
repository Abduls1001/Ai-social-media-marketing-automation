# Project Status

Tracks the delivery status of each build part for the AI Social Media
Operations Platform.

## Completed

- [x] **Part 1.1 — Project Foundation**
      Next.js 15 (App Router) + TypeScript + Tailwind CSS + ESLint scaffold.
      Base folder structure, `.env.example`, README.
- [x] **Part 1.2 — UI Foundation**
      shadcn/ui installed and configured (design tokens, CSS variables).
      Base components: Button, Input, Card, Label, Separator.
- [x] **Part 1.3 — Project Architecture**
      Scalable folder structure: `app/(public)`, `app/(protected)`,
      `components/shared`, `components/layouts`, `lib/utils`,
      `lib/constants`, `types`, `public/images`, `public/icons`, `styles`.
      Absolute imports via the `@/*` path alias.
- [x] **Part 2.1 — Authentication**
      Supabase Authentication (email/password) via `@supabase/ssr`.
      - Login page (`/login`): email, password, login button, forgot
        password link.
      - Forgot password page (`/forgot-password`): sends a Supabase
        password reset email.
      - Protected route handling: middleware refreshes the session and
        redirects unauthenticated users; the `(protected)` layout performs
        a second, authoritative server-side check.
      - Logout functionality via a client-side logout button.
      - Session management via `lib/supabase/client.ts`,
        `lib/supabase/server.ts`, and `lib/supabase/middleware.ts`.
      - Minimal authenticated header (avatar, email, logout button) shown
        on all protected pages.
      - Minimal protected landing page at `/home` (no dashboard content).
- [x] **Part 2.2 — Application Dashboard Layout**
      Authenticated application shell used by all future modules.
      - Responsive sidebar (`components/layouts/app-sidebar.tsx`) with 11
        nav items (Dashboard, Agency, Team, Clients, Campaigns, Content
        Tasks, Posts, Publishing, Analytics, Reports, Settings), each with
        an icon, active-item highlighting, and collapsed/expanded states.
      - Top header (`components/layouts/site-header.tsx`) with breadcrumb,
        global search input (UI only), notifications icon (UI only), and
        the existing avatar/email/logout controls.
      - `components/layouts/app-shell.tsx` composes the sidebar, header,
        and main content area; `hooks/use-sidebar-state.ts` manages
        collapse/drawer state.
      - Responsive behavior: fixed sidebar on desktop, collapsible sidebar
        on tablet (manual toggle), off-canvas drawer with hamburger
        trigger on mobile.
      - Placeholder pages (title + "Coming soon") for every nav item,
        rendered via the shared `PlaceholderPage` component.
      - `NAV_ITEMS` centralized in `lib/constants/index.ts`;
        `PROTECTED_PATHS` now derived from it automatically.
- [x] **Part 2.3 — Agency Workspace UI**
      Complete Agency Workspace page, UI only — no Supabase, no CRUD.
      - Page header: agency name, description, "Edit Agency" button (UI
        only).
      - Overview cards: Active Clients, Active Campaigns, Team Members,
        Connected Social Accounts (static placeholder values).
      - Agency Profile section: placeholder logo, name, email, phone,
        website, country, time zone.
      - Branding section: read-only primary/secondary brand color
        swatches, logo and favicon placeholders (no upload).
      - Workspace Information: workspace ID, created date, current plan,
        workspace status (placeholder values).
      - Quick Actions: Edit Agency, Invite Team Member, Connect Social
        Account, Upgrade Plan — UI-only action tiles, no handlers.
      - All static placeholder data lives in a page-scoped
        `app/(protected)/agency/_components/data.ts`; presentational
        sections live in `app/(protected)/agency/_components/` (Next.js
        private folder, not a route) to avoid touching the shared
        `components/` architecture for single-page UI.
      - Fully responsive: single column on mobile, responsive grid on
        tablet, multi-column on desktop.
- [x] **Part 2.4A — Supabase Integration & Agency Data Fetch**
      Connected the Agency Workspace UI to Supabase. Read-only — no
      create/update/delete implemented.
      - `supabase/migrations/0001_create_agencies_table.sql` — creates
        `public.agencies` (one row per user), enables RLS, and adds a
        SELECT-only policy (`auth.uid() = user_id`). Insert/update
        policies are deferred to Part 2.4B.
      - `types/database.ts` — hand-written `Agency` row type and a
        minimal `Database` type; `lib/supabase/client.ts` and
        `lib/supabase/server.ts` now create typed clients
        (`createServerClient<Database>` /
        `createBrowserClient<Database>`).
      - `lib/supabase/agencies.ts` — `getAgencyForUser(userId)` repository
        function; the only place that queries the `agencies` table. Wraps
        the query in try/catch so both PostgREST errors and network-level
        failures resolve to a clean `{ agency, error }` result instead of
        throwing.
      - `app/(protected)/agency/page.tsx` — fetches the authenticated
        user, then the user's agency, and renders one of three states:
        loading (`loading.tsx`, via Next.js' file convention), empty
        state (`AgencyEmptyState`, with a UI-only "Create Agency"
        button), error state (`AgencyErrorState`), or the populated
        workspace UI.
      - `AgencyHeader`, `AgencyProfileSection`, `BrandingSection`, and
        `WorkspaceInfoSection` now accept a real `Agency` record as a
        prop instead of importing static data; nullable fields fall back
        to a placeholder (`—`) or, for logo/favicon, the original
        placeholder icon box. Overview Cards and Quick Actions remain
        static — there is no clients/campaigns/team-members data source
        yet (those modules are still out of scope).
      - Removed the now-unused `_components/data.ts` static placeholder
        file.

- [x] **Part 2.4B — Agency CRUD (Phase 2.5 — Agency Setup)**
      Agency create/edit form wired to Supabase. Reuses the existing
      `agencies` table — no new tables added.
      - `supabase/migrations/0002_agency_insert_update_policies.sql` —
        adds INSERT and UPDATE RLS policies (Part 2.4A only had SELECT).
      - `types/database.ts` — **superseded, see Part 3.1 below**: this
        entry originally noted pinning `@supabase/supabase-js` to
        `2.45.4` to work around a type inference bug. That pin was
        reverted once the actual root cause was found and fixed
        properly — see Part 3.1's note for the real fix. The project now
        runs on the latest `@supabase/supabase-js` (`^2.110.8`) with no
        version pin.
      - `lib/supabase/agency-actions.ts` — new file, `"use server"`
        actions `createAgency` and `updateAgency`. Kept separate from the
        existing read-only `lib/supabase/agencies.ts` (untouched) so the
        server-only Supabase client never gets bundled into a client
        component. Validates required fields, email format, and trims
        whitespace before writing.
      - `components/ui/dialog.tsx`, `components/ui/sonner.tsx` — added
        shadcn primitives (Radix Dialog, Sonner toaster) in the existing
        `new-york` style; `sonner` and `@radix-ui/react-dialog` added as
        dependencies. `<Toaster />` mounted once in `app/layout.tsx`.
      - `agency/_components/agency-form-dialog.tsx` — new client
        component: the create/edit form (agency_name, email, phone,
        website, country, timezone), used in both modes. Handles the
        loading state, disables Save while saving, and shows a success or
        error toast.
      - Wired the three existing UI-only buttons: `AgencyEmptyState`'s
        "Create Agency", `AgencyHeader`'s "Edit Agency", and the "Edit
        Agency" tile in `QuickActionsSection` (its other three tiles
        remain inert placeholders — Team, Social Accounts, and Billing are
        still out of scope). `QuickActionsSection` now takes an `agency`
        prop.

- [x] **Part 3.1 — Client Management (Phase 3)**
      Full client CRUD (create, edit, delete) scoped to the current
      agency. Uses the existing `clients` table exactly as specified —
      no columns renamed, no new tables beyond it. Explicitly not a CRM:
      exists so future automation (campaigns, content tasks, posts) can
      attribute work to a client.
      - **No migration file was created for `clients`** — confirmed the
        table, and RLS (if any), already exist in the live project, and
        per explicit instruction no migrations should be generated or
        run against it. (An earlier draft of this phase included a
        `create table if not exists` + RLS migration; it was removed
        once this was clarified, since it also encoded a wrong
        assumption — see below.)
      - **Schema correction — `agency_id` is `int8`, not `uuid`.** An
        earlier draft of this phase assumed `clients.agency_id` was a
        `uuid` referencing `agencies.id`. Testing against the live
        database surfaced a Postgres error
        (`invalid input syntax for type uuid`), which traced back to a
        wrong assumption about column types. Confirmed against the
        actual schema: `agencies.id` and `clients.id` are both `int8`
        (bigint), `agencies.user_id` is the Auth `uuid`, and
        `clients.agency_id` is `int8`, referencing `agencies.id`
        directly (not `user_id`). All code below reflects this.
      - `types/database.ts` — **root-cause fix for the type-inference bug
        noted back in Part 2.4B**, plus the `int8` correction above.
        Confirmed via isolated reproduction: the installed `postgrest-js`
        (bundled with `@supabase/supabase-js ^2.110.8`) fails to resolve
        `.insert()`/`.update()` payload types whenever a table's `Row` is
        declared as a TypeScript `interface` (e.g. `interface Agency
        {...}`) rather than a `type` alias — even with the correct
        `Relationships`/`Views`/`Functions`/`__InternalSupabase` shape in
        place. Converted `Agency` and `Client` from `interface` to `type`
        (identical fields, no behavior change for any other file that
        imports them), and typed `Agency.id` / `Client.id` /
        `Client.agency_id` as `number` (matching `int8`) instead of
        `string`. Both fixes together resolved `.insert()`/`.update()`
        type-checking completely on the latest supabase-js — no version
        pin needed. Also fixed a related latent bug this surfaced:
        `getAuthenticatedUserId()` in `lib/supabase/agency-actions.ts`
        returned a `{ userId: string | null }` union even though
        `redirect()` (return type `never` in Next.js) makes the null
        case unreachable; simplified it to return a plain `string`.
      - `app/(protected)/agency/_components/workspace-info-section.tsx` —
        the "Workspace ID" display now wraps `agency.id` in `String(...)`
        since that field is display-only text and `id` is now `number`.
      - `lib/supabase/clients.ts` — read-only `getClientsForAgency`,
        mirroring `agencies.ts`.
      - `lib/supabase/client-actions.ts` — `"use server"` module exporting
        **only** the three async Server Actions: `createClientRecord`,
        `updateClientRecord`, `deleteClientRecord`. Validates required
        `client_name`, email format (when provided), trims whitespace,
        defaults `status` to `active`. Checks agency ownership before
        every write and checks for a case-insensitive duplicate client
        name (excluding the current client on edit) before insert/update,
        with a Postgres unique-violation (23505) catch as a fallback if a
        race condition slips past the application-level check.
      - **Server Actions architecture fix:** this file originally also
        exported `CLIENT_STATUSES` (a runtime const array), which
        violates the Next.js rule that a `"use server"` file may only
        export async functions (type-only exports like interfaces are
        erased at compile time and are fine; a real value export is
        not). Split out:
        - `lib/supabase/client-types.ts` — `CLIENT_STATUSES`,
          `ClientStatus`, `ClientFormValues`, `SaveClientResult`,
          `DeleteClientResult`, `CleanedClientValues`.
        - `lib/supabase/client-validation.ts` — `validateClientFormValues`
          (form validation, previously an unexported `validate()` inside
          `client-actions.ts`).
        `client-actions.ts` now only exports the three Server Actions,
        importing everything else from the two files above. Updated the
        one consumer that imported a type from the old location
        (`client-form-dialog.tsx`, now imports `ClientFormValues` from
        `client-types.ts`). No functionality or UI changed — this was a
        pure module-boundary fix. (The Agency module's
        `agency-actions.ts` didn't need this split since it only ever
        exported interfaces, which are erased and were never the
        problem.)
      - `components/ui/badge.tsx`, `textarea.tsx`, `select.tsx`,
        `alert-dialog.tsx`, `table.tsx` — added shadcn primitives in the
        existing `new-york` style; `@radix-ui/react-select` and
        `@radix-ui/react-alert-dialog` added as dependencies.
      - `app/(protected)/clients/_components/` — `client-form-dialog.tsx`
        (Add/Edit, same UX pattern as `agency-form-dialog.tsx`),
        `delete-client-dialog.tsx` (confirmation via AlertDialog),
        `client-status-badge.tsx`, `clients-list.tsx` (table, search-by-
        name/company, row actions), `clients-empty-state.tsx`,
        `clients-error-state.tsx`, `clients-needs-agency-state.tsx` (shown
        if the user hasn't created an agency yet, since every client must
        belong to one).
      - `app/(protected)/clients/page.tsx` — replaced the
        `PlaceholderPage` with the real Server Component: fetches the
        user's agency, then its clients, and renders the appropriate
        state (needs-agency / error / empty / populated list).
      - `agency_id` is always taken from the current user's agency and
        never exposed as a user-selectable field, per the "one agency →
        many clients" rule.
- [x] **Part 4 — Campaign Management (Phase 4)**
      Full campaign CRUD (create, edit, delete) scoped to a specific
      client, following the Client module's architecture exactly. Uses
      the existing `campaigns` table exactly as specified — no new
      tables, no migrations generated (per explicit instruction, same as
      the `clients` table in Part 3.1). Not a CRM: exists to organize
      future automation (content tasks, posts) under a client's
      campaigns.
      - **Schema**: `campaigns.id` and `campaigns.client_id` are both
        `int8`, `client_id` a foreign key to `clients.id` (also `int8`)
        — same pattern as `clients.agency_id` → `agencies.id`.
      - **Navigation decision**: unlike Agency (one per user) and
        Clients (all shown on one page), an agency can have many
        clients, and each client has its own campaigns — so there's no
        single implicit "the client" the way there's a single implicit
        "the agency". Resolved by adding a "View Campaigns" icon button
        to each row on `/clients`, linking to `/campaigns?client={id}`.
        The Campaigns page reads `?client=` from the URL, verifies that
        client belongs to the current user's agency, and shows that
        client's campaigns. No client-switcher dropdown or extra
        navigation UI was added beyond this, per the "don't add
        unrequested features" instruction.
      - `types/database.ts` — added `Campaign` type (`type` alias, not
        `interface` — same reason as `Agency`/`Client`) and the
        `campaigns` table entry to `Database`, `id`/`client_id` typed as
        `number` (`int8`), following the exact `Client`/`clients`
        pattern.
      - `lib/supabase/campaigns.ts` — read-only `getCampaignsForClient`,
        mirroring `getClientsForAgency`.
      - `lib/supabase/clients.ts` — added `getClientById` (new, small
        addition needed so the Campaigns page can resolve the client
        named in `?client=`; everything else in this file is untouched).
      - `lib/supabase/campaign-types.ts` — `CAMPAIGN_STATUSES`
        (`planning`/`active`/`paused`/`completed` — see assumption note
        below), `CampaignStatus`, `CampaignFormValues`,
        `SaveCampaignResult`, `DeleteCampaignResult`,
        `CleanedCampaignValues`. Mirrors `client-types.ts`.
      - `lib/supabase/campaign-validation.ts` — `validateCampaignFormValues`
        (required `campaign_name`, trims whitespace, defaults `status`
        to `planning`). Mirrors `client-validation.ts`. No email field on
        this table, so no email-format check is needed here.
      - `lib/supabase/campaign-actions.ts` — `"use server"` module
        exporting **only** the three async Server Actions:
        `createCampaignRecord`, `updateCampaignRecord`,
        `deleteCampaignRecord` (mirrors the Client module's
        `client-actions.ts`, including the same "only async functions"
        module-boundary discipline). Checks client ownership (that the
        client belongs to an agency owned by the current user) via two
        plain queries rather than a PostgREST embedded/joined select, so
        it doesn't depend on a foreign key relationship being registered
        in PostgREST's schema cache. Checks for a case-insensitive
        duplicate campaign name within the same client (excluding the
        current campaign on edit) before insert/update, with a Postgres
        unique-violation (23505) catch as a fallback.
      - `app/(protected)/clients/_components/clients-list.tsx` — added
        the "View Campaigns" icon button described above; no other
        change to this file.
      - `app/(protected)/campaigns/_components/` —
        `campaign-form-dialog.tsx` (Add/Edit: campaign_name, objective,
        platform, status, start_date, end_date),
        `delete-campaign-dialog.tsx`, `campaign-status-badge.tsx`,
        `campaigns-list.tsx` (table, search-by-name, row actions),
        `campaigns-empty-state.tsx`, `campaigns-error-state.tsx`,
        `campaigns-needs-client-state.tsx` (shown when `?client=` is
        missing, invalid, or doesn't belong to the user's agency —
        directs to `/clients`).
      - `app/(protected)/campaigns/page.tsx` — replaced the
        `PlaceholderPage` with the real Server Component: resolves the
        client from `?client=`, verifies ownership, fetches that
        client's campaigns, and renders the appropriate state
        (needs-client / error / empty / populated list).
      - `client_id` is always taken from the resolved client (via the
        URL) and never exposed as a user-enterable field, per the "one
        client → many campaigns" rule and "never ask users to manually
        enter IDs."

- [x] **Phase 5 — Content Task Management**
      Full content task CRUD (create, edit, delete) scoped to a specific
      campaign, following the Campaign module's architecture exactly. A
      Content Task is not a note — it's the structured input future AI
      automation will use to generate captions, images, and posts. Kept
      to automation-essential fields only, per instruction: nothing on
      scheduling, publishing, analytics, approval workflow, or file
      uploads.
      - **Schema**: new table, `content_tasks.id` and `.campaign_id` are
        both `int8`, `campaign_id` a foreign key to `campaigns.id` (also
        `int8`) — same pattern as `campaigns.client_id` → `clients.id`.
        Unlike `clients`/`campaigns` (which already existed live and
        intentionally had no migration), `content_tasks` is a brand new
        table, so
        `supabase/migrations/0003_create_content_tasks_table.sql` creates
        it with RLS enabled and all four CRUD policies (select / insert /
        update / delete) from the start, scoped through
        `content_tasks.campaign_id` → `campaigns.client_id` →
        `clients.agency_id` → `agencies.user_id = auth.uid()`.
      - **Navigation decision**: same reasoning as Campaigns — a client
        can have many campaigns, and each campaign has its own content
        tasks, so there's no single implicit "the campaign". Resolved by
        adding a "View Content Tasks" icon button to each row on
        `/campaigns`, linking to `/content-tasks?campaign={id}`. The
        Content Tasks page reads `?campaign=` from the URL, verifies that
        campaign's client belongs to the current user's agency (one hop
        further than Campaigns' own check), and shows that campaign's
        content tasks. No campaign-switcher dropdown or extra navigation
        UI was added, per the "don't add unrequested features"
        instruction.
      - `types/database.ts` — added `ContentTask` type (`type` alias, not
        `interface` — same reason as `Agency`/`Client`/`Campaign`) and
        the `content_tasks` table entry to `Database`, `id`/`campaign_id`
        typed as `number` (`int8`), following the exact `Campaign`
        pattern.
      - `lib/supabase/content-tasks.ts` — read-only
        `getContentTasksForCampaign`, mirroring `getCampaignsForClient`.
      - `lib/supabase/campaigns.ts` — added `getCampaignById` (new, small
        addition needed so the Content Tasks page can resolve the
        campaign named in `?campaign=`; everything else in this file is
        untouched — same precedent as `getClientById` added to
        `clients.ts` in Phase 4).
      - `lib/supabase/content-task-types.ts` — `CONTENT_TASK_STATUSES`
        (`todo`/`in_progress`/`in_review`/`done`), `CONTENT_TASK_PRIORITIES`
        (`low`/`medium`/`high`/`urgent`), `CONTENT_TASK_PLATFORMS`,
        `CONTENT_TASK_TYPES`, plus `ContentTaskFormValues`,
        `SaveContentTaskResult`, `DeleteContentTaskResult`,
        `CleanedContentTaskValues`. Mirrors `campaign-types.ts`.
      - `lib/supabase/content-task-validation.ts` —
        `validateContentTaskFormValues` (required `title`, trims
        whitespace, defaults each enum field to a safe value when the
        submitted value isn't recognized). Mirrors
        `campaign-validation.ts`.
      - `lib/supabase/content-task-actions.ts` — `"use server"` module
        exporting **only** the three async Server Actions:
        `createContentTaskRecord`, `updateContentTaskRecord`,
        `deleteContentTaskRecord` (mirrors the Campaign module's
        `campaign-actions.ts`, including the same "only async functions"
        module-boundary discipline). Ownership is checked via
        `assertCampaignOwnership`, three plain queries
        (campaign → client → agency) rather than a PostgREST
        embedded/joined select, extending `assertClientOwnership`'s
        two-query pattern one hop further for the extra level in this
        module's ownership chain. Checks for a case-insensitive duplicate
        title within the same campaign (excluding the current task on
        edit) before insert/update, with a Postgres unique-violation
        (23505) catch as a fallback.
      - `app/(protected)/campaigns/_components/campaigns-list.tsx` —
        added the "View Content Tasks" icon button described above; no
        other change to this file.
      - `app/(protected)/content-tasks/_components/` —
        `content-task-form-dialog.tsx` (Add/Edit: title, description,
        platform, content_type, priority, status, due_date),
        `delete-content-task-dialog.tsx`, `content-task-status-badge.tsx`,
        `content-task-priority-badge.tsx`, `content-tasks-list.tsx`
        (table, search-by-title, status filter, priority filter, row
        actions), `content-tasks-empty-state.tsx`,
        `content-tasks-error-state.tsx`,
        `content-tasks-needs-campaign-state.tsx` (shown when `?campaign=`
        is missing, invalid, or doesn't belong to the user's agency —
        directs to `/campaigns`).
      - `app/(protected)/content-tasks/page.tsx` — replaced the
        `PlaceholderPage` with the real Server Component: resolves the
        campaign from `?campaign=`, verifies ownership through its
        client's agency, fetches that campaign's content tasks, and
        renders the appropriate state (needs-campaign / error / empty /
        populated list).
      - `campaign_id` is always taken from the resolved campaign (via the
        URL) and never exposed as a user-enterable field, per the "one
        campaign → many content tasks" rule and "never ask users to
        manually enter IDs."

- [x] **Landing Page Navigation Fix**
      `app/(public)/page.tsx`'s "Get Started" button was a plain
      `<Button>` with no `href` — it did nothing, so unauthenticated
      visitors had to manually type `/login`. Fixed by checking the
      current user server-side (same `supabase.auth.getUser()` pattern
      used on every protected page) and wrapping the existing button in
      a `Link`: authenticated visitors go straight to `/home`
      (`PROTECTED_PATHS[0]`), unauthenticated visitors go to `/login`
      (`AUTH_ROUTES.login`) and land back on `/home` after signing in,
      via `LoginForm`'s existing `redirectTo` handling. No UI or design
      change — navigation only.

- [x] **Phase 6 — Posts**
      Full post CRUD (create, edit, delete) scoped to a specific content
      task, following the Content Task module's architecture exactly. A
      Post is the actual piece of social media content that will later
      be generated, edited, and published. Kept to automation-essential
      fields only, per instruction: no AI generation, publishing APIs,
      scheduling engine, analytics, approval workflow, notifications,
      calendar, or file uploads.
      - **Schema**: new table, `posts.id` and `.content_task_id` are
        both `int8`, `content_task_id` a foreign key to
        `content_tasks.id` (also `int8`) — same pattern as
        `content_tasks.campaign_id` → `campaigns.id`. One Content Task
        can have many Posts (future ready).
        `supabase/migrations/0004_create_posts_table.sql` creates it
        with RLS enabled and all four CRUD policies (select / insert /
        update / delete) from the start, scoped through
        `posts.content_task_id` → `content_tasks.campaign_id` →
        `campaigns.client_id` → `clients.agency_id` →
        `agencies.user_id = auth.uid()`.
      - **Navigation decision**: same reasoning as Content Tasks — a
        campaign can have many content tasks, and each content task has
        its own posts, so there's no single implicit "the content task".
        Resolved by adding a "View Posts" icon button to each row on
        `/content-tasks`, linking to `/posts?contentTask={id}`. The
        Posts page reads `?contentTask=` from the URL, verifies that
        content task's campaign's client belongs to the current user's
        agency (one hop further than Content Tasks' own check), and
        shows that content task's posts. No content-task-switcher
        dropdown or extra navigation UI was added, per the "don't add
        unrequested features" instruction.
      - `types/database.ts` — added `Post` type (`type` alias, not
        `interface` — same reason as `Agency`/`Client`/`Campaign`/
        `ContentTask`) and the `posts` table entry to `Database`,
        `id`/`content_task_id` typed as `number` (`int8`), following the
        exact `ContentTask` pattern.
      - `lib/supabase/posts.ts` — read-only `getPostsForContentTask`,
        mirroring `getContentTasksForCampaign`.
      - `lib/supabase/content-tasks.ts` — added `getContentTaskById`
        (new, small addition needed so the Posts page can resolve the
        content task named in `?contentTask=`; everything else in this
        file is untouched — same precedent as `getCampaignById` added to
        `campaigns.ts` in Phase 5).
      - `lib/supabase/post-types.ts` — `POST_STATUSES`
        (`draft`/`scheduled`/`published`/`cancelled`), `POST_PLATFORMS`,
        plus `PostFormValues`, `SavePostResult`, `DeletePostResult`,
        `CleanedPostValues`. Mirrors `content-task-types.ts`.
      - `lib/supabase/post-validation.ts` — `validatePostFormValues`
        (required `title`, trims whitespace, defaults each enum field to
        a safe value when the submitted value isn't recognized). Mirrors
        `content-task-validation.ts`.
      - `lib/supabase/post-actions.ts` — `"use server"` module exporting
        **only** the three async Server Actions: `createPostRecord`,
        `updatePostRecord`, `deletePostRecord` (mirrors the Content Task
        module's `content-task-actions.ts`, including the same "only
        async functions" module-boundary discipline). Ownership is
        checked via `assertContentTaskOwnership`, four plain queries
        (content task → campaign → client → agency) rather than a
        PostgREST embedded/joined select, extending
        `assertCampaignOwnership`'s three-query pattern one hop further
        for the extra level in this module's ownership chain. Checks for
        a case-insensitive duplicate title within the same content task
        (excluding the current post on edit) before insert/update, with
        a Postgres unique-violation (23505) catch as a fallback.
      - `app/(protected)/content-tasks/_components/content-tasks-list.tsx`
        — added the "View Posts" icon button described above; no other
        change to this file.
      - `app/(protected)/posts/_components/` — `post-form-dialog.tsx`
        (Add/Edit: title, caption, platform, status, scheduled_date),
        `delete-post-dialog.tsx`, `post-status-badge.tsx`,
        `posts-list.tsx` (table, search-by-title, status filter, row
        actions), `posts-empty-state.tsx`, `posts-error-state.tsx`,
        `posts-needs-content-task-state.tsx` (shown when `?contentTask=`
        is missing, invalid, or doesn't belong to the user's agency —
        directs to `/content-tasks`).
      - `app/(protected)/posts/page.tsx` — replaced the `PlaceholderPage`
        with the real Server Component: resolves the content task from
        `?contentTask=`, verifies ownership through its campaign's
        client's agency, fetches that content task's posts, and renders
        the appropriate state (needs-content-task / error / empty /
        populated list).
      - `content_task_id` is always taken from the resolved content task
        (via the URL) and never exposed as a user-enterable field, per
        the "one content task → many posts" rule and "never ask users to
        manually enter IDs."

- [x] **Phase 7 — AI Content Generation**
      Added an AI-generated caption for Posts, integrated into the
      existing Post edit dialog. Not a new module — no new table, no
      new page, no publishing/scheduling/analytics/automation.
      - **AI service (`lib/ai/`)** — reusable, called by exactly one
        Server Action, so there's no duplicated OpenAI call anywhere:
        - `openai-client.ts` — single lazily-created OpenAI client
          (`getOpenAIClient()`), same lazy pattern as
          `lib/supabase/server.ts` / `client.ts`. Throws
          `MissingOpenAIKeyError` if `OPENAI_API_KEY` isn't set, caught
          by the service layer and turned into a friendly error
          instead of a crash. Model is `OPENAI_CAPTION_MODEL`,
          overridable via `OPENAI_MODEL`, defaulting to `gpt-4o-mini`.
        - `caption-prompts.ts` — `buildCaptionPrompt()`, a pure
          function (no Supabase, no "use server") with tone/format
          guidance for Instagram, Facebook, LinkedIn, and X, and a
          context builder that folds in Post title, platform, Content
          Task title/description/type/priority, Campaign
          name/objective, and Client name/industry — whichever of
          those are available.
        - `caption-service.ts` — `generateCaptionWithAI()`, the only
          function in the app that calls the OpenAI Chat Completions
          API. Both the "Generate" and "Regenerate" actions go through
          this one function.
      - `lib/supabase/post-ai-actions.ts` — new `"use server"` module
        exporting **one** Server Action, `generateAiCaptionForPost`,
        following the same "only async functions" module-boundary
        discipline as every other `*-actions.ts` file. No duplicated
        logic:
        - Ownership check reuses `assertContentTaskOwnership` (now
          exported from `post-actions.ts` — the only change to that
          file, besides an updated file-header comment) instead of
          re-implementing it.
        - Related data is assembled from the existing read-only
          lookups: the new `getPostById` (added to `lib/supabase/posts.ts`,
          mirroring `getContentTaskById` / `getCampaignById` /
          `getClientById`), plus the three that already existed.
        - Calls `generateCaptionWithAI`, then writes the result
          straight to the existing `posts.caption` column via a normal
          Supabase `update`, scoped by both `id` and `content_task_id`
          — same defense-in-depth pattern as `updatePostRecord`.
      - `app/(protected)/posts/_components/post-form-dialog.tsx` — the
        only UI change. Added a small outline button next to the
        Caption label, inside the existing edit dialog (no redesign,
        no new page): "Generate AI Caption" when the caption field is
        empty, "Regenerate Caption" once it has content. Disabled while
        generating or while the form is saving; shows a spinner via the
        same `Loader2` pattern used by the Save/Delete buttons. On
        success, fills the Caption textarea with the result and shows a
        success toast (`sonner`, matching every other action in the
        app); on failure, shows an error toast and leaves the field
        untouched. The dialog stays open either way — generating a
        caption is a distinct action from saving the form. Only shown
        in edit mode: caption generation writes directly to an existing
        post row, so a post must already exist (this also means it
        isn't available in "Add Post" / create mode — a deliberate,
        minimal scope decision, not an oversight).
      - `package.json` — added `openai` (`^7.1.0`) as a dependency, the
        official OpenAI SDK. No other dependency changes.
      - `.env.example` — documented the two new server-only environment
        variables, `OPENAI_API_KEY` (required) and `OPENAI_MODEL`
        (optional).
      - No database changes: no new table, no new column, no RLS
        change, no migration. Uses the existing `posts.caption` column
        exactly as Phase 6 defined it.

- [x] **Phase 7.1 — AI Provider Swap (OpenAI → Google Gemini)**
      Swapped the AI provider only. No new features, no UI change, no
      change to the Generate/Regenerate workflow, loading states, error
      handling, or toast notifications — `caption-service.ts` still
      exports the same `generateCaptionWithAI(context)` function with
      the same `GenerateCaptionResult` shape, so nothing outside
      `lib/ai/` needed to change.
      - `lib/ai/openai-client.ts` → replaced with
        `lib/ai/gemini-client.ts`: same lazy-singleton-client pattern,
        now wrapping `@google/genai`'s `GoogleGenAI`. Reads
        `GEMINI_API_KEY` (was `OPENAI_API_KEY`) and throws
        `MissingGeminiKeyError` (was `MissingOpenAIKeyError`) when
        unset. Model comes from `GEMINI_CAPTION_MODEL`, overridable via
        `GEMINI_MODEL` (was `OPENAI_MODEL`), defaulting to
        `gemini-2.5-flash` (was `gpt-4o-mini`).
      - `lib/ai/caption-service.ts` — internals updated to call
        `client.models.generateContent()` (Gemini) instead of
        `client.chat.completions.create()` (OpenAI); the prompt itself
        (`buildCaptionPrompt`, unchanged in `caption-prompts.ts`) is
        passed as `contents` + `config.systemInstruction` instead of
        `system`/`user` chat messages. Exported function name, params,
        and return type are unchanged.
      - `lib/supabase/post-ai-actions.ts` — no functional change; only
        a stale comment referencing "OpenAI" was corrected to "Gemini".
        `generateAiCaptionForPost` still has the same name and
        signature.
      - `package.json` — removed `openai`, added `@google/genai`
        (`^2.13.0`), Google's official Gemini SDK.
      - `.env.example` — `OPENAI_API_KEY` / `OPENAI_MODEL` replaced
        with `GEMINI_API_KEY` (required) / `GEMINI_MODEL` (optional).
      - Everything else from Phase 7 — the button placement/labels in
        `post-form-dialog.tsx`, the ownership check, the Supabase
        update to `posts.caption`, the prompt templates per platform —
        is untouched.

## Next

- [ ] **Phase 8 — TBD** (not yet scoped; per instruction, Publishing,
      Analytics, and Automation are explicitly out of scope until
      separately requested)

## Notes

- Requires a Supabase project. Set `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`).
- Password reset currently sends the reset email and redirects back to
  `/login`; a dedicated "set new password" confirmation page has not been
  built yet and is expected in a future part.
- No signup page has been built yet; user accounts are assumed to be
  provisioned directly in Supabase for now.
- Run `supabase/migrations/0001_create_agencies_table.sql` and
  `0002_agency_insert_update_policies.sql` (in order) in your Supabase
  project's SQL editor before loading `/agency`. **No migration exists
  for `clients`** — the table (and any RLS policies on it) already
  exists in the live project and this codebase does not create, modify,
  or generate migrations against it, per explicit instruction. Until an
  agency row exists for the logged-in user, `/agency` shows the empty
  state and `/clients` shows a "Set up your agency first" state;
  "Create Agency" and "Add Client" now open working forms.
- **Please verify RLS is configured on your live `clients` table** for
  select/insert/update/delete, scoped so a user can only touch clients
  belonging to their own agency (mirroring the policies on `agencies`
  from `0002_agency_insert_update_policies.sql`). Since no migration
  was written for `clients`, if RLS is enabled there without matching
  policies, writes will fail with a Postgres permission error rather
  than the friendly validation messages the app shows for other errors.
- **The "no duplicate client names per agency" rule is enforced at the
  application level only** (`lib/supabase/client-actions.ts`), not by a
  database constraint — no migration was written to add one. There's a
  small theoretical race-condition window under concurrent requests; if
  you'd like a database-level backstop, that would need a manually
  applied unique index since this codebase won't generate migrations
  for `clients`.
- **Assumption to verify against your live schema:** `status` on
  `clients` is treated as free text with three suggested values
  (`active`, `inactive`, `lead`) shown in a dropdown, defaulting to
  `active`. If your actual `status` column is a Postgres enum with
  different allowed values, let me know and I'll adjust the
  dropdown/validation to match.
- **No migration exists for `campaigns` either**, same reasoning as
  `clients` above — the table already exists live and this codebase
  does not generate migrations against it. Please verify RLS is
  configured on `campaigns` for select/insert/update/delete, scoped
  through the client's owning agency, or writes will fail with a raw
  Postgres permission error.
- **The "no duplicate campaign names per client" rule is enforced at
  the application level only** (`lib/supabase/campaign-actions.ts`),
  same caveat as the client-name rule above — no database constraint
  was added since no migration was written.
- **Assumption to verify against your live schema:** `status` on
  `campaigns` is treated as free text with four suggested values
  (`planning`, `active`, `paused`, `completed`) shown in a dropdown,
  defaulting to `planning`. If your actual `status` column has
  different allowed values, let me know and I'll adjust to match.
- To reach a client's campaigns, go to `/clients` and click the
  megaphone ("View Campaigns") icon on that client's row — this takes
  you to `/campaigns?client={id}`. Visiting `/campaigns` directly (e.g.
  via the sidebar) with no `client` in the URL shows a "Select a
  client" state that links back to `/clients`.
- **Run `supabase/migrations/0003_create_content_tasks_table.sql`** in
  your Supabase project's SQL editor (or via `supabase db push`) before
  loading `/content-tasks` — unlike `clients`/`campaigns`, this is a
  brand new table and the migration creates it, enables RLS, and adds
  all four CRUD policies.
- **The "no duplicate content task titles per campaign" rule is
  enforced at the application level** (`lib/supabase/content-task-actions.ts`),
  same as the client/campaign name rules above, with a Postgres
  unique-violation (23505) catch as a fallback — no database-level
  unique constraint was added.
- **Assumption to verify:** `status` on `content_tasks` uses four
  suggested values (`todo`, `in_progress`, `in_review`, `done`,
  defaulting to `todo`), and `priority` uses four suggested values
  (`low`, `medium`, `high`, `urgent`, defaulting to `medium`). `platform`
  and `content_type` are each a fixed dropdown of common values
  (defaulting to `instagram` / `post`). If you'd like different allowed
  values for any of these, let me know and I'll adjust the
  dropdowns/validation/migration check constraints to match.
- To reach a campaign's content tasks, go to `/campaigns?client={id}`
  and click the checklist ("View Content Tasks") icon on that
  campaign's row — this takes you to `/content-tasks?campaign={id}`.
  Visiting `/content-tasks` directly with no `campaign` in the URL shows
  a "Select a campaign" state that links back to `/campaigns`.
- **Run `supabase/migrations/0004_create_posts_table.sql`** in your
  Supabase project's SQL editor (or via `supabase db push`) before
  loading `/posts` — like `content_tasks`, this is a brand new table and
  the migration creates it, enables RLS, and adds all four CRUD
  policies.
- **The "no duplicate post titles per content task" rule is enforced at
  the application level** (`lib/supabase/post-actions.ts`), same as the
  client/campaign/content-task title rules above, with a Postgres
  unique-violation (23505) catch as a fallback — no database-level
  unique constraint was added.
- **Assumption to verify:** `status` on `posts` uses four suggested
  values (`draft`, `scheduled`, `published`, `cancelled`, defaulting to
  `draft`). `platform` reuses the same fixed dropdown of common values
  as Content Tasks (defaulting to `instagram`). If you'd like different
  allowed values for either of these, let me know and I'll adjust the
  dropdowns/validation/migration check constraints to match.
- To reach a content task's posts, go to `/content-tasks?campaign={id}`
  and click the document ("View Posts") icon on that content task's row
  — this takes you to `/posts?contentTask={id}`. Visiting `/posts`
  directly with no `contentTask` in the URL shows a "Select a content
  task" state that links back to `/content-tasks`.
- **Build verification note:** this sandbox's `node_modules` ships only
  a Windows `@next/swc` binary with no network access to fetch the
  Linux one, so `next build` itself couldn't run here. `npm install`
  (offline), `npm run lint`, and `npx tsc --noEmit` (full strict
  type-check, same checks `next build` runs before compiling) were all
  run and passed with zero errors. Please run `npm run build` once in
  your own environment to confirm the production compile step too.
- **Set `GEMINI_API_KEY`** in `.env.local` before using "Generate AI
  Caption" / "Regenerate Caption" on `/posts` — without it, clicking
  the button shows a clear error toast ("AI caption generation isn't
  configured yet...") instead of a crash; nothing else in the app is
  affected. `GEMINI_MODEL` is optional and defaults to
  `gemini-2.5-flash`. Phase 7 required no migration and no RLS change —
  it only ever writes to the `caption` column that Phase 6's
  `0004_create_posts_table.sql` already created.
- **Phase 7 build verification:** unlike prior phases, this sandbox had
  network access to the npm registry, so `npm install`, `npx tsc
  --noEmit`, `npm run lint`, and `npm run build` were all run for real
  (against placeholder Supabase env values) and all passed with zero
  errors/warnings.
