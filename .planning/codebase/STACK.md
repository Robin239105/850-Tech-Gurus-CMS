# Technology Stack

**Analysis Date:** 2026-05-10

## Languages

**Primary:**
- TypeScript 5.7 - All application code
- JavaScript - Configuration files (next.config.mjs, postcss.config.js)

## Runtime

**Environment:**
- Node.js (Version not specified, likely 18+ or 20+)
- Next.js 16.2.6 (App Router)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.6 - Web framework (Full-stack)
- React 19.0.0 - UI library

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS
- PostCSS - CSS transformation

**UI Components:**
- Radix UI - Accessible primitives (Accordion, Avatar, Dialog, etc.)
- Lucide React - Icon set

## Key Dependencies

**Critical:**
- @neondatabase/serverless 1.1.0 - Serverless PostgreSQL driver for Neon
- @tanstack/react-query 5.62.8 - Data fetching and state synchronization
- Zustand 5.0.3 - Lightweight state management
- Zod 3.24.1 - Schema validation
- React Hook Form 7.54.2 - Form management

**Infrastructure:**
- Uploadthing 7.4.1 - File upload service
- next-intl 4.11.1 - Internationalization
- bcryptjs 3.0.3 - Password hashing
- otplib 13.4.0 - 2FA/OTP support

## Configuration

**Environment:**
- Environment variables via `.env` (example in `.env.local.example`)
- Key configs: `DATABASE_URL`, `POSTGRES_URL` required for DB access

**Build:**
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration

## Platform Requirements

**Development:**
- macOS/Linux/Windows with Node.js installed

**Production:**
- Optimized for serverless deployment (likely Vercel or similar)
- Neon Database (Postgres)

---

*Stack analysis: 2026-05-10*
*Update after major dependency changes*
