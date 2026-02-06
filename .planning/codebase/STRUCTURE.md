# Codebase Structure

**Analysis Date:** 2026-02-07

## Directory Layout

```
upscale.build-saas/
├── src/
│   ├── app/                          # Next.js App Router (pages, layouts, routes)
│   │   ├── (app)/                    # Authenticated app shell with sidebar
│   │   │   ├── layout.tsx            # Server: Fetches user, org, projects; provides OrganisationProvider
│   │   │   ├── dashboard/            # Main dashboard with stats and project cards
│   │   │   ├── projects/             # Project management hub
│   │   │   │   ├── [id]/             # Dynamic project ID routes
│   │   │   │   │   ├── tenders/      # Tender management (list + detail)
│   │   │   │   │   ├── site-diary/   # Site diary entries (list + detail)
│   │   │   │   │   ├── variations/   # Change order variations (list + detail)
│   │   │   │   │   ├── rfis/         # Request for Information (list + detail)
│   │   │   │   │   ├── sales-agents/ # Sales agents view
│   │   │   │   │   ├── defects/      # Defect tracking (list + detail)
│   │   │   │   │   ├── lot-sales/    # Lot sales (list + detail)
│   │   │   │   │   ├── consultants/  # Consultant management (list + detail)
│   │   │   │   │   ├── risks/        # Risk register
│   │   │   │   │   ├── submittals/   # Contractor submittals (list + detail)
│   │   │   │   │   ├── programmes/   # Gantt chart and schedule
│   │   │   │   │   ├── feasibility/  # Feasibility appraisal scenarios
│   │   │   │   │   ├── documents/    # Document management
│   │   │   │   │   ├── eot/          # Extension of Time claims (list + detail)
│   │   │   │   │   ├── reports/      # Project reports
│   │   │   │   │   ├── claims/       # Progress claims
│   │   │   │   │   ├── project-detail.tsx  # Client: Detailed project view with members, activity
│   │   │   │   │   └── page.tsx      # Server: Fetches project and related data
│   │   │   ├── settings/             # User/org settings
│   │   │   ├── team/                 # Team management
│   │   │   ├── companies/            # Company management (list + detail)
│   │   ├── (client-portal)/          # Public token-based portal (no auth, no sidebar)
│   │   │   └── client-portal/        # Shareable project view for external clients
│   │   ├── auth/                     # Authentication routes
│   │   │   └── callback/             # Supabase OAuth callback (route.ts)
│   │   ├── login/                    # Login page (client component)
│   │   ├── signup/                   # Signup page (client component)
│   │   ├── logout/                   # Logout endpoint
│   │   ├── onboarding/               # Org creation / first-time setup
│   │   ├── forgot-password/          # Password reset request
│   │   ├── reset-password/           # Password reset completion
│   │   ├── layout.tsx                # Root layout: Fonts, metadata, base HTML
│   │   ├── page.tsx                  # Landing page (public)
│   │   └── globals.css               # Global styles with CSS variables (oklch color space)
│   ├── components/                   # Shared React components
│   │   ├── ui/                       # shadcn/ui primitives (Badge, Button, Card, Dialog, etc.)
│   │   ├── landing/                  # Landing page sections (Header, Hero, Features, Pricing, Footer)
│   │   ├── app-sidebar.tsx           # Main app navigation sidebar (client)
│   │   ├── project-card.tsx          # Project grid card component
│   │   ├── create-project-dialog.tsx # Dialog to create new project (admin only)
│   │   ├── create-*-dialog.tsx       # Dialog forms for resources (tender, claim, eot, consultant, lot, etc.)
│   │   ├── edit-*-dialog.tsx         # Dialog forms for editing resources
│   │   ├── delete-*-dialog.tsx       # Confirmation dialogs for deletion
│   │   ├── project-card.tsx          # Project card in project list
│   │   ├── company-card.tsx          # Company card for company list
│   │   ├── project-members-list.tsx  # Team member list for project
│   │   ├── project-action-items.tsx  # Action items component
│   │   ├── project-activity-feed.tsx # Activity/update feed
│   │   ├── upload-document-dialog.tsx # Document upload form
│   │   └── share-portal-dialog.tsx   # Share client portal link
│   ├── lib/                          # Utility and config modules
│   │   ├── context/
│   │   │   └── organisation.tsx      # OrganisationContext and useOrganisation() hook
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client factory (@supabase/ssr)
│   │   │   ├── server.ts             # Server Supabase client with cookie handling
│   │   │   ├── service.ts            # Service role client (bypasses RLS, server-only)
│   │   │   ├── proxy.ts              # Middleware: Session refresh + route protection
│   │   │   └── database.types.ts     # Generated TypeScript types from Supabase schema
│   │   ├── utils.ts                  # Shared utilities (cn() for Tailwind merging)
│   ├── hooks/                        # Custom React hooks
│   │   └── use-mobile.ts             # useIsMobile() hook for responsive design
│   └── proxy.ts                      # Root middleware export (Next.js 16 pattern)
├── supabase/                         # Supabase configuration and migrations
│   ├── migrations/                   # SQL migration files
│   └── .temp/                        # Temporary Supabase CLI files
├── public/                           # Static assets
├── .planning/                        # GSD planning documents
│   └── codebase/                     # Analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
├── .env.local                        # Local environment config (git-ignored)
├── .next/                            # Next.js build output (git-ignored)
├── .git/                             # Git repository
├── package.json                      # Dependencies and scripts
├── package-lock.json                 # Locked dependencies
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── components.json                   # shadcn/ui configuration
├── eslint.config.mjs                 # ESLint rules
├── postcss.config.mjs                # PostCSS config (for Tailwind)
└── CLAUDE.md                         # Instructions for Claude Code

```

## Directory Purposes

**`src/app/`**
- Purpose: Next.js App Router - all routes, pages, and layouts
- Contains: Page components (page.tsx), layout components (layout.tsx), API routes (route.ts)
- Key files: See layout above

**`src/app/(app)/`**
- Purpose: Authenticated application shell with sidebar navigation
- Contains: Pages and layouts for authenticated users
- Key files: `layout.tsx` (server component that fetches user/org/projects), various project-related pages

**`src/app/(client-portal)/`**
- Purpose: Public client portal for external stakeholders
- Contains: Public pages accessible via shareable token
- Key files: Client portal views (not fully shown)

**`src/components/`**
- Purpose: Reusable UI components
- Contains: shadcn/ui components, landing page sections, dialogs, shared components
- Key files: `ui/` (primitive components), `app-sidebar.tsx` (main nav), `create-*-dialog.tsx` (CRUD dialogs)

**`src/lib/`**
- Purpose: Core utilities, configuration, and abstractions
- Contains: Supabase client factories, context providers, utilities
- Key files: `supabase/` (client initialization), `context/organisation.tsx` (context provider)

**`src/lib/supabase/`**
- Purpose: Supabase client abstractions and middleware
- Contains: Client factories for different contexts, auth session management, database types
- Key files:
  - `client.ts` - Browser client (anon key, read-only for RLS)
  - `server.ts` - Server client (anon key, reads auth from cookies)
  - `service.ts` - Service role client (service key, bypasses RLS)
  - `proxy.ts` - Middleware that refreshes sessions and protects routes
  - `database.types.ts` - Generated from Supabase schema (tables, enums, functions)

**`src/hooks/`**
- Purpose: Custom React hooks
- Contains: Utility hooks for components
- Key files: `use-mobile.ts` - Mobile breakpoint detection

**`supabase/`**
- Purpose: Supabase configuration and schema
- Contains: SQL migrations, Supabase CLI configuration
- Key files: `migrations/` (SQL migration files for schema changes)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Public landing page
- `src/app/(app)/layout.tsx` - Authenticated app shell (fetches user, org, projects; provides context)
- `src/app/(app)/dashboard/page.tsx` - Dashboard (stats and project list)
- `src/app/auth/callback/route.ts` - OAuth callback handler

**Authentication & Authorization:**
- `src/proxy.ts` - Middleware export (Next.js 16 pattern)
- `src/lib/supabase/proxy.ts` - Core middleware logic (session refresh, route protection)
- `src/lib/supabase/client.ts` - Browser auth client
- `src/lib/supabase/server.ts` - Server auth client with cookie handling

**Core Data & Context:**
- `src/lib/context/organisation.tsx` - Organisation context provider and hook
- `src/lib/supabase/service.ts` - Service role client for privileged operations

**Styling & Theme:**
- `src/app/globals.css` - Global styles with CSS variables (oklch color space, orange primary)
- `src/components/ui/` - shadcn/ui components styled with Tailwind
- `tailwind.config.ts` - Tailwind CSS configuration (if present)

**Configuration:**
- `tsconfig.json` - TypeScript configuration with path alias `@/*` → `./src/*`
- `next.config.ts` - Next.js configuration
- `components.json` - shadcn/ui component library config
- `package.json` - Dependencies and scripts

## Naming Conventions

**Files:**

| Pattern | Example | Usage |
|---------|---------|-------|
| `page.tsx` | `src/app/dashboard/page.tsx` | Next.js page/route component |
| `layout.tsx` | `src/app/(app)/layout.tsx` | Next.js layout wrapper |
| `route.ts` | `src/app/auth/callback/route.ts` | Next.js API route handler |
| `*-view.tsx` | `tenders-view.tsx` | Client component that renders list/grid of items |
| `*-detail.tsx` | `tender-detail.tsx` | Client component that renders single item details |
| `*-dialog.tsx` | `create-tender-dialog.tsx` | Client component that renders a modal dialog form |
| `use-*.ts` | `use-mobile.ts` | Custom React hook |
| `*-provider.tsx` | N/A (org context) | Context provider component |
| `*-sidebar.tsx` | `app-sidebar.tsx` | Sidebar navigation component |
| `*-card.tsx` | `project-card.tsx` | Card/grid cell component |

**Directories:**

| Pattern | Example | Usage |
|---------|---------|-------|
| `(group)` | `(app)`, `(client-portal)` | Next.js route group (doesn't affect URL) |
| `[param]` | `[id]`, `[token]` | Next.js dynamic route segment |
| `resource/` | `projects/`, `tenders/`, `site-diary/` | Resource-specific routes with pages and views |
| `resource/[id]/` | `[id]/tenders/`, `[id]/site-diary/` | Nested dynamic routes for sub-resources |

## Where to Add New Code

**New Feature (e.g., New Construction Module):**
1. **Database:** Add tables/enums to `supabase/migrations/` SQL file
2. **Types:** Regenerate `src/lib/supabase/database.types.ts` from Supabase schema
3. **Server Page:** Create `src/app/(app)/projects/[id]/new-feature/page.tsx` to fetch data
4. **Client View:** Create `src/app/(app)/projects/[id]/new-feature/new-feature-view.tsx` for rendering/interaction
5. **Dialogs:** Create `src/components/create-new-feature-dialog.tsx` for CRUD forms
6. **Sidebar:** Update `src/components/app-sidebar.tsx` to add navigation link
7. **Tests:** Add tests in collocated `.test.tsx` files (if testing framework configured)

**New Component:**
- Shared UI component: `src/components/my-component.tsx`
- Page-specific component: `src/app/(app)/specific-route/my-component.tsx`
- Dialog form: `src/components/create-resource-dialog.tsx` or `src/components/edit-resource-dialog.tsx`

**New Utility/Helper:**
- Shared utility: `src/lib/[domain]/my-utility.ts` (e.g., `src/lib/formatting/currency.ts`)
- Custom hook: `src/hooks/use-my-hook.ts`
- Context: `src/lib/context/my-context.tsx`

**New API Route:**
- Supabase SSR callback: `src/app/auth/callback/route.ts` (already exists)
- Custom API endpoint (if needed): `src/app/api/route-name/route.ts`

## Special Directories

**`.env.local`:**
- Purpose: Local environment configuration
- Generated: Manual setup required
- Committed: No (git-ignored)
- Contains: Supabase URL, keys, and other secrets

**`.next/`:**
- Purpose: Next.js build output (compiled JavaScript, cached data)
- Generated: Yes (by `npm run build` or dev server)
- Committed: No (git-ignored)
- Cleared: `rm -rf .next` if build cache corrupted

**`.planning/codebase/`:**
- Purpose: GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: By GSD agents
- Committed: Yes (reference for future work)

**`supabase/.temp/`:**
- Purpose: Temporary files from Supabase CLI
- Generated: Yes (by Supabase CLI)
- Committed: No (git-ignored)

**`public/`:**
- Purpose: Static assets (favicon, images, fonts)
- Generated: Manual upload
- Committed: Yes
- Serves: Via `src/app/page.tsx` or direct URL

**`supabase/migrations/`:**
- Purpose: SQL migration files that define database schema
- Generated: Manual creation for schema changes
- Committed: Yes
- Format: Numbered `YYYYMMDDHHMMSS_description.sql` files

## Path Aliases

**`@/*`** maps to **`./src/*`**

Used throughout the codebase for cleaner imports:
- `import { useOrganisation } from "@/lib/context/organisation"` instead of `../../lib/context/organisation`
- `import { Badge } from "@/components/ui/badge"` instead of `../../../components/ui/badge`

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

*Structure analysis: 2026-02-07*
