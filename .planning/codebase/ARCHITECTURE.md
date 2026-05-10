# Architecture

**Analysis Date:** 2026-05-10

## Pattern Overview

**Overall:** Full-stack Next.js Application (App Router)

**Key Characteristics:**
- Server-side rendering and client-side interactivity
- Unified routing for admin and client interfaces
- Serverless database integration (Neon)
- Centralized state management (Zustand + TanStack Query)

## Layers

**UI Layer:**
- Purpose: Render pages and components
- Contains: React components, layouts, pages
- Location: `src/app`, `src/components`
- Depends on: State management hooks, UI primitives

**State Management Layer:**
- Purpose: Manage client-side state and server cache
- Contains: Zustand stores, TanStack Query hooks
- Location: Integrated within components and `src/lib`
- Used by: UI Layer

**API/Server Layer:**
- Purpose: Handle backend requests and database interaction
- Contains: Next.js API routes
- Location: `src/app/api`
- Depends on: Data access layer (`src/lib/db.ts`)

**Data Access Layer:**
- Purpose: Interface with Neon PostgreSQL
- Contains: SQL query execution, database schema logic
- Location: `src/lib/db.ts`
- Used by: API/Server Layer

## Data Flow

**Standard Page Request:**
1. User navigates to a route (e.g., `/admin`).
2. Next.js App Router renders the server component (`src/app/admin/page.tsx`).
3. Server component may fetch data directly or via API.
4. Client components mount and initialize state using Zustand/Query.
5. User interactions trigger state updates or API calls.

**State Management:**
- Zustand used for global client-side state (e.g., UI preferences).
- TanStack Query used for caching and synchronizing server data.

## Key Abstractions

**Database Client:**
- Purpose: Execute SQL queries against Neon
- Location: `src/lib/db.ts`
- Pattern: Singleton export of `sql` client

**UI Primitives:**
- Purpose: Reusable, accessible components based on Radix UI
- Location: `src/components/ui`
- Pattern: Component-based design system

## Entry Points

**Web Entry:**
- Location: `src/app/layout.tsx`
- Triggers: Browser request
- Responsibilities: Global layout, providers setup (QueryClient, Themes)

**API Entry:**
- Location: `src/app/api/**/route.ts`
- Triggers: HTTP request
- Responsibilities: Request parsing, DB interaction, JSON response

## Error Handling

**Strategy:** Bubbling errors to Next.js error boundaries or global API handlers

**Patterns:**
- Try/catch blocks in API routes
- Schema validation via Zod to catch invalid inputs early

## Cross-Cutting Concerns

**Validation:**
- Zod schemas used for form validation and API request bodies.

**Internationalization:**
- `next-intl` handles multi-language support.

---

*Architecture analysis: 2026-05-10*
*Update when major patterns change*
