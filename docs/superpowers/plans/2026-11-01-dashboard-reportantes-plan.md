# Dashboard de Reportantes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el dashboard existente en un espacio operativo claro para reportantes, con ownership, estados y mensajes consistentes.

**Architecture:** Mantener `/dashboard` como entrada y usar server/client guards existentes. Extraer consultas y tipos compartidos de `dashboard/reports/page.tsx` solo donde reduzca duplicación; las mutaciones seguirán pasando por Supabase con RLS y validación server-side cuando exista una ruta API.

**Tech Stack:** Next.js App Router, React, Supabase JS/SSR, date-fns, Tailwind, Radix UI.

**Spec:** `docs/superpowers/specs/2026-11-01-rediseño-admin-produccion-design.md`

## Global Constraints

- Un reportante solo puede leer y mutar recursos propios.
- Los estados deben usar el mapa canónico: `lost`, `found`, `in_contact`, `paused`, `reunited`, `closed`.
- Todas las listas deben tener loading, empty, error y retry.
- No usar métricas estimadas como si fueran vistas reales; etiquetar claramente cualquier estimación o eliminarla.
- Validar móvil y escritorio.

---

### Task 1: Definir tipos y consultas del dashboard

**Files:**
- Create: `src/lib/dashboard/types.ts`
- Create: `src/lib/dashboard/queries.ts`
- Modify: `src/app/dashboard/reports/page.tsx`
- Test: focused TypeScript and query tests

**Interfaces:**
- Produces `ReportStatus`, `ReporterPet`, `ReporterStats`, `getReporterDashboard(supabase, userId)` and `getReporterReports(supabase, userId, filters)`.

- [ ] **Step 1: Define exact report and sighting types.**

  Replace page-level `any[]` with fields selected from `pets` and `sightings`; make nullable database fields explicit.

- [ ] **Step 2: Extract ownership-scoped query helpers.**

  Each query must include `.eq('owner_id', userId)` and select only fields required by the dashboard.

- [ ] **Step 3: Add tests for ownership filter and status normalization.**

  Assert generated query inputs include the owner ID and unknown statuses map to `closed`/neutral presentation rather than crashing.

- [ ] **Step 4: Update the page to consume typed helpers.**

  Remove duplicated data selection and preserve current filters and actions.

- [ ] **Step 5: Validate and commit.**

  Run: `npx tsc --noEmit`; `npx eslint src/lib/dashboard src/app/dashboard/reports/page.tsx --quiet`

  Commit: `git add src/lib/dashboard src/app/dashboard/reports/page.tsx && git commit -m "refactor: type reporter dashboard data"`

### Task 2: Build reporter dashboard summary

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/reporter-summary.tsx`
- Create: `src/components/dashboard/stat-card.tsx`
- Test: browser authenticated dashboard

**Interfaces:**
- Consumes: `getReporterDashboard`.
- Produces: summary cards for active cases, resolved cases, pending messages and recent activity.

- [ ] **Step 1: Replace unconditional redirect with a real summary page.**

  Load the current session, render an auth-safe loading state, and redirect unauthenticated users to login with a safe internal `next`.

- [ ] **Step 2: Add responsive summary cards.**

  Use real counts from Supabase; do not present estimated views as factual counts. If view tracking is absent, label the metric as unavailable or omit it.

- [ ] **Step 3: Add quick actions.**

  Link to reportar, mis reportes, mensajes and profile settings with clear labels and mobile-safe hit targets.

- [ ] **Step 4: Verify ownership and states.**

  Test a user with no reports, one active report, one resolved report and a session-expiry state.

- [ ] **Step 5: Commit.**

  Commit: `git add src/app/dashboard/page.tsx src/components/dashboard && git commit -m "feat: add reporter dashboard summary"`

### Task 3: Organize reports, messages and profile actions

**Files:**
- Modify: `src/app/dashboard/reports/page.tsx`
- Modify: `src/app/dashboard/messages/page.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Create: `src/components/dashboard/report-list.tsx`
- Test: browser and TypeScript

**Interfaces:**
- Consumes: typed dashboard data and `StatusBadge`.
- Produces: report list with filters, message state, profile settings and safe action feedback.

- [ ] **Step 1: Extract the report list from the oversized page.**

  Keep filter state and mutation callbacks in the page; move rendering and row/card states into `ReportList`.

- [ ] **Step 2: Replace optimistic destructive actions with confirmed mutations.**

  Require confirmation, update local state only after Supabase success, and show a generic error toast on failure.

- [ ] **Step 3: Add report lifecycle actions.**

  Allow owner-only transitions `lost → in_contact → reunited` and `lost/found → paused/closed` according to the existing schema; reject unsupported transitions in UI and server code.

- [ ] **Step 4: Make messages and settings consistent.**

  Show unread/empty/error states, validate profile fields, and avoid displaying other users' private data.

- [ ] **Step 5: Validate and commit.**

  Run: `npx eslint src/app/dashboard src/components/dashboard --quiet`; `npx tsc --noEmit`

  Commit: `git add src/app/dashboard src/components/dashboard && git commit -m "feat: organize reporter dashboard workflows"`

### Task 4: Run dashboard acceptance review

**Files:**
- Modify: `docs/superpowers/specs/2026-11-01-rediseño-admin-produccion-design.md` only if a verified decision changes
- Test: browser at 375, 768, 1024 and 1440

- [ ] **Step 1: Test auth redirects and direct URL access.**
- [ ] **Step 2: Test no-report, active-report, resolved-report and error states.**
- [ ] **Step 3: Test keyboard navigation and focus visibility.**
- [ ] **Step 4: Run `npx tsc --noEmit`, `npx eslint . --quiet` and `npm run build`.**
- [ ] **Step 5: Commit only test/documentation adjustments required by evidence.**
