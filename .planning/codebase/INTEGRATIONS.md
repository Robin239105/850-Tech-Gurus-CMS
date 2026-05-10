# External Integrations

**Analysis Date:** 2026-05-10

## Data Storage

**Databases:**
- Neon Database - Serverless PostgreSQL
  - Connection: via `DATABASE_URL` or `POSTGRES_URL` env vars
  - Client: `@neondatabase/serverless` SQL client
  - Location: `src/lib/db.ts`

**File Storage:**
- Uploadthing - Full-stack file uploads
  - SDK/Client: `uploadthing` npm package
  - Integration: Likely configured for handling image/file assets

## Authentication & Identity

**Auth Implementation:**
- Custom Auth - Likely using JWT or session-based auth with `bcryptjs` for hashing
- 2FA/OTP: `otplib` included in dependencies, suggesting support for multi-factor authentication

## Internationalization

**i18n Provider:**
- next-intl - Framework for localized content
  - Used for handling multiple languages/locales in the Next.js app

## Monitoring & Observability

**Logs:**
- stdout/stderr (Standard Next.js logging)

## CI/CD & Deployment

**Hosting:**
- Likely Vercel (Standard for Next.js) or similar serverless platform

## Environment Configuration

**Development:**
- Required env vars: `DATABASE_URL`, `POSTGRES_URL`
- Template provided in `.env.local.example`

---

*Integration audit: 2026-05-10*
*Update when adding/removing external services*
