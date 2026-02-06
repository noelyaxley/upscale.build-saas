# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` — Start development server (Next.js with Turbopack)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Architecture

This is **Upscale.Build**, a construction project management SaaS built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and Supabase.

### Stack

- **Framework:** Next.js 16 (App Router, React Server Components by default)
- **Styling:** Tailwind CSS v4 via PostCSS, with oklch color variables (orange primary theme)
- **UI Components:** shadcn/ui pattern — Radix UI primitives styled with Tailwind, CVA for variants
- **Icons:** Lucide React
- **Backend:** Supabase (@supabase/supabase-js + @supabase/ssr)
- **TypeScript:** Strict mode enabled

### Project Layout

```
src/
├── app/
│   ├── (app)/                    # Authenticated app shell (with sidebar)
│   │   ├── layout.tsx            # Server: fetches profile/org/projects, wraps with providers
│   │   └── dashboard/page.tsx    # Dashboard with stats grid and project cards
│   ├── auth/callback/            # Supabase auth code exchange
│   ├── login/                    # Login page (client, redirects to /dashboard)
│   ├── signup/                   # Signup page (client)
│   ├── onboarding/               # Org creation (outside app shell)
│   ├── logout/                   # Sign out (server, redirects to /)
│   ├── forgot-password/          # Password reset request
│   ├── reset-password/           # New password entry
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Theme variables (orange primary)
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── landing/                  # Landing page sections (header, hero, features, pricing, footer)
│   ├── app-sidebar.tsx           # Main app sidebar navigation
│   ├── project-card.tsx          # Project card component
│   └── create-project-dialog.tsx # New project dialog (admin only)
├── lib/
│   ├── context/organisation.tsx  # OrganisationProvider context
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   ├── proxy.ts              # Middleware: session refresh + route protection
│   │   └── database.types.ts     # Generated TypeScript types
│   └── utils.ts                  # cn() utility
├── hooks/
│   └── use-mobile.ts             # Mobile detection hook
└── proxy.ts                      # Root proxy (Next.js 16 convention)
```

### Database Schema (Supabase)

All tables have RLS enabled, scoped by `org_id` via `get_user_org_id()`.

**Core tables:**

| Table | Purpose |
|-------|---------|
| `organisations` | Multi-tenant root entity |
| `profiles` | Extends auth.users with org_id, role (admin/user) |
| `companies` | Org-scoped companies |
| `projects` | Org-scoped projects with code, stage, status, budget |
| `project_members` | Links users to projects with roles |

**Variations & Claims:**

| Table | Purpose |
|-------|---------|
| `variations` | Change orders with cost/time impact, status workflow (draft→submitted→approved/rejected) |
| `progress_claims` | Payment claims per period with claimed/certified amounts |
| `claim_line_items` | Breakdown line items for a progress claim (RLS via parent claim) |

**Site Diary:**

| Table | Purpose |
|-------|---------|
| `site_diary_entries` | Daily site records — weather, work summary, safety, delays, photos. Unique per project+date |
| `diary_labor_entries` | Workers on site per trade/company (RLS via parent diary entry) |
| `diary_equipment_entries` | Equipment usage log (RLS via parent diary entry) |
| `diary_visitors` | Visitor sign-in/out log (RLS via parent diary entry) |

**Extension of Time:**

| Table | Purpose |
|-------|---------|
| `extension_of_time` | EOT claims with days claimed/approved, date impacts, status workflow (draft→submitted→approved/rejected) |

**Consultants / Procurement:**

| Table | Purpose |
|-------|---------|
| `consultants` | Professional service providers per project with budget/contract tracking, status workflow (draft→engaged→completed/terminated) |
| `consultant_phases` | Contract phases (e.g. Schematic Design) with fee, variations, disbursements, paid amounts (RLS via parent consultant) |

**Enums:** `variation_status`, `claim_status`, `weather_condition`, `eot_status`, `consultant_status`, `phase_status`

Helper function: `get_user_org_id()` — used in RLS policies for efficient org scoping.
Auto-profile trigger: Creates profile row on auth.users insert.
Auto-numbering triggers: `variation_number`, `claim_number`, `eot_number` auto-increment per project.
Updated_at triggers: Use `extensions.moddatetime()` on all tables with `updated_at`.

### Key Patterns

- **Path alias:** `@/*` maps to `./src/*`
- **Route groups:** `(app)` for authenticated routes with sidebar
- **Component style:** shadcn/ui "new-york" style; add via `npx shadcn@latest add <name>`
- **Client components:** Only use `"use client"` where interactivity is needed
- **Theming:** CSS variables using oklch color space; orange primary (`oklch(0.65 0.19 45)`)
- **Auth proxy:** Uses `getClaims()` for session refresh; protects `/dashboard`, `/projects/*`, `/settings`, `/onboarding`
- **Logout:** Server component pattern — NOT client component with useEffect
- **Organisation context:** `useOrganisation()` provides profile, org, projects, isAdmin

### Error Troubleshooting

- HTTP 431 / Turbopack panic: Clear cache with `rm -rf .next node_modules/.cache && npm run dev`
- Do NOT modify auth code to "fix" cache issues
