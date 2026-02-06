# Coding Conventions

**Analysis Date:** 2026-02-07

## Naming Patterns

**Files:**
- Components: kebab-case (e.g., `create-project-dialog.tsx`, `app-sidebar.tsx`, `project-card.tsx`)
- Pages and layouts: kebab-case (e.g., `dashboard/page.tsx`, `settings/page.tsx`)
- Utility files: kebab-case with descriptive names (e.g., `use-mobile.ts`, `organisation.tsx`)
- UI components: kebab-case (e.g., `button.tsx`, `dropdown-menu.tsx`, `sidebar.tsx`)

**Functions:**
- Use camelCase for all function names
- Hook functions prefixed with `use` (e.g., `useOrganisation()`, `useIsMobile()`)
- Exported components use PascalCase (e.g., `CreateProjectDialog`, `AppSidebar`, `ProjectCard`)
- Helper/utility functions use camelCase (e.g., `formatCurrency()`, `formatStage()`, `formatStatus()`)
- Event handlers prefixed with `handle` (e.g., `handleSubmit()`, `handleChange()`)

**Variables:**
- Use camelCase for all variables and constants
- All-caps for true constants (e.g., `MOBILE_BREAKPOINT = 768`)
- Private/internal state variables follow camelCase pattern
- Database field names use snake_case (e.g., `client_company_id`, `org_id`, `project_id`)
- Type-safe Supabase types imported as: `type Project = Tables<"projects">`

**Types:**
- Use PascalCase for TypeScript types and interfaces (e.g., `OrganisationContextValue`, `OrganisationProviderProps`, `ProjectCardProps`)
- Interface names describe what data they represent
- Props interfaces suffixed with `Props` (e.g., `ProjectCardProps`, `TendersPageProps`)
- Database types imported and aliased: `type Company = Tables<"companies">`
- Generic type parameters follow single-letter or descriptive CamelCase (e.g., `T`, `Record<string, string>`)

## Code Style

**Formatting:**
- Prettier is not explicitly configured but ESLint uses Next.js formatting rules
- Indentation: 2 spaces (inferred from codebase structure)
- Line length: No strict limit observed, but prefer readability
- Quote style: Double quotes for strings and JSX attributes
- Semicolons: Used consistently throughout

**Linting:**
- ESLint with Next.js configuration: `eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- TypeScript strict mode enabled in `tsconfig.json`
- Compiler options:
  - `strict: true` - Full type safety
  - `noEmit: true` - Type checking only
  - `isolatedModules: true` - Each file compiles independently
  - `skipLibCheck: true` - Skip checking declaration files

## Import Organization

**Order:**
1. External React and Next.js imports (`react`, `next/*`, `lucide-react`)
2. External library imports (Supabase, utility packages)
3. Internal type imports (`import type { ... }`)
4. Internal absolute imports using `@/` path alias
5. Relative imports (rarely used, prefer `@/`)

**Examples:**
```typescript
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
import type { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
```

**Path Aliases:**
- `@/*` maps to `./src/*` - Used consistently for all internal imports
- Never use relative imports (e.g., `../../../`) - always use `@/`
- Absolute imports improve refactoring and readability

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (e.g., database mutations, API calls)
- Distinguish between expected errors and unexpected errors
- Specific error handling: Check for known error codes (e.g., `insertError.code === "23505"` for unique constraint violations)
- User-facing error messages stored in state: `error: string | null`
- Display errors in UI with conditional rendering: `{error && <p className="text-destructive">{error}</p>}`
- Log errors to console for debugging: `console.error("Failed to [operation]:", err)`
- Provide fallback values: `data ?? []` or `data || "default"`

**Common Error Handling Pattern:**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  const { error: insertError } = await supabase.from("table").insert(data);
  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("Duplicate entry message");
    }
    throw insertError;
  }
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to perform action");
} finally {
  setLoading(false);
}
```

## Logging

**Framework:** Console methods (console.error, console.log)

**Patterns:**
- Use `console.error()` for catching exceptions in try-catch blocks
- Error messages follow pattern: `"Failed to [action]:", err`
- Only log when operations fail, not on success
- Include operation context in error message for debugging

**Examples:**
```typescript
console.error("Failed to update status:", err);
console.error("Failed to add submission:", err);
console.error("Failed to send message:", err);
```

## Comments

**When to Comment:**
- Comment complex business logic or non-obvious algorithm decisions
- Explain "why", not "what" - the code should be self-explanatory for "what"
- Mark multi-step operations with clear section comments
- Document data transformation logic (e.g., budget cents conversion)

**JSDoc/TSDoc:**
- Not used in current codebase
- Focus on readable function names and type signatures instead
- Consider adding JSDoc for public API functions in future

**Comment Style:**
- Use `// ` for single-line comments (space after `//`)
- Comments appear above code they describe
- Common patterns:
  - `// Fetch [resource]` - for data retrieval
  - `// Calculate [what]` - for computations
  - `// Clear [previous state]` - for state resets
  - `// [Action] [resource]` - for operations

**Examples:**
```typescript
// Fetch project
const { data: project } = await supabase...

// Calculate stats
const totalProjects = projects.length;

// Clear any previous award
await supabase.from("tender_submissions").update({ is_awarded: false })...

// Set the new award
await supabase.from("tender_submissions").update({ is_awarded: true })...
```

## Function Design

**Size:**
- Keep functions under 150 lines when possible
- Dialogs/forms can be larger if all logic is form-related
- Extract complex nested logic into helper functions

**Parameters:**
- Destructure object parameters for clarity
- Use typed props interfaces (e.g., `ProjectCardProps`)
- Prefer explicit props over `...props` spreading when type safety matters

**Return Values:**
- Functions return actual data or void, rarely null
- Use nullish coalescing `??` or optional chaining `?.` for potentially undefined values
- Component render functions return JSX or conditional JSX (not null checks at return)

**Example Pattern:**
```typescript
interface CreateProjectDialogProps {
  // Props defined here
}

export function CreateProjectDialog() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    // Implementation
  };

  if (!isAdmin) {
    return null;
  }

  return <Dialog>{/* JSX */}</Dialog>;
}
```

## Module Design

**Exports:**
- Named exports for components, hooks, utilities, types
- Default exports only for page/layout components (Next.js App Router requirement)
- Barrel files not explicitly used; import directly from component files

**Example:**
```typescript
// Components
export function AppSidebar() { /* ... */ }
export function ProjectCard({ project }: ProjectCardProps) { /* ... */ }

// Hooks
export function useOrganisation() { /* ... */ }

// Utilities
export function cn(...inputs: ClassValue[]) { /* ... */ }

// Types (in separate .d.ts or imported with `import type`)
export type Project = Tables<"projects">;
```

**Barrel Files:**
- Not extensively used in this codebase
- Prefer direct imports from source files
- UI components can be organized by subdirectory (e.g., `components/ui/`)

## React-Specific Patterns

**Client Components:**
- Mark with `"use client"` only when interactivity is required
- Server components are default in Next.js App Router
- Keep server components for data fetching and layout

**Component Structure:**
- Functional components with hooks
- Props passed via TypeScript interfaces
- State managed with `useState` for local UI state
- Context used for shared organizational data (`OrganisationProvider`)

**Type Annotations:**
```typescript
// Inline Props
function MyComponent({ prop1, prop2 }: { prop1: string; prop2: number }) {}

// Props Interface (preferred for complex components)
interface MyComponentProps {
  prop1: string;
  prop2: number;
}
function MyComponent({ prop1, prop2 }: MyComponentProps) {}

// Exported Component Type
export function Button({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {}
```

---

*Convention analysis: 2026-02-07*
