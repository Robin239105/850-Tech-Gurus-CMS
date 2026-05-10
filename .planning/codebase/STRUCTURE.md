# Codebase Structure

**Analysis Date:** 2026-05-10

## Directory Layout

```
[project-root]/
├── public/             # Static assets
├── src/
│   ├── app/           # Next.js App Router routes
│   │   ├── admin/     # Admin dashboard routes
│   │   ├── api/       # API endpoints
│   │   └── client/    # Client-facing routes
│   ├── components/    # React components
│   │   ├── admin/     # Admin-specific components
│   │   ├── client/    # Client-specific components
│   │   ├── shared/    # Shared business components
│   │   └── ui/        # Base UI primitives (Radix/Shadcn)
│   ├── lib/           # Logic, utils, and integrations
│   └── styles/        # Global CSS and themes
├── package.json        # Project manifest
└── tsconfig.json       # TypeScript config
```

## Directory Purposes

**src/app/**
- Purpose: Application routing and page structure
- Contains: `layout.tsx`, `page.tsx`, and route directories
- Subdirectories: `admin`, `api`, `client`

**src/components/**
- Purpose: Reusable UI logic
- Contains: React components (*.tsx) and styles (*.css)
- Subdirectories: `admin`, `client`, `shared`, `ui`

**src/lib/**
- Purpose: Shared logic and integrations
- Contains: `db.ts` (Neon), `utils.ts`, `types.ts`, `mock-data.ts`
- Key files: `db.ts` - primary database client

**src/styles/**
- Purpose: Global styling
- Contains: Tailwind CSS entry and global themes

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root application layout
- `src/app/page.tsx`: Landing page

**Configuration:**
- `next.config.mjs`: Next.js settings
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `.env.local.example`: Environment variable template

**Core Logic:**
- `src/lib/db.ts`: Database connection and queries
- `src/middleware.ts`: CORS and request middleware

## Naming Conventions

**Files:**
- kebab-case.tsx/ts: Most files
- PascalCase.tsx: React components (typically in subfolders)

**Directories:**
- kebab-case: All directories

## Where to Add New Code

**New Feature:**
- UI components: `src/components/admin` or `src/components/client`
- Routes: `src/app/admin` or `src/app/client`

**New API Endpoint:**
- `src/app/api/[feature]/route.ts`

**Utilities:**
- `src/lib/utils.ts` or new file in `src/lib/`

---

*Structure analysis: 2026-05-10*
*Update when directory structure changes*
