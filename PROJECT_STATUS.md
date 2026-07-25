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

## Next

- [ ] **Part 2.4B — Agency CRUD**

## Notes

- Requires a Supabase project. Set `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`).
- Password reset currently sends the reset email and redirects back to
  `/login`; a dedicated "set new password" confirmation page has not been
  built yet and is expected in a future part.
- No signup page has been built yet; user accounts are assumed to be
  provisioned directly in Supabase for now.
- Run `supabase/migrations/0001_create_agencies_table.sql` in your
  Supabase project's SQL editor (or via the Supabase CLI) before loading
  `/agency` — the table does not exist until this migration is applied.
  Until an agency row exists for the logged-in user, `/agency` will show
  the empty state ("Create Agency" is UI-only until Part 2.4B).
