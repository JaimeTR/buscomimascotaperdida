# Task 3 Implementation Report

## Summary

Implemented minimum-profile completion for report creation. Authenticated users can enter `/reportar` immediately; the report submission flow opens a completion dialog only when `phone`, `department`, or `district` is missing. Complete profiles continue through the existing report flow unchanged.

## Changed files

- `src/app/reportar/page.tsx`
  - Loads the authenticated user's existing profile fields using the browser Supabase client.
  - Checks the three required profile fields only when the report submit action is attempted.
  - Blocks report insertion while the completion dialog is open.
  - Resumes normal report behavior after a successful profile update.
- `src/components/auth/complete-profile-dialog.tsx`
  - Added the profile completion form.
  - Reuses the existing phone validation and department/district selector conventions.
  - Updates only fields that were missing.
  - Displays Supabase/server errors through the existing toast system.
- `src/lib/schemas/auth.ts`
  - Added `completeProfileSchema` and its inferred type for phone, department, and district.
- `src/app/dashboard/settings/page.tsx`
  - Added department to the existing profile fallback, editor, and save payload.

No RLS policies, public-profile behavior, report insertion payload, or second profile source were introduced.

## Validation commands and results

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed |
| `git diff --check` | Passed before implementation commit |
| `npx eslint src\app\reportar\page.tsx src\app\dashboard\settings\page.tsx src\components\auth\complete-profile-dialog.tsx src\lib\schemas\auth.ts` | Failed on pre-existing `no-explicit-any` errors in `reportar/page.tsx` and `dashboard/settings/page.tsx`; the new dialog introduced no lint errors after replacing its catch variable with `unknown`. Existing warnings were also reported. |
| `npm run lint` | Failed on pre-existing repository-wide lint errors, beginning with `convert-icons.js` (`require()` imports and unused `fs`). |
| `npm run build` | Compilation and TypeScript phases passed, then prerendering failed because Supabase URL/API key environment variables were not available. Existing Next.js workspace-root, middleware, and metadata warnings were also emitted. |

The repository does not define an automated test script or test files for this flow, so the available type, lint, diff, and production-build checks were run.

## Commit

- `fddbb05d51cbfe670de5a7bc1f592f89a57e6267` — `feat: complete profile before reporting`

## Concerns

- Full lint remains blocked by unrelated pre-existing errors and warnings.
- Production build requires the configured Supabase environment variables; the failure was environmental during prerendering, not a TypeScript or compilation failure.
- The completion dialog uses the same limited Peru department/district dataset already used by the registration form; locations outside that existing dataset remain an existing product limitation.

## Round 1 fixes

- Added `src/lib/peru-locations.ts` as the canonical profile department/district dataset.
- Added `src/components/auth/profile-location-fields.tsx` so registration and profile completion share the same selectors and reset behavior.
- Removed the duplicated location dataset from `register-form.tsx` and `complete-profile-dialog.tsx`.
- Fixed the partial-profile case where `district` existed but `department` was missing: both location selectors render, choosing a department clears the stale district, and the replacement district remains required and selectable.
- Added `scripts/check-task-3-profile.mjs` for deterministic checks of shared data usage and the partial-profile replacement flow.

### Round 1 validation commands and exact results

| Command | Result |
| --- | --- |
| `node scripts\check-task-3-profile.mjs` | Passed: `Task 3 profile checks passed: shared location source and partial-profile replacement flow.` |
| `npx tsc --noEmit` | Passed with exit code 0. |
| `$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='round1-placeholder-anon-key'; npm run build` | Passed with exit code 0. Compilation, TypeScript, static generation, and route optimization completed. Existing Next.js workspace-root, middleware, and metadata warnings remain. |
| `npx eslint src\components\auth\profile-location-fields.tsx src\components\auth\complete-profile-dialog.tsx src\components\auth\register-form.tsx src\lib\peru-locations.ts` | Failed only on the pre-existing `no-explicit-any` error and unused `useActionState` warning in `register-form.tsx`; the new shared selector, canonical dataset, and dialog have no lint errors. |

## Round 2 fixes

- Expanded `src/lib/peru-locations.ts` to preserve the province-aware dataset and labels previously local to `LocationPopover`, including Lima/Callao and the additional province districts.
- Migrated `src/components/location-popover.tsx` to import `PERU_LOCATIONS` and `PERU_DEPARTMENTS` from the canonical module while preserving its province-first selection flow and map labels.
- Extended `scripts/check-task-3-profile.mjs` to assert that `LocationPopover` has no local `PERU_DATA`, imports the canonical source, and retains the Callao province dataset.

### Round 2 validation commands and exact results

| Command | Result |
| --- | --- |
| `node scripts\check-task-3-profile.mjs` | Passed: `Task 3 profile checks passed: shared location source and partial-profile replacement flow.` |
| `npx tsc --noEmit` | Passed with exit code 0. |
| `$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='round2-placeholder-anon-key'; npm run build` | Passed with exit code 0. Compilation, TypeScript, static generation, and route optimization completed. Existing Next.js workspace-root, middleware, and metadata warnings remain. |
| `git diff --check` | Passed with exit code 0. |
