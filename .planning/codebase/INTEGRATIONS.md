# External Integrations

**Analysis Date:** 2026-02-07

## APIs & External Services

**No direct third-party API integrations detected.** The application does not integrate with external services like Stripe, Twilio, SendGrid, Slack, or other APIs. All functionality is self-contained or delegated to Supabase.

## Data Storage

**Primary Database:**
- **PostgreSQL via Supabase**
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (public URL)
  - Client libraries:
    - `@supabase/supabase-js` (2.94.1) - Full-featured client
    - `@supabase/ssr` (0.8.0) - Server-side utilities for cookie handling and session refresh
  - Authentication: Anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) for public operations and service role key (`SUPABASE_SERVICE_ROLE_KEY`) for server-side admin operations
  - Row-level security (RLS) enabled on all tables, scoped by `org_id`

**Database Clients:**
- `createClient()` in `src/lib/supabase/client.ts` - Browser client using anonymous key
- `createClient()` in `src/lib/supabase/server.ts` - Server client using anonymous key with cookie-based session handling
- `createServiceClient()` in `src/lib/supabase/service.ts` - Server-only service role client that bypasses RLS

**File Storage:**
- Not explicitly integrated. Supabase storage can be used via `@supabase/supabase-js` if needed.

**Caching:**
- None configured. Application uses direct database queries without caching layer.

## Authentication & Identity

**Auth Provider:**
- **Supabase Auth**
  - Implementation: Email/password authentication via Supabase built-in auth
  - Session management: Cookie-based with automatic refresh in middleware
  - Routes:
    - `src/app/login/page.tsx` - Email/password login
    - `src/app/signup/page.tsx` - Email/password signup with email confirmation
    - `src/app/auth/callback/route.ts` - OAuth/confirmation code exchange
    - `src/app/forgot-password/page.tsx` - Password reset request
    - `src/app/reset-password/page.tsx` - New password entry
    - `src/app/logout/page.tsx` - Sign out (server component)
  - Email delivery: Supabase handles all transactional emails (confirmation, password reset)
  - Session refresh: Middleware in `src/lib/supabase/proxy.ts` calls `getClaims()` to refresh sessions

**Protected Routes:**
Middleware (`src/proxy.ts` → `src/lib/supabase/proxy.ts`) protects:
- `/dashboard` - Dashboard with stats grid and project list
- `/projects/*` - Project detail pages and subresources
- `/settings` - User/organization settings
- `/onboarding` - Initial organization creation
- `/companies` - Company management
- `/team` - Team member management

**Public Routes:**
- `/` - Landing page
- `/login` - Login page
- `/signup` - Sign up page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/client-portal/*` - Public portal for external clients (no auth required, uses service role for data access)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, or similar)

**Logs:**
- None configured. Development uses console logs; production relies on platform logs (Vercel, etc.)

**Performance Monitoring:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended in README.md, but not strictly required)
- Supports any Node.js 20+ server

**CI Pipeline:**
- None detected. No GitHub Actions, GitLab CI, or similar configured.

**Database Migrations:**
- Supabase migrations managed in `supabase/migrations/` directory
- Example migrations:
  - `supabase/migrations/20260207130004_create_lot_sales.sql`
  - `supabase/migrations/20260207130002_create_programmes.sql`
  - `supabase/migrations/20260207130006_create_client_portal_links.sql`
  - `supabase/migrations/20260206130003_create_extension_of_time.sql`

## Environment Configuration

**Required env vars:**

Public (safe to commit, used in browser):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., `https://figazmqfakzbqgpnktvs.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key (starts with `sb_publishable_`)

Private (must be kept secret, server-only):
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for admin operations (bypasses RLS)

**Secrets location:**
- `.env.local` file (not committed, exists locally and in deployment environment)
- Deployment platform env vars (e.g., Vercel environment variables)

## Webhooks & Callbacks

**Incoming:**
- `src/app/auth/callback/route.ts` - Supabase auth code exchange endpoint
  - Called by Supabase after email verification or OAuth flow
  - Exchanges auth code for session
  - Redirects to `/dashboard` or custom `next` parameter

**Outgoing:**
- None detected. Application does not send webhooks to external systems.

**Internal Flows:**
- Form submissions trigger Supabase mutations (inserts/updates) directly from client or server components
- No explicit webhook system for application events

## Database Schema Overview

**Core Multi-Tenant Structure:**
- `organisations` - Root entity per tenant
- `profiles` - Users with `org_id` and role (admin/user)
- `projects` - Org-scoped projects
- `companies` - Org-scoped companies

**Project Management:**
- `variations` - Change orders with workflow (draft → submitted → approved/rejected)
- `progress_claims` - Payment claims with line items
- `site_diary_entries` - Daily site records with related labor/equipment/visitor logs
- `extension_of_time` - EOT claims with workflow
- `consultants` - Professional service providers with phases and budgets
- `tenders` - Tender packages with submissions

**Scheduling & Documents:**
- `programme_tasks` - Hierarchical Gantt tasks with dependencies
- `programme_dependencies` - Task relationships
- `submittals` - Contractor document submissions with review workflow
- `submittal_comments` - Discussion threads

**Sales & Feasibility:**
- `lots` - Property units with pricing and status workflow
- `sales_agents` - Sales staff with commission tracking
- `sale_transactions` - Sale records per lot
- `feasibility_scenarios` - Development appraisal scenarios

**Client Access:**
- `client_portal_links` - Shareable token links for external clients (uses service role for data access)

**Enums:**
- `variation_status`, `claim_status`, `weather_condition`, `eot_status`, `consultant_status`, `phase_status`, `tender_status`, `submittal_status`, `lot_status`, `action_status`

**Helper Functions:**
- `get_user_org_id()` - Used in RLS policies for efficient org scoping
- Auto-numbering triggers: `variation_number`, `claim_number`, `eot_number`
- Auto-profile creation on `auth.users` insert
- `updated_at` triggers via `extensions.moddatetime()`

---

*Integration audit: 2026-02-07*
