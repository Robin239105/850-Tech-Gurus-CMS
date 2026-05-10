# Coding Conventions

**Analysis Date:** 2026-05-10

## Naming Patterns

**Files:**
- kebab-case for modules and directories (e.g., `client-auth.ts`, `mock-data.ts`)
- PascalCase for React components (if applicable, though many use kebab-case for directories containing them)

**Functions:**
- camelCase for all functions (e.g., `formatDate`, `generateId`)
- Named exports preferred for utility functions

**Variables:**
- camelCase for variables
- UPPER_SNAKE_CASE for constants

**Types:**
- PascalCase for interfaces and type aliases
- `import type` used for type-only imports

## Code Style

**Formatting:**
- 2 space indentation
- Omitted semicolons
- Single quotes for strings
- Trailing commas in objects and arrays

**Path Aliases:**
- `@/` maps to `src/` (e.g., `@/components/ui/toaster`)

## Error Handling

**Patterns:**
- Throwing errors in utility functions when invariants are violated (e.g., `if (!url) throw new Error(...)`)
- Simple `try/catch` in async operations

## Module Design

**Exports:**
- Named exports for libraries and utilities
- Default exports for Next.js pages and layouts

---

*Convention analysis: 2026-05-10*
*Update when patterns change*
