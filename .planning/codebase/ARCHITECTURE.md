# Architecture

**Analysis Date:** 2026-02-07

## Pattern Overview

**Overall:** Next.js 16 App Router with React Server Components (RSC) as default, multi-tenant SaaS with Supabase backend.

**Key Characteristics:**
- Next.js 16 (React 19) with App Router and Server Components as primary pattern
- Multi-tenant architecture scoped by `org_id` at database and context layer
- Route groups for separate authentication flows: `(app)` for authenticated users with sidebar, `(client-portal)` for public token-based access
- Supabase for authentication, authorization (RLS), and data persistence
- Organisation context (React context) passed through server layout to client components
- Separation of concerns: server-side data fetching in pages, client-side interactivity in view/detail components
- Row-Level Security (RLS) enforced at database layer using `get_user_org_id()` function

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/components/` (shared), `src/app/` (route-specific views)
- Contains: shadcn/ui based components (ui/), dialog forms for creation/editing, view components (e.g., `*-view.tsx`), detail components (e.g., `*-detail.tsx`)
- Depends on: React, UI library, Supabase client for browser-side queries
- Used by: Next.js pages and layouts

**Data Fetching Layer (Server Components & Pages):**
- Purpose: Fetch data on server, render initial HTML, pass props to child components
- Location: `src/app/` (layout.tsx and page.tsx files)
- Contains: Pages and layouts that use `async` to fetch from Supabase, handle redirects, and compose context providers
- Depends on: `@/lib/supabase/server.ts` for server client
- Used by: Next.js App Router, client components nested within them

**Context & State Management:**
- Purpose: Provide organisation, profile, and project data to client components without prop drilling
- Location: `src/lib/context/organisation.tsx`
- Contains: `OrganisationContext` and `useOrganisation()` hook with profile, organisation, projects, and isAdmin flag
- Depends on: React Context API, Supabase database types
- Used by: Client components that need organisation/project context (sidebar, dashboard, etc.)

**Backend Client Layer:**
- Purpose: Abstract Supabase client initialization for different contexts (browser, server, service role)
- Location: `src/lib/supabase/`
- Contains: `client.ts` (browser), `server.ts` (server with cookie handling), `service.ts` (service role for server-only operations)
- Depends on: `@supabase/ssr` and `@supabase/supabase-js`
- Used by: All data fetching code

**Authentication & Session Layer:**
- Purpose: Maintain user session, refresh tokens, protect routes
- Location: `src/lib/supabase/proxy.ts` (Next.js 16 middleware pattern) and `src/proxy.ts` (root export)
- Contains: `updateSession()` that refreshes auth tokens, checks protected routes, redirects unauthenticated users
- Depends on: Supabase server client, Next.js middleware
- Used by: Next.js request lifecycle (middleware runs on every request)

**Utilities & Helpers:**
- Purpose: Shared utilities and styling utilities
- Location: `src/lib/utils.ts`, `src/hooks/`
- Contains: `cn()` for Tailwind class merging, `useIsMobile()` for responsive hooks
- Depends on: clsx, tailwind-merge, React
- Used by: Components throughout the app

## Data Flow

**Authenticated Page Access Flow:**

1. Request enters middleware (`src/proxy.ts` → `src/lib/supabase/proxy.ts`)
2. `updateSession()` refreshes auth token via `supabase.auth.getClaims()`
3. If route is protected and user not authenticated → redirect to `/login` with next param
4. If public route (e.g., `/client-portal`) → pass through
5. Route handler executes (layout or page)

**App Shell Data Fetching Flow (e.g., Dashboard):**

1. User navigates to `/dashboard` (or any `/(app)/*` route)
2. `src/app/(app)/layout.tsx` server component executes:
   - Fetches user from `supabase.auth.getUser()`
   - If not authenticated → redirect to `/login`
   - Fetches profile, organisation, and projects in parallel
   - If no org_id → redirect to `/onboarding`
3. Wraps children with `OrganisationProvider` providing fetched data
4. Renders `SidebarProvider` and `AppSidebar` (client component that uses `useOrganisation()`)
5. Routes to specific page (e.g., `src/app/(app)/dashboard/page.tsx`)

**Resource Detail Page Flow (e.g., Project Tenders):**

1. Server page component (`src/app/(app)/projects/[id]/tenders/page.tsx`) receives `params` and `searchParams` as Promises
2. Awaits params and searchParams
3. Fetches project via Supabase server client
4. Builds filtered query (e.g., by status) and fetches tenders with related data (companies, submissions)
5. Passes data to client view component (`TendersView`)
6. Client view component handles filtering, sorting, dialogs, and user interactions

**State Management:**

- **Server State:** Fetched on each page load in server components; re-fetched on form submission via server actions or page refresh
- **Context State:** Organisation, profile, projects passed via `OrganisationProvider` at app shell level; accessed via `useOrganisation()` hook in client components
- **Client State:** Minimal; dialogs, form inputs, and transient UI state managed locally in client components with `useState`
- **URL State:** Filter/sort parameters passed via `searchParams` (query string) and handled by server page to control initial data fetch

## Key Abstractions

**Supabase Clients:**
- Purpose: Encapsulate Supabase client initialization with proper configuration
- Examples: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/service.ts`
- Pattern: Each exports a `createClient()` factory function that returns typed Supabase client

**Page + View/Detail Component Pattern:**
- Purpose: Separate data fetching (server) from rendering and interaction (client)
- Examples:
  - `src/app/(app)/projects/[id]/tenders/page.tsx` (server) + `src/app/(app)/projects/[id]/tenders/tenders-view.tsx` (client)
  - `src/app/(app)/projects/[id]/site-diary/page.tsx` (server) + `src/app/(app)/projects/[id]/site-diary/site-diary-view.tsx` (client)
- Pattern: Page is async server component that fetches data; view/detail is "use client" component that renders and allows interaction

**Dialog Form Components:**
- Purpose: Encapsulate creation/editing of resources with form validation and Supabase mutations
- Examples: `src/components/create-tender-dialog.tsx`, `src/components/create-claim-dialog.tsx`, `src/components/edit-project-dialog.tsx`
- Pattern: Client component with form, state management, Supabase mutations; often triggered by button from parent view

**Organisation Context:**
- Purpose: Avoid prop drilling of common data (profile, organisation, projects) through nested component trees
- Location: `src/lib/context/organisation.tsx`
- Pattern: Provided at app shell (`/(app)/layout.tsx`) and consumed via `useOrganisation()` hook in client components

**shadcn/ui Components:**
- Purpose: Unstyled, composable UI components built on Radix UI with Tailwind styling
- Location: `src/components/ui/`
- Pattern: Components imported from shadcn; use CVA (class-variance-authority) for variants

## Entry Points

**Landing Page (`/`):**
- Location: `src/app/page.tsx`
- Triggers: Public access, unauthenticated users
- Responsibilities: Renders landing page with Header, Hero, Features, Pricing, Footer components

**Authentication Routes:**
- **Login:** `src/app/login/` (not implemented in shown code, but referenced in redirects)
- **Signup:** `src/app/signup/` (not implemented in shown code, but referenced in redirects)
- **Auth Callback:** `src/app/auth/callback/route.ts` — Supabase OAuth callback that exchanges code for session
- **Logout:** `src/app/logout/` (not implemented, but referenced in redirects)

**App Shell Entry (`/dashboard`):**
- Location: `src/app/(app)/layout.tsx` (server) + `src/app/(app)/dashboard/page.tsx` (client)
- Triggers: Authenticated users accessing `/(app)/*` routes
- Responsibilities:
  - Layout: Fetch user session, profile, organisation, projects; wrap in providers (OrganisationProvider, SidebarProvider)
  - Dashboard: Display stats grid and project cards; allow admin to create new projects

**Project Routes:**
- Location: `src/app/(app)/projects/[id]/` (various pages for different resources: tenders, site-diary, variations, etc.)
- Triggers: User clicks on project or navigates to project detail
- Responsibilities: Fetch project-specific resources; render views with filtering, sorting, and CRUD operations

**Onboarding (`/onboarding`):**
- Location: `src/app/onboarding/` (referenced but full implementation not shown)
- Triggers: User has no org_id (newly signed up)
- Responsibilities: Allow user to create or join organisation

**Client Portal (`/client-portal/[token]`):**
- Location: `src/app/(client-portal)/`
- Triggers: Public access via shareable token (no auth required)
- Responsibilities: Allow external clients to view shared project data

## Error Handling

**Strategy:** Server-side redirects and error boundaries for client components

**Patterns:**
- **Server: `notFound()`** — Used when resource not found (e.g., project doesn't exist). Returns 404 page.
- **Server: `redirect()`** — Used for auth checks (e.g., no user → `/login`, no org → `/onboarding`). Issues client-side redirect.
- **Client: Error boundaries** — Not explicitly shown but implied for component errors
- **Server: `try/catch` implicit** — Supabase query errors bubble up; may crash page or return null data

**Example from `src/app/(app)/projects/[id]/page.tsx`:**
```typescript
const { data: project, error } = await supabase.from("projects").select(...).single();
if (error || !project) {
  notFound(); // Returns 404
}
```

## Cross-Cutting Concerns

**Logging:** Not detected in code; likely uses browser console in client components and server logs in runtime.

**Validation:**
- Forms use HTML5 input validation and custom logic in dialog components
- Supabase RLS enforces data integrity at database layer
- No centralized validation schema (e.g., Zod) detected

**Authentication:**
- Middleware-based session refresh via `supabase.auth.getClaims()` on every request
- Route protection via `isProtectedRoute()` check in middleware
- User role (admin/user) stored in profiles table and made available via `useOrganisation()` hook

**Authorization:**
- Row-Level Security (RLS) at database layer — all queries automatically scoped to user's org_id via `get_user_org_id()` function
- Admin checks in components via `useOrganisation().isAdmin` to control UI visibility (e.g., CreateProjectDialog)
- Service role client (`src/lib/supabase/service.ts`) used only for server-only operations that need to bypass RLS (e.g., client portal access)

---

*Architecture analysis: 2026-02-07*
