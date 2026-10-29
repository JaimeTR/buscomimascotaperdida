# Task 5 report: Supabase migrations, RLS, and Storage

## Scope

Reviewed the Task 5 migration and application operations for profiles, pets, pet images, sightings, messages, notification preferences, notifications, and Storage. The implementation preserves client-side Supabase operations and existing behavior.

## Changes

- `supabase/migrations/create_pet_images_storage.sql`
  - Restricted authenticated `pet-images` object INSERT operations to paths whose first folder is the authenticated user's UUID.
  - Kept public reads and existing owner-scoped UPDATE/DELETE policies unchanged.
- `supabase/migrations/20261029140200_harden_pet_images_storage.sql`
  - Added a versioned migration for existing deployments that drops/recreates the pet-images INSERT policy with `auth.uid()` ownership.
  - Reasserted owner-scoped UPDATE/DELETE policies and configured a 5 MiB bucket limit with JPEG/PNG/WebP MIME types.
- `src/lib/image-upload.ts`, `src/app/reportar/page.tsx`, `src/app/dashboard/reports/[id]/edit/page.tsx`, `src/app/mascotas/[id]/avistamiento/page.tsx`
  - Enforced the same MIME and 5 MiB constraints before preview and again before Storage upload.
- `supabase/PRODUCTION_CHECKLIST.md`
  - Added migration-order, RLS, Storage, content-type/size, Google provider, and credential-rotation checks without secrets.
- `scripts/check-task-5-supabase.mjs`
  - Added deterministic source-structure-only assertions that isolate the target migration/policy blocks, require `id = 'pet-images'` with bucket limits in the bucket block, verify bucket scoping plus legacy-policy replacement and INSERT/UPDATE/DELETE ownership clauses, and verify each flow has a same-branch `getImageUploadError(...)` guard with an explicit throw/return before Storage upload.
- `.superpowers/sdd/2026-10-29-produccion-google-pwa/task-5-report.md`
  - Recorded scope, checks, limitations, and commit metadata.

## Checks and results

Commands were run from:

`C:\Users\Jaime Tarazona\Documents\GitHub\buscomimascotaperdida.com\.worktrees\production-readiness`

- `node scripts/check-task-5-supabase.mjs` — PASS.
- `git diff --check` — PASS.
- `node scripts/check-task-5-supabase.mjs` — PASS after round 2 checker strengthening; this is a source-structure check, not a SQL parser or remote execution.
- Round 3 checker limitation: the guard and SQL checks use bounded regular expressions over source blocks; they are not full JavaScript/SQL parsers and do not prove runtime control flow or remote policy state.
- `npx tsc --noEmit` — PASS.
- `npm run build` — FAILS during prerendering of `/_not-found` because the local environment does not provide Supabase URL/API key environment variables. Compilation and TypeScript completed before the environment-dependent prerender failure. The build also emitted existing workspace-root and metadata warnings.
- `git diff --check` — PASS.
- `npm run lint` — FAILS on existing repository-wide ESLint errors outside this Task 5 change; no lint errors were introduced by the SQL/checklist changes.
- `npm audit --omit=dev` — reports existing dependency advisories; no dependency changes were made for Task 5.

## Remote verification limitation

No remote Supabase project was accessed. Remote RLS policies, Storage policies, bucket content-type/size restrictions, Google provider configuration, migration execution, and credential rotation remain manual deployment checks documented in `supabase/PRODUCTION_CHECKLIST.md`.

## Commit

Round 1 follow-up commit: `2e1f9b6ec64b803810a517546f3708dd4ab4e019`.
Round 2 checker-hardening commit: the commit containing this report; obtain its exact hash with `git rev-parse HEAD`.
Round 3 checker-hardening commit: the commit containing this report; obtain its exact hash with `git rev-parse HEAD`.
