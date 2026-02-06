# Codebase Concerns

**Analysis Date:** 2026-02-07

## Tech Debt

**Unhandled Delete Operations:**
- Issue: Multiple delete operations throughout the codebase execute without try-catch error handling or user feedback
- Files:
  - `src/app/(app)/projects/[id]/site-diary/[entryId]/diary-entry-detail.tsx` (lines 258, 263, 268)
  - `src/app/(app)/projects/[id]/programmes/programmes-view.tsx` (line 106)
  - `src/components/project-members-list.tsx` (line 69)
- Impact: Silent failures on delete operations leave the UI out of sync with database state. Users won't know if deletion succeeded or failed.
- Fix approach: Wrap all delete operations in try-catch blocks with toast notifications (success/error). Consider adding confirmation dialogs for destructive operations.

**Unsafe Numeric Parsing:**
- Issue: Multiple locations parse user input with `parseInt()` and `parseFloat()` without validation, relying on fallback values like `|| 0` or `|| 1`
- Files:
  - `src/app/(app)/projects/[id]/site-diary/[entryId]/diary-entry-detail.tsx` (lines 178-179, 206-208)
  - `src/app/(app)/projects/[id]/consultants/[consultantId]/consultant-detail.tsx` (lines 166, 209)
  - `src/app/(app)/projects/[id]/tenders/[tenderId]/tender-detail.tsx` (line 165)
  - `src/app/(app)/projects/[id]/eot/[eotId]/eot-detail.tsx` (lines 123, 128)
  - `src/components/create-diary-entry-dialog.tsx` (lines 97, 100)
  - `src/app/(app)/projects/[id]/feasibility/feasibility-view.tsx` (lines 119-121, 192-196)
  - `src/app/(app)/projects/[id]/programmes/task-list-panel.tsx` (line 61)
- Impact: Invalid input silently converts to `NaN`, then coerces to `0`, potentially storing wrong values in financial/quantity fields. No user feedback on validation failure.
- Fix approach: Add explicit input validation before parsing. Create a utility function `parseAmount()` that validates ranges and returns errors. Use HTML5 input type="number" attributes to constrain input client-side.

**Promise Chains Without Error Handling:**
- Issue: Promise chain in setup/initialization code uses `.then()` without `.catch()` handlers
- Files:
  - `src/components/create-project-dialog.tsx` (lines 60-66)
  - `src/components/add-project-member-dialog.tsx` (line 64)
  - `src/components/edit-project-dialog.tsx` (line 78)
  - `src/components/share-portal-dialog.tsx` (line 62)
- Impact: Network failures or data loading errors in dialogs fail silently, leaving UI in inconsistent state
- Fix approach: Add `.catch()` to all promise chains. Consider using async/await pattern instead for clarity. Set error state to display user-facing messages.

**Missing Input Validation:**
- Issue: Form inputs throughout the codebase lack validation (length checks, required fields, format validation)
- Files:
  - `src/app/(app)/projects/[id]/site-diary/[entryId]/diary-entry-detail.tsx` - visitor name, company, purpose fields have no required validation
  - `src/app/(app)/projects/[id]/consultants/[consultantId]/consultant-detail.tsx` - discipline, phase name fields have no length constraints
  - `src/components/create-project-dialog.tsx` - project code, name fields have no format/length validation
- Impact: Invalid data can be submitted to database, causing downstream issues in reports and calculations
- Fix approach: Implement form validation layer (consider Zod or similar schema validation). Add client-side error messages. Show validation errors inline in UI.

## Known Bugs

**Currency Rounding Edge Case:**
- Symptoms: Financial calculations using `Math.round(parseFloat(value) * 100)` may produce incorrect values due to floating-point arithmetic precision issues
- Files:
  - `src/app/(app)/projects/[id]/consultants/[consultantId]/consultant-detail.tsx` (line 166)
  - `src/app/(app)/projects/[id]/tenders/[tenderId]/tender-detail.tsx` (line 165)
  - `src/app/(app)/projects/[id]/feasibility/feasibility-view.tsx` (line 60)
- Trigger: Enter values like 0.01, 0.02, or other decimal amounts that cannot be represented exactly in binary floating-point
- Example: `Math.round(0.1 * 100)` may not equal 10 due to floating-point precision
- Workaround: Currently none; values are stored as cents (integers) after conversion, but initial parsing is imprecise
- Fix approach: Use decimal arithmetic library (e.g., `decimal.js`) or parse input as string and convert directly to cents without floating-point intermediate

**Dialog State Not Reset on Errors:**
- Symptoms: If API call fails in form dialogs, the dialog remains open with form data intact, but no error message is shown to user
- Files: All detail/view components with form dialogs (diary-entry-detail, consultant-detail, tender-detail, etc.)
- Trigger: Network failure or database constraint violation when submitting forms
- Workaround: Manually close dialog and reopen to retry
- Fix approach: Add error state to form dialogs, display error toast, keep dialog open so user can retry

## Security Considerations

**RLS Bypass Risk via Service Role:**
- Risk: Client portal uses service role client to bypass RLS (`src/lib/supabase/service.ts` pattern), which could leak data if routes are not properly protected
- Files: `src/app/(client-portal)/client-portal/[token]/client-portal-view.tsx` and related routes
- Current mitigation: Token-based access control via `client_portal_links` table; routes check token validity
- Recommendations:
  - Audit all service role queries to ensure they filter by the specific token/link
  - Add rate limiting on token validation endpoints
  - Consider expiring tokens after first use or adding request logging for audit trails
  - Verify RLS policies block direct table access even with anon key

**Missing Input Sanitization:**
- Risk: User-provided text fields (notes, descriptions, visitor names) are inserted directly into database without sanitization
- Files: Multiple locations including diary-entry-detail, consultants, projects
- Current mitigation: Database is the system of record; XSS prevented at display layer by React's JSX escaping
- Recommendations:
  - Add explicit sanitization before database insert (strip HTML/scripts)
  - Use Content Security Policy headers to prevent XSS
  - Consider field length limits in database schema if not present

**Unauthenticated Server Component Assumptions:**
- Risk: Some server components assume authentication without explicit verification
- Files: Root layout (`src/app/(app)/layout.tsx`) assumes user is authenticated but error handling if `getClaims()` fails is unclear
- Current mitigation: Proxy middleware routes unauthenticated users to login
- Recommendations: Add explicit assertions in server components that fetch user data, fail fast if auth context missing

## Performance Bottlenecks

**Large Component Size (Over 900 Lines):**
- Problem: Multiple components exceed 900 lines of code, making them slow to parse and hard to test/maintain
- Files:
  - `src/app/(app)/projects/[id]/site-diary/[entryId]/diary-entry-detail.tsx` (962 lines)
  - `src/app/(app)/projects/[id]/consultants/[consultantId]/consultant-detail.tsx` (951 lines)
  - `src/app/(app)/projects/[id]/tenders/[tenderId]/tender-detail.tsx` (908 lines)
- Cause: Multiple sections (view, edit dialogs, calculations) bundled into single component
- Improvement path: Split into sub-components (e.g., DetailHeader, DetailForm, DetailTables) to improve code organization and enable better React performance optimization

**Frequent `router.refresh()` Calls:**
- Problem: 143 instances of `router.refresh()` throughout the codebase trigger full page revalidation after mutations
- Files: Nearly every detail and list component calls this after add/update/delete operations
- Cause: Relying on server-side revalidation instead of client-side state management or mutation revalidation
- Improvement path:
  - Consider implementing optimistic UI updates (update local state immediately before API call)
  - Use SWR or React Query for automatic cache invalidation
  - Implement server actions with automatic revalidation scoping (revalidatePath specific routes, not full page)

**No Pagination or Lazy Loading:**
- Problem: Tables and lists load all data upfront via `select("*")` without limit/offset
- Files: Nearly all view components (programmes-view, submittals-view, claims-view, etc.)
- Cause: Not evident from visible code samples, but data returned is unbounded
- Improvement path:
  - Implement limit/offset pagination with "Load More" or cursor-based pagination
  - Add virtual scrolling for large lists (react-window or similar)
  - Show loading states during data fetch

## Fragile Areas

**Site Diary Detail Component:**
- Files: `src/app/(app)/projects/[id]/site-diary/[entryId]/diary-entry-detail.tsx`
- Why fragile:
  - 962 lines with multiple nested state variables (laborForm, equipmentForm, visitorForm, etc.)
  - Four separate unhandled delete functions at lines 257-270
  - Multiple numeric parsing operations without validation (worker_count, hours_worked, quantity, hours_used)
  - Calculations for totalWorkers and totalManHours done in component body
- Safe modification:
  - Break into sub-components first (LaborSection, EquipmentSection, VisitorsSection)
  - Extract calculations into custom hooks
  - Add error boundaries around form dialogs
- Test coverage: No visible test files for this component

**Consultant Detail Component:**
- Files: `src/app/(app)/projects/[id]/consultants/[consultantId]/consultant-detail.tsx`
- Why fragile:
  - 951 lines with state for three different dialogs (add phase, edit paid, edit disbursements)
  - Financial calculations at lines 140-142 depend on phase data structure not changing
  - Status workflow validation hard-coded in statusColors/statusLabels objects
  - Currency conversion at line 209 using unsafe parseFloat
- Safe modification:
  - Extract phase management into separate component/module
  - Move status workflow definitions to constants file
  - Create utility function for currency parsing that's testable
- Test coverage: None visible

**Large Database Types File:**
- Files: `src/lib/supabase/database.types.ts` (2,633 lines)
- Why fragile:
  - Auto-generated from Supabase schema; manual edits will be overwritten
  - If schema changes, types must be regenerated (no automation visible)
  - Heavy reliance on these types throughout codebase makes schema changes risky
- Safe modification:
  - Only edit via Supabase schema changes, then regenerate with `supabase gen types`
  - Document the regeneration process
  - Consider adding pre-commit hook to auto-regenerate on schema changes
- Test coverage: Type checking via TypeScript, no runtime tests

## Scaling Limits

**In-Memory Organization Context:**
- Current capacity: Context stores single org with projects list loaded into React state
- Limit: If organization has thousands of projects, state management becomes slow; no pagination on projects selector
- Scaling path:
  - Move projects list to server state or implement infinite scroll
  - Implement search/filter for project selection in dialogs
  - Cache organization data with SWR or React Query

**No Database Query Optimization:**
- Current capacity: All queries use basic `select("*")` without column selection
- Limit: Fetching entire rows (including large JSONB fields, long text) for large datasets
- Scaling path:
  - Audit all queries to select only needed columns
  - Add database indexes on frequently filtered columns (org_id, project_id, status)
  - Implement query caching at API layer

**Service Role Client Unbounded Access:**
- Current capacity: Service role has no RLS restrictions; if query logic is wrong, could expose all data
- Limit: Single compromised query or auth bypass could leak entire database
- Scaling path:
  - Implement per-tenant row-level filtering in service role queries
  - Add query audit logging for compliance
  - Use separate limited service role for client portal

## Dependencies at Risk

**Supabase SSR Middleware Pattern:**
- Risk: Project relies on Supabase SSR session refresh pattern (`src/lib/supabase/proxy.ts`). If `getClaims()` behavior changes in future version, authentication could break
- Impact: Users could be logged out unexpectedly; routes could become inaccessible
- Current mitigation: Using documented `@supabase/ssr` pattern
- Migration plan: Maintain lockfile pins for @supabase/ssr and monitor release notes; test after minor version upgrades

**Next.js App Router Evolution:**
- Risk: Project uses Next.js 16 App Router with cutting-edge features (React Server Components by default, `router.refresh()`, Turbopack)
- Impact: Breaking changes in Next.js major versions could require significant refactoring
- Current mitigation: pinned to version "16.1.6"
- Migration plan: Monitor Next.js release notes; set aside time for major version upgrades every 12-18 months

**Tailwind CSS v4 PostCSS:**
- Risk: Using new Tailwind v4 with PostCSS plugin. PostCSS ecosystem is fragmented; upgrade paths not always smooth
- Impact: Build failures if PostCSS dependencies become incompatible
- Current mitigation: Lockfile pins transitive PostCSS deps
- Migration plan: Test build after npm updates; keep clear documentation of working versions

## Missing Critical Features

**No Error Logging / Monitoring:**
- Problem: All errors logged to `console.error()` with no centralized error tracking
- Files: 40+ `console.error()` calls scattered throughout codebase
- Blocks: Cannot diagnose production issues; no alerting on critical errors
- Recommendation: Integrate Sentry or similar error tracking service. Replace console.error with proper error reporter.

**No Form Validation Library:**
- Problem: Forms rely on manual setState and no schema validation
- Blocks: Cannot scale to more complex forms; no consistent error messages
- Recommendation: Add Zod or React Hook Form with schema validation

**No API Error Response Standardization:**
- Problem: Supabase errors vary in shape; components handle errors with string messages
- Blocks: Cannot build consistent error UI; hard to implement retry logic
- Recommendation: Create error handler utility that normalizes Supabase errors to standard format

**No Request Debouncing / Throttling:**
- Problem: Inline edit operations (e.g., in consultant phases) send immediate API call on every keystroke
- Blocks: High database load on rapid user input; network congestion
- Recommendation: Add debounce/throttle utilities for inline edits

## Test Coverage Gaps

**Zero Application Tests:**
- What's not tested: All React components, all async operations, all form submissions, all database interactions
- Files: Entire `src/app`, `src/components` directories
- Risk: Refactoring is dangerous; regressions not caught before production
- Priority: **High** - Add unit tests for utility functions first, then integration tests for critical user flows (login, create project, site diary entry)

**Database Trigger Logic Untested:**
- What's not tested: Auto-numbering triggers (variation_number, claim_number, eot_number), updated_at triggers, profile auto-creation on auth signup
- Files: Database schema in Supabase (not in repo)
- Risk: Trigger behavior could break without detection; data integrity issues not caught
- Priority: **High** - Add migration tests that verify trigger behavior

**Server Action / Middleware Logic Untested:**
- What's not tested: Auth proxy behavior, session refresh logic, RLS policy effectiveness
- Files: `src/lib/supabase/proxy.ts`, auth middleware (not visible in provided code)
- Risk: Authentication bypasses or session issues could go undetected
- Priority: **High** - Add e2e tests for auth flows and protected routes

**Edge Case Numeric Handling Untested:**
- What's not tested: Currency rounding, floating-point precision, zero-value handling in calculations
- Risk: Financial records could be incorrect due to rounding errors
- Priority: **Medium** - Add snapshot tests for currency conversion and calculation functions

---

*Concerns audit: 2026-02-07*
