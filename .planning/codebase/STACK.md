# Technology Stack

**Analysis Date:** 2026-02-07

## Languages

**Primary:**
- TypeScript 5 - Used throughout codebase for type-safe frontend and backend code
- JavaScript (JSX/TSX) - React components and Next.js pages

## Runtime

**Environment:**
- Node.js 20+ (inferred from Next.js 16 requirements)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router, Server Components, and edge middleware
- React 19.2.3 - UI library (React Server Components by default)
- React DOM 19.2.3 - DOM rendering

**UI/Styling:**
- Tailwind CSS 4 - Utility-first CSS framework via PostCSS
- CSS Variables - oklch color space for theming (orange primary: `oklch(0.65 0.19 45)`)
- Radix UI 1.4.3 - Unstyled, accessible component primitives
- shadcn/ui - Component library pattern (not directly in dependencies, added via CLI)
- class-variance-authority 0.7.1 - CSS class composition for component variants
- tailwind-merge 3.4.0 - Tailwind class merging utility
- clsx 2.1.1 - Conditional className builder

**Icons:**
- Lucide React 0.563.0 - Icon library

**Animation:**
- tw-animate-css 1.4.0 - Tailwind animation utilities

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.94.1 - Official Supabase client for database and auth
- @supabase/ssr 0.8.0 - Server-side rendering utilities for Supabase (cookies handling, session refresh)

**Build & Development:**
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind CSS v4
- eslint 9 - JavaScript linter
- eslint-config-next 16.1.6 - Next.js specific ESLint rules
- TypeScript 5 - Static type checker
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions

## Configuration

**Environment:**
- Environment variables stored in `.env.local` (not committed)
- Public variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Private variables: `SUPABASE_SERVICE_ROLE_KEY`

**Build:**
- TypeScript config: `tsconfig.json` (target: ES2017, strict mode enabled)
- Next.js config: `next.config.ts` (minimal configuration)
- PostCSS config: `postcss.config.mjs` (Tailwind CSS v4)
- ESLint config: `eslint.config.mjs` (flat config format, extends eslint-config-next)
- Component schema: `components.json` (shadcn/ui configuration)

**Scripts:**
```bash
npm run dev      # Start development server (Next.js Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Platform Requirements

**Development:**
- Node.js 20+
- npm or compatible package manager
- Supabase account with project initialized
- `.env.local` with Supabase credentials

**Production:**
- Deployment target: Vercel (recommended, but any Node.js 20+ server)
- Environment variables required at runtime
- Supabase project for database, auth, and storage

---

*Stack analysis: 2026-02-07*
