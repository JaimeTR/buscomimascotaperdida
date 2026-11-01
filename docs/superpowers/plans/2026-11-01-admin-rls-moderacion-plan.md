# Administracion y RLS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un panel administrativo seguro para moderar reportes, gestionar usuarios y consultar métricas con rol `admin`, RLS y auditoría.

**Architecture:** El rol se comprobará server-side mediante Supabase y políticas RLS; la UI de `/admin` solo será una capa de navegación. Las mutaciones destructivas pasarán por rutas server-side o funciones seguras, nunca por una service-role key en el cliente. Los listados usarán paginación y allowlists de campos.

**Tech Stack:** Next.js App Router, Supabase migrations/RLS, Supabase SSR/JS, Zod, Tailwind, lucide-react.

**Spec:** `docs/superpowers/specs/2026-11-01-rediseño-admin-produccion-design.md`

## Global Constraints

- El cliente nunca recibe `SUPABASE_SERVICE_ROLE_KEY`.
- Un usuario normal no puede leer ni mutar datos administrativos por cambiar la URL o el payload.
- Las migraciones nuevas no editan archivos ya aplicados.
- Las acciones destructivas requieren confirmación, autorización, auditoría y errores genéricos.
- Los listados administrativos deben paginar y seleccionar campos mínimos.

---

### Task 1: Diseñar rol admin y auditoría en Supabase

**Files:**
- Create: `supabase/migrations/20261101160000_add_admin_roles_and_audit.sql`
- Create: `src/lib/admin/types.ts`
- Create: `src/lib/admin/authorization.ts`
- Test: `scripts/check-admin-structure.mjs`

**Interfaces:**
- Produces `isAdmin(supabase, userId): Promise<boolean>`, `requireAdmin(): Promise<AdminContext>`, `AdminAction` and audit insert contract.

- [ ] **Step 1: Inspect current profiles, auth metadata and RLS migrations.**

  Identify existing `profiles`, `pets`, `sightings`, messages and storage policies before writing SQL.

- [ ] **Step 2: Write the failing structural checker.**

  Assert the migration defines an admin role source, an audit table with actor/action/target/timestamp, RLS enabled, and policies that cannot be self-escalated.

- [ ] **Step 3: Add the migration.**

  Create the smallest role/audit structure compatible with the existing schema, add indexes on actor and created time, and write policies that use a security-definer role check without recursive policy queries.

- [ ] **Step 4: Implement authorization helpers.**

  `isAdmin` must fail closed; `requireAdmin` returns a typed unauthorized result or throws the repository-standard safe error used by routes.

- [ ] **Step 5: Run structural checks and commit.**

  Run: `node scripts/check-admin-structure.mjs`

  Commit: `git add supabase/migrations src/lib/admin scripts/check-admin-structure.mjs && git commit -m "feat: add admin role and audit foundation"`

### Task 2: Add server-side admin guard and routes

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/api/admin/reports/route.ts`
- Create: `src/app/api/admin/reports/[id]/route.ts`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/metrics/route.ts`
- Create: `src/lib/admin/validation.ts`
- Test: route boundary tests

**Interfaces:**
- `GET /api/admin/reports?page=&pageSize=&status=&query=`
- `PATCH /api/admin/reports/:id` with allowlisted status/visibility fields
- `DELETE /api/admin/reports/:id` with explicit confirmation token/body
- `GET /api/admin/users?page=&pageSize=&query=`
- `GET /api/admin/metrics`

- [ ] **Step 1: Add failing tests for unauthorized access.**

  Assert 401 for no session, 403 for authenticated non-admin, 400 for invalid pagination/status and no database mutation on rejection.

- [ ] **Step 2: Implement `requireAdmin` in the admin layout and every route.**

  Do not rely on layout protection for API routes; each route must verify session and role.

- [ ] **Step 3: Validate query and mutation schemas with Zod.**

  Cap `pageSize`, allow only canonical statuses, trim search text, validate UUIDs, and require an explicit `confirm: true` for deletion.

- [ ] **Step 4: Implement paginated selects and audit writes.**

  Select only display fields, order deterministically, return total/page metadata, and insert an audit record after successful moderation.

- [ ] **Step 5: Run focused tests and commit.**

  Run: `node scripts/check-admin-structure.mjs`; `npx tsc --noEmit`; `npx eslint src/app/admin src/app/api/admin src/lib/admin --quiet`

  Commit: `git add src/app/admin src/app/api/admin src/lib/admin && git commit -m "feat: protect admin API and moderation routes"`

### Task 3: Build admin reports, users and metrics UI

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/reports/page.tsx`
- Create: `src/app/admin/reports/[id]/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/analytics/page.tsx`
- Create: `src/components/admin/admin-nav.tsx`
- Create: `src/components/admin/admin-table.tsx`
- Test: browser with admin and non-admin sessions

**Interfaces:**
- Consumes: admin API routes and `StatusBadge`.
- Produces: dashboard cards, paginated tables, filters, moderation actions, confirmation dialogs and empty/error/loading states.

- [ ] **Step 1: Create the protected admin shell.**

  Add sidebar/topbar navigation, current admin identity, responsive menu and a visible access-denied state without exposing data.

- [ ] **Step 2: Build report moderation table.**

  Include status, owner display name/email only when policy permits, location summary, created date, visibility and actions; paginate rather than loading all records.

- [ ] **Step 3: Build report detail and moderation flow.**

  Require confirmation for hide/delete, show the action consequence, refresh after success, and display generic failures.

- [ ] **Step 4: Build user and metrics screens.**

  Show minimal user fields, role/status indicators and aggregate metrics; never expose service credentials or raw sensitive content.

- [ ] **Step 5: Validate admin/non-admin browser behavior and commit.**

  Run responsive/accessibility review plus `npx eslint src/app/admin src/components/admin --quiet`.

  Commit: `git add src/app/admin src/components/admin && git commit -m "feat: build admin moderation dashboard"`

### Task 4: Verify RLS and production migration procedure

**Files:**
- Modify: `supabase/PRODUCTION_CHECKLIST.md`
- Modify: `DEPLOYMENT.md`
- Test: Supabase local/remote project chosen by user

- [ ] **Step 1: Apply the migration only to a confirmed non-production or approved project.**

  Record project identity and migration version before execution; do not guess the target project from a URL.

- [ ] **Step 2: Test role escalation and ownership abuse cases.**

  Attempt normal-user role self-update, direct `/admin` access, direct admin API calls, cross-user report access, and delete without confirmation; every attempt must fail.

- [ ] **Step 3: Test authorized admin operations.**

  Verify pagination, moderation, audit rows, user listing and aggregate metrics.

- [ ] **Step 4: Document rollback and evidence.**

  Record migration name, checks performed, known audit limitations and how to disable an admin account without deleting audit history.

- [ ] **Step 5: Run final release gate and commit documentation.**

  Run: `npx eslint . --quiet`; `npx tsc --noEmit`; `npm run build`; `node scripts/check-production-config.mjs`; `node scripts/check-task-5-supabase.mjs`; `git diff --check`

  Commit: `git add supabase/PRODUCTION_CHECKLIST.md DEPLOYMENT.md && git commit -m "docs: verify admin migration and release procedure"`
