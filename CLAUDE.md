# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` — Start development server (Next.js with Turbopack)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Architecture

This is a **Next.js 16 SaaS application** using the App Router with React 19, TypeScript, Tailwind CSS v4, and Supabase for backend services.

### Stack

- **Framework:** Next.js 16 (App Router, React Server Components by default)
- **Styling:** Tailwind CSS v4 via PostCSS, with oklch color variables for theming (light/dark mode)
- **UI Components:** shadcn/ui pattern — Radix UI primitives styled with Tailwind, CVA for variants
- **Icons:** Lucide React
- **Backend:** Supabase (@supabase/supabase-js + @supabase/ssr)
- **TypeScript:** Strict mode enabled

### Project Layout

- `src/app/` — Next.js App Router pages and layouts
- `src/app/auth/callback/` — Supabase auth code exchange route
- `src/app/login/` — Login page (client component)
- `src/app/signup/` — Signup page (client component)
- `src/app/forgot-password/` — Password reset request (client component)
- `src/app/reset-password/` — New password entry (client component)
- `src/app/logout/` — Sign out (server component, redirects to /)
- `src/components/ui/` — shadcn/ui components (button, card, input, label, dropdown-menu, sheet, dialog, avatar)
- `src/components/landing/` — Landing page sections (header, hero, features, pricing, footer, mobile-nav)
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/lib/supabase/proxy.ts` — Middleware session refresh (uses getClaims())
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `src/proxy.ts` — Root proxy (Next.js 16 convention, exports `proxy()` function)

### Key Patterns

- **Path alias:** `@/*` maps to `./src/*`
- **Component style:** shadcn/ui "new-york" style with `data-slot` attributes; add new components via `npx shadcn@latest add <name>`
- **Client components:** Only use `"use client"` where interactivity is needed; default to server components
- **Theming:** CSS custom properties in `globals.css` using oklch color space; supports light/dark via `.dark` class
- **Auth proxy:** Uses `getClaims()` not `getUser()` in middleware proxy for session refresh
- **Logout:** Server component pattern — NOT client component with useEffect

### Error Troubleshooting

- HTTP 431 / Turbopack panic: Clear cache with `rm -rf .next node_modules/.cache && npm run dev`
- Do NOT modify auth code to "fix" cache issues
