# AI Social Media Operations Platform

Enterprise AI-powered Marketing Operations Platform.

This repository currently contains the project foundation, UI foundation,
project architecture, authentication, application dashboard layout, and the
**Agency Workspace UI wired to Supabase** — a clean, minimal Next.js app
with a shadcn/ui design system, a scalable folder structure, Supabase
email/password authentication, a responsive authenticated application
shell, and a read-only Agency Workspace page backed by a real `agencies`
table. Create/update/delete for the agency is not implemented yet.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Button, Input, Card, Label, Separator)
- [Supabase Authentication](https://supabase.com/docs/guides/auth) (`@supabase/ssr`)
- [lucide-react](https://lucide.dev/) (icons)
- [ESLint](https://eslint.org/)
- npm

## Folder Structure

```text
app/
  (public)/        # Public-facing routes: home, /login, /forgot-password
  (protected)/     # Authenticated routes: layout guard + dashboard shell
                    #   /home, /agency, /team, /clients, /campaigns,
                    #   /content-tasks, /posts, /publishing, /analytics,
                    #   /reports, /settings (all placeholder pages)
components/
  ui/              # shadcn/ui components (Button, Input, Card, Label, Separator)
  shared/          # Reusable components (forms, avatar, logout button,
                    #   placeholder page)
  layouts/         # Structural layout components (app shell, sidebar,
                    #   site header)
lib/
  utils/           # Shared utility functions (cn(), getInitials())
  constants/       # Shared app-wide constants (nav items, auth routes,
                    #   protected paths)
  supabase/        # Supabase client/server/middleware factories
hooks/             # Custom React hooks (sidebar collapse/drawer state)
types/             # Shared TypeScript types and interfaces (placeholder)
public/
  images/          # Static image assets
  icons/           # Static icon assets
styles/            # Reserved for additional stylesheets
middleware.ts      # Refreshes the Supabase session and guards protected paths
components.json    # shadcn/ui configuration
```

Route groups `(public)` and `(protected)` do not affect URL paths — they exist
purely to organize routes by access level as the app grows.

## Absolute Imports

All imports use the `@/*` path alias configured in `tsconfig.json`, e.g.:

```ts
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## UI Foundation

The design system is configured via CSS variables in `app/globals.css`
(colors, radius, light/dark theme tokens) using Tailwind CSS v4's CSS-first
configuration. Components follow the default shadcn/ui implementation and are
theme-ready out of the box.

To add more shadcn/ui components later, use:

```bash
npx shadcn@latest add <component>
```

## Prerequisites

- Node.js 18.18 or later
- npm 9 or later

## Database

The `agencies` table stores one workspace profile per user. Apply the
migration in `supabase/migrations/0001_create_agencies_table.sql` via the
Supabase SQL editor or the Supabase CLI:

```bash
supabase db push
```

Row Level Security is enabled with a read-only policy
(`auth.uid() = user_id`) — Part 2.4A only reads data; insert/update
policies will be added alongside CRUD in Part 2.4B.

Data access lives in `lib/supabase/agencies.ts`
(`getAgencyForUser(userId)`) — this is the only place that queries the
`agencies` table; no database logic lives inside UI components. Types are
defined by hand in `types/database.ts` and used to create a typed Supabase
client in `lib/supabase/client.ts` / `lib/supabase/server.ts`.

## Authentication

Authentication is powered by [Supabase](https://supabase.com/) using
`@supabase/ssr` for cookie-based session management across Server
Components, Client Components, and middleware.

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. Copy your Project URL and anon public key from **Project Settings → API**.
3. Add them to `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Create a user (via the Supabase dashboard, or enable sign-ups) to test
   the login flow at `/login`.

**Routes:**

| Route               | Access    | Description                              |
| -------------------- | --------- | ----------------------------------------- |
| `/`                  | Public    | Marketing homepage                       |
| `/login`             | Public    | Email/password login                     |
| `/forgot-password`   | Public    | Sends a Supabase password reset email    |
| `/home`              | Protected | Dashboard (placeholder)                  |
| `/agency`            | Protected | Agency Workspace (Supabase, read-only)   |
| `/team`              | Protected | Team (placeholder)                       |
| `/clients`           | Protected | Clients (placeholder)                    |
| `/campaigns`         | Protected | Campaigns (placeholder)                  |
| `/content-tasks`     | Protected | Content Tasks (placeholder)              |
| `/posts`             | Protected | Posts (placeholder)                      |
| `/publishing`        | Protected | Publishing (placeholder)                 |
| `/analytics`         | Protected | Analytics (placeholder)                  |
| `/reports`           | Protected | Reports (placeholder)                    |
| `/settings`          | Protected | Settings (placeholder)                   |

Unauthenticated visitors to protected routes are redirected to `/login`,
with a `redirectTo` query param that sends them back after signing in.

## Application Shell

Authenticated pages render inside a shared dashboard shell
(`components/layouts/app-shell.tsx`):

- **Sidebar** (`app-sidebar.tsx`) — 11 nav items with icons and active-item
  highlighting. Fixed on desktop, collapsible to icon-only on tablet via
  the header toggle, and an off-canvas drawer on mobile.
- **Header** (`site-header.tsx`) — breadcrumb, global search input (UI
  only), notifications icon (UI only), user avatar, email, and logout.
- Nav items are centralized in `lib/constants/index.ts` (`NAV_ITEMS`), which
  also drives `PROTECTED_PATHS` used by the middleware.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example file and fill in any values you need:

   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                              |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start the development server              |
| `npm run build` | Build the application for production      |
| `npm run start` | Start the production server (after build) |
| `npm run lint`  | Run ESLint                                |

## Project Status

This is **Part 2.4A — Supabase Integration & Agency Data Fetch**. The
`/agency` page now reads real data from a Supabase `agencies` table
(read-only), with loading, empty, and error states. See
[PROJECT_STATUS.md](./PROJECT_STATUS.md) for the full delivery log. Create,
update, and delete for the agency are not implemented yet — that's Part
2.4B.
