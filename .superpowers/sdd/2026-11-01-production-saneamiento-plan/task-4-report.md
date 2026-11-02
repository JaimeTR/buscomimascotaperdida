# Task 4 — Production release gate report

Date: 2026-11-01
Worktree: `.worktrees/production-readiness`
Base commit: `751155b chore: resolve production quality warnings`

## Scope

Ran the requested local release gate without real credentials, using only
placeholders where the checker and build accept them. Updated `DEPLOYMENT.md`
and `supabase/PRODUCTION_CHECKLIST.md` with the reproducible gate, explicit
blockers, and the dependency advisory reachability assessment.

## Commands and outputs

### 1. `npm ci`

Command:

```text
npm ci
```

Exit code: `0`

Output:

```text
npm warn deprecated @react-email/components@1.0.12: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/img@0.0.12: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/link@0.0.13: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/hr@0.0.12: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/container@0.0.16: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/heading@0.0.16: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/code-inline@0.0.6: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/text@0.1.6: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/preview@0.0.14: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/body@0.3.0: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/button@0.2.1: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/tailwind@2.0.7: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @react-email/code-block@0.2.1: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.

added 598 packages, and audited 605 packages in 38s

203 packages are looking for funding
  run `npm fund` for details

20 vulnerabilities (4 low, 16 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

The install completed successfully. The summary includes development-only
advisories; the production-only audit is recorded below.

### 2. Production configuration checker

Command:

```text
NODE_ENV=production NEXT_PUBLIC_APP_URL=https://your-production-domain.example node scripts/check-production-config.mjs
```

Exit code: `0`

Output:

```text
Production configuration check passed.
```

### 3. Supabase checker

Command:

```text
node scripts/check-task-5-supabase.mjs
```

Exit code: `0`

Output:

```text
Task 5 source-structure assertions passed: bucket targets/limits, legacy policy replacement, ownership, and same-branch pre-upload guards are present.
```

### 4. Quiet ESLint

Command:

```text
npx eslint . --quiet
```

Exit code: `0`

Output:

```text
```

No errors or warnings were emitted.

### 5. TypeScript

Command:

```text
npx tsc --noEmit
```

Exit code: `0`

Output:

```text
```

### 6. Production build with placeholders

Command:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-me-with-supabase-anon-key NEXT_PUBLIC_APP_URL=https://your-production-domain.example npm run build
```

Exit code: `0`

Output:

```text
> dynamic-galileo@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
✓ Running next.config.ts took 55ms

  Creating an optimized production build ...
✓ Compiled successfully in 2.2s
  Running TypeScript ...
  Finished TypeScript in 4.1s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/25) ...
  Generating static pages using 11 workers (6/25)
  Generating static pages using 11 workers (12/25)
  Generating static pages using 11 workers (18/25)
✓ Generating static pages using 11 workers (25/25) in 1229ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chatbot
├ ƒ /api/email/test
├ ƒ /api/notify-nearby-users
├ ƒ /auth/callback
├ ○ /cartel
├ ○ /contacto
├ ○ /dashboard
├ ○ /dashboard/community
├ ○ /dashboard/messages
├ ○ /dashboard/reports
├ ƒ /dashboard/reports/[id]/edit
├ ○ /dashboard/settings
├ ○ /forgot-password
├ ○ /login
├ ○ /mascotas
├ ƒ /mascotas/[id]
├ ƒ /mascotas/[id]/avistamiento
├ ○ /offline
├ ○ /privacidad
├ ○ /promocionar
├ ○ /register
├ ○ /reportar
├ ○ /terminos
└ ○ /update-password

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### 7. Production audit

Command:

```text
npm audit --omit=dev
```

Exit code: `1`

Output:

```text
# npm audit report

deepmerge  >=4.2.0
deepmerge mergeObject() allows prototype poisoning of returned objects - https://github.com/advisories/GHSA-gcqx-w48m-w2h4
No fix available
node_modules/deepmerge
  html-to-text  6.0.0 - 9.0.5
  Depends on vulnerable versions of deepmerge
  node_modules/html-to-text
    @react-email/render  0.0.4 - 2.1.1
    Depends on vulnerable versions of html-to-text
    node_modules/@react-email/components/node_modules/@react-email/render
      @react-email/components  *
      Depends on vulnerable versions of @react-email/render
      node_modules/@react-email/components

4 low severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.
```

Reachability:

```text
@react-email/components@1.0.12
  -> @react-email/render@2.0.6
  -> html-to-text@9.0.5
  -> deepmerge@4.3.1
```

The application imports `@react-email/components` in the email templates and
`@react-email/render` in the email/notification helpers. Therefore this is a
reachable transitive dependency in the email-template rendering path, not an
unused lockfile entry. npm reports no available fix. Forced remediation is not
approved because `npm audit fix --force` may introduce breaking dependency
changes. Track the upstream fix and re-run the audit after a reviewed upgrade.

### 8. Diff whitespace check

Command:

```text
git diff --check
```

Exit code: `0`

Output:

```text
```

## Blockers and limitations

- The only local release-gate failure is `npm audit --omit=dev`, which exits
  `1` for four low-severity instances of the same `deepmerge` advisory. It has
  no published fix, and forced remediation is explicitly not approved.
- No real Supabase, Resend, Gemini, or Hugging Face credentials were available
  or used. The production checker and build passed with placeholders.
- Remote Supabase dashboard state, RLS, Storage settings, provider settings,
  and credential rotation remain manual deployment checks; this repository
  cannot verify them.
- Existing unrelated worktree changes were preserved: `next.config.ts` remains
  modified and `eslint-report.txt` remains untracked. Neither is included in
  the Task 4 commit.

## Documentation fix follow-up

The release documentation was clarified to state explicitly that
`npm audit --omit=dev` currently exits with code `1`, reports four
low-severity vulnerability instances of the same reachable `deepmerge`
advisory, and has no other production audit findings. This non-zero result is
an accepted, documented release caveat pending an upstream fix.

The dependency chain and reachability remain documented:
`@react-email/components` → `@react-email/render@2.0.6` →
`html-to-text@9.0.5` → `deepmerge@4.3.1`. npm reports no fix available,
`npm audit fix --force` remains prohibited, and remote Supabase/provider
verification and credential rotation remain manual limitations.

Validation:

```text
git diff --check — exit code 0
```
