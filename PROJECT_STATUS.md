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

## Next

- [ ] **Phase 5 / Content Tasks — TBD** (not yet scoped)

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
