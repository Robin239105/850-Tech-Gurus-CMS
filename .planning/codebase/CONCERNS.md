# Codebase Concerns

**Analysis Date:** 2026-05-10

## Tech Debt

**Hardcoded Mock Data:**
- Issue: Large `src/lib/mock-data.ts` (323 lines) containing static data used for the dashboard.
- Why: Initial development/prototyping phase.
- Impact: Dashboard does not reflect real database state; harder to test real data flows.
- Fix approach: Replace mock data imports with TanStack Query hooks fetching from API routes.

**Next.js Version Ambiguity:**
- Issue: `package.json` specifies `next: ^16.2.6`, which is beyond current stable releases.
- Why: Possible use of canary version or typo.
- Impact: Potential stability issues or incompatibility with common community packages.
- Fix approach: Verify intended version and downgrade to stable Next.js 15 if Next.js 16 was a typo.

## Known Bugs

**No active bugs detected during initial scan.**

## Security Considerations

**Permissive CORS Middleware:**
- Risk: `src/middleware.ts` sets `Access-Control-Allow-Origin: '*'` for `/api/public/` routes.
- Current mitigation: Only affects public routes.
- Recommendations: Restrict allowed origins to specific domains in production.

**Custom Auth Implementation:**
- Risk: Using `bcryptjs` and `otplib` suggests custom auth logic, which is more prone to implementation errors than established providers (like NextAuth or Clerk).
- Current mitigation: Password hashing and 2FA support present.
- Recommendations: Perform a thorough audit of the login/session flow in `src/lib/client-auth.ts`.

## Performance Bottlenecks

**Direct SQL queries in API routes (Potential):**
- Problem: If queries are not optimized or use N+1 patterns.
- Cause: Using raw SQL via `@neondatabase/serverless` without an ORM layer for complex relations.
- Improvement path: Ensure all queries are indexed and consider a lightweight ORM if relations become complex.

## Fragile Areas

**Database Connection Error Handling:**
- File: `src/lib/db.ts`
- Why fragile: Throws an error immediately if `DATABASE_URL` is missing, which could crash the build or startup if env vars aren't perfectly synced.
- Safe modification: Add more descriptive error messages and ensure build-time safety.

## Test Coverage Gaps

**Entire Codebase:**
- What's not tested: No automated tests found.
- Risk: Regressions are easy to introduce; manual verification is slow and error-prone.
- Priority: High
- Difficulty to test: Low for library functions, Medium for Next.js routes.

---

*Concerns audit: 2026-05-10*
*Update as issues are fixed or new ones discovered*
