# Testing Patterns

**Analysis Date:** 2026-02-07

## Test Framework

**Status:** Not currently configured

**Analysis Finding:**
- No test runner installed (Jest, Vitest, or similar)
- No test configuration files present (no `jest.config.*` or `vitest.config.*`)
- No test files in codebase (no `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)
- No testing libraries in dependencies (`@testing-library/react`, etc.)

**Recommendations for Future Implementation:**

Use Vitest for unit/integration tests:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

Use Playwright or Cypress for E2E tests:
```bash
npm install -D playwright @playwright/test
# or
npm install -D cypress
```

## Current Testing Approach

**Manual Testing Only:**
- Development server run with `npm run dev` allows manual UI testing
- Components tested via browser interaction during development
- Database operations tested against real Supabase instance

**Type Safety as Testing:**
- TypeScript strict mode (`strict: true` in `tsconfig.json`) provides compile-time safety
- Supabase type generation (`database.types.ts`) ensures type-safe database operations
- Component prop types enforced at compile time

## Where Tests Should Go

**Recommended Structure:**
```
src/
├── components/
│   ├── __tests__/
│   │   └── project-card.test.tsx
│   ├── ui/
│   │   ├── __tests__/
│   │   │   └── button.test.tsx
│   │   └── button.tsx
│   └── project-card.tsx
├── lib/
│   ├── __tests__/
│   │   └── utils.test.ts
│   └── utils.ts
└── hooks/
    ├── __tests__/
    │   └── use-mobile.test.ts
    └── use-mobile.ts
```

**Alternative: Sibling Test Files**
```
src/
├── components/
│   ├── project-card.tsx
│   ├── project-card.test.tsx
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts
```

## Test File Naming

**Convention:**
- Test files: `[filename].test.ts` or `[filename].test.tsx`
- Located alongside source files in `__tests__` subdirectory or as siblings
- One test file per source component/utility

**Examples:**
- `src/components/project-card.tsx` → `src/components/__tests__/project-card.test.tsx`
- `src/lib/utils.ts` → `src/lib/__tests__/utils.test.ts`
- `src/hooks/use-mobile.ts` → `src/hooks/__tests__/use-mobile.test.ts`

## Suggested Test Structure

**Test Suite Organization (Vitest Pattern):**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectCard } from '@/components/project-card';

describe('ProjectCard', () => {
  let mockProject: Project;

  beforeEach(() => {
    mockProject = {
      id: 'test-1',
      code: 'PRJ-001',
      name: 'Test Project',
      stage: 'construction',
      status: 'active',
      budget: 500000,
      // ... other fields
    };
  });

  describe('rendering', () => {
    it('should render project information', () => {
      render(<ProjectCard project={mockProject} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('PRJ-001')).toBeInTheDocument();
    });

    it('should render stage badge', () => {
      render(<ProjectCard project={mockProject} />);
      expect(screen.getByText('Construction')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should navigate to project detail on click', () => {
      // Test click handling
    });
  });
});
```

## Mocking Patterns

**Framework for Mocking:** Vitest `vi` module (once installed)

**What to Mock:**
- External API calls (Supabase operations)
- Next.js router functions (`useRouter`, `usePathname`)
- Context providers
- Window/DOM APIs

**What NOT to Mock:**
- Component rendering logic (use real component)
- UI library components (Radix UI, shadcn/ui)
- Utility functions (use real implementations)
- Data transformations (test with real data)

**Example Mock Patterns:**

```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: mockData }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
}));

// Mock context
vi.mock('@/lib/context/organisation', () => ({
  useOrganisation: vi.fn(() => ({
    profile: mockProfile,
    organisation: mockOrganisation,
    projects: mockProjects,
    isAdmin: true,
  })),
}));
```

## Fixtures and Factories

**Current State:** None present in codebase

**Recommended Test Data Pattern:**

```typescript
// src/__tests__/fixtures/project.fixture.ts
import type { Tables } from '@/lib/supabase/database.types';

type Project = Tables<'projects'>;

export const mockProject: Project = {
  id: 'proj-1',
  org_id: 'org-1',
  code: 'PRJ-001',
  name: 'Test Construction Project',
  description: 'A test project',
  stage: 'construction',
  status: 'active',
  address: '123 Test Street',
  budget: 500000,
  client_company_id: 'comp-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  ...mockProject,
  ...overrides,
});
```

**Usage in Tests:**
```typescript
import { createMockProject } from '@/__tests__/fixtures/project.fixture';

const testProject = createMockProject({ name: 'Custom Project' });
```

## Coverage

**Current Requirements:** None enforced

**Recommended Target:** 70%+ coverage for critical paths
- UI components: 60%+
- Utility functions: 80%+
- Hooks: 75%+
- Context providers: 80%+

**View Coverage (when configured):**
```bash
npm run test -- --coverage
```

Expected output directory: `coverage/` with HTML report in `coverage/index.html`

## Test Types

**Unit Tests:**
- Scope: Test individual components, hooks, utilities in isolation
- Approach: Render component, assert output, verify mocked dependencies
- Examples:
  - `ProjectCard` component rendering project data
  - `formatCurrency()` utility formats numbers correctly
  - `useIsMobile()` hook detects screen size
- Tools: Vitest + React Testing Library

**Integration Tests:**
- Scope: Test multiple components or features working together
- Approach: Render feature pages, user interactions, data flow
- Examples:
  - Create project dialog: form submission → Supabase insert → redirect
  - Edit company: fetch existing data → form changes → save → verify update
  - Filter tenders: click status filters → API call → list updates
- Tools: Vitest + React Testing Library with mocked Supabase

**E2E Tests:**
- Scope: Test complete user workflows end-to-end
- Approach: Real browser, real backend (staging environment)
- Examples:
  - User login → create project → add variation → view dashboard updates
  - Admin user → manage companies → assign team members
  - Project workflow: create → execute → close
- Tools: Playwright or Cypress (not yet implemented)

## Common Patterns

**Async Testing Pattern (Vitest):**
```typescript
it('should load projects on mount', async () => {
  const mockProjects = [createMockProject()];
  vi.mocked(supabaseClient.from).mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: mockProjects }),
  });

  render(<ProjectsPage />);

  await waitFor(() => {
    expect(screen.getByText('Test Construction Project')).toBeInTheDocument();
  });
});
```

**Error Testing Pattern:**
```typescript
it('should display error message on failed submission', async () => {
  const mockError = new Error('Database error');
  vi.mocked(supabaseClient.from).mockReturnValue({
    insert: vi.fn().mockResolvedValue({ error: mockError }),
  });

  render(<CreateProjectDialog />);

  const submitButton = screen.getByRole('button', { name: /create/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText('Database error')).toBeInTheDocument();
  });
});
```

**User Interaction Pattern:**
```typescript
it('should submit form on button click', async () => {
  const handleSubmit = vi.fn();
  render(<CreateProjectDialog onSubmit={handleSubmit} />);

  const codeInput = screen.getByLabelText('Code');
  const nameInput = screen.getByLabelText('Name');
  const submitButton = screen.getByRole('button', { name: /create/i });

  fireEvent.change(codeInput, { target: { value: 'PRJ-002' } });
  fireEvent.change(nameInput, { target: { value: 'New Project' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'PRJ-002',
        name: 'New Project',
      })
    );
  });
});
```

## Implementation Priority

**Phase 1 (High Priority):**
1. Set up Vitest + React Testing Library
2. Test utility functions (`cn()`, `formatCurrency()`, etc.)
3. Test UI components (`Button`, `ProjectCard`, `Badge`)

**Phase 2 (Medium Priority):**
4. Test hooks (`useOrganisation()`, `useIsMobile()`)
5. Test context providers (`OrganisationProvider`)
6. Test simple dialog components

**Phase 3 (Lower Priority):**
7. Test complex pages with data fetching
8. Set up E2E tests with Playwright
9. Achieve 70% code coverage

---

*Testing analysis: 2026-02-07*
