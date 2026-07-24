# AI Social Media Operations Platform

Enterprise AI-powered Marketing Operations Platform.

This repository currently contains the **project foundation, UI foundation,
and project architecture** only — a clean, minimal Next.js starter with a
shadcn/ui design system and a scalable folder structure, and no business
logic, authentication, database, or API layers yet.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Button, Input, Card, Label, Separator)
- [ESLint](https://eslint.org/)
- npm

## Folder Structure

```text
app/
  (public)/        # Public-facing routes (e.g. homepage)
  (protected)/     # Reserved for future authenticated routes
components/
  ui/              # shadcn/ui components (Button, Input, Card, Label, Separator)
  shared/          # Reusable components shared across features (placeholder)
  layouts/         # Structural layout components (placeholder)
lib/
  utils/           # Shared utility functions (cn() helper lives here)
  constants/       # Shared app-wide constants (placeholder)
hooks/             # Custom React hooks
types/             # Shared TypeScript types and interfaces (placeholder)
public/
  images/          # Static image assets
  icons/           # Static icon assets
styles/            # Reserved for additional stylesheets
components.json    # shadcn/ui configuration
```

Route groups `(public)` and `(protected)` do not affect URL paths — they exist
purely to organize routes by access level as the app grows. The `(protected)`
group is currently empty and reserved for future use.

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

This is **Part 1.3 — Project Architecture**. The project now has a scalable
folder structure with route groups, placeholder barrel files, and organized
static asset folders. No dashboard, authentication, database, API routes,
server actions, sidebar, header, or business modules have been added yet.
