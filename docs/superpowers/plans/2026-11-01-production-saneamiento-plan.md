# Production Saneamiento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar la base técnica segura, verificable y libre de bloqueos antes del rediseño funcional.

**Architecture:** Mantener Next.js App Router SSR en Hostinger y Supabase para Auth, Postgres, Storage y RLS. El saneamiento se hará sobre el worktree `production-readiness`, sin copiar secretos reales, y cada bloque terminará con validaciones reproducibles.

**Tech Stack:** Next.js 16.4.3, React 19.2.3, TypeScript, ESLint 9, Supabase SSR/JS, Zod, npm.

**Spec:** `docs/superpowers/specs/2026-11-01-rediseño-admin-produccion-design.md`

## Global Constraints

- No subir secretos reales al repositorio, documentación o chat.
- No ejecutar `npm audit fix --force`.
- No editar migraciones Supabase ya aplicadas; crear migraciones nuevas.
- Mantener SSR; no convertir la app a exportación estática.
- Validar con `npx eslint . --quiet`, `npx tsc --noEmit`, `npm run build`, checks de producción y `git diff --check`.
- Rotar/revocar las claves históricas expuestas antes de publicar.

---

### Task 1: Cerrar secretos y configuración sensible

**Files:**
- Modify: `.env.example`
- Modify: `supabase/functions/chat-ai/index.ts`
- Modify: `scripts/import-scraped-dogs.ts`
- Modify: `DEPLOYMENT.md`
- Test: `scripts/check-production-config.mjs`

**Interfaces:**
- Consumes: `GEMINI_API_KEY`, `HUGGINGFACE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGIN`.
- Produces: configuración documentada que falla cerrada cuando falta una variable sensible.

- [ ] **Step 1: Añadir pruebas estructurales para prohibir claves hardcodeadas y fallback anónimo.**

  Extender `scripts/check-production-config.mjs` para fallar si encuentra patrones `AIza`, `hf_`, URLs de proyectos Supabase concretos o `NEXT_PUBLIC_SUPABASE_ANON_KEY` usado como service key en scripts administrativos.

- [ ] **Step 2: Ejecutar el checker y confirmar que detecta el caso negativo.**

  Run: `node scripts/check-production-config.mjs`

  Expected: el checker debe fallar si se reintroduce cualquiera de esos patrones y pasar con placeholders.

- [ ] **Step 3: Mantener solo lecturas desde entorno en la Edge Function y el importador.**

  Confirmar `Deno.env.get("GEMINI_API_KEY")`, `Deno.env.get("HUGGINGFACE_API_KEY")`, `process.env.NEXT_PUBLIC_SUPABASE_URL` y `process.env.SUPABASE_SERVICE_ROLE_KEY`; rechazar ejecución si falta una variable requerida.

- [ ] **Step 4: Documentar la rotación fuera del repositorio.**

  Añadir a `DEPLOYMENT.md` una lista de acciones: revocar las claves históricas, crear nuevas, configurarlas en Supabase/Hostinger y no registrarlas en Git.

- [ ] **Step 5: Ejecutar validaciones y commit.**

  Run: `node scripts/check-production-config.mjs`; `git diff --check`

  Commit: `git add .env.example supabase/functions/chat-ai/index.ts scripts/import-scraped-dogs.ts DEPLOYMENT.md scripts/check-production-config.mjs && git commit -m "fix: close production secret configuration"`

### Task 2: Estabilizar chatbot y límites de proveedores

**Files:**
- Modify: `src/app/api/chatbot/route.ts`
- Modify: `supabase/functions/chat-ai/index.ts`
- Modify: `src/lib/env.ts`
- Test: `scripts/check-chatbot-structure.mjs`

**Interfaces:**
- Consumes: validated `{ message: string }` request with maximum 500 characters.
- Produces: validated analysis `{ isPetSearch, response, filters }` and generic error responses.

- [ ] **Step 1: Add a structural checker for boundary protections.**

  Assert the route limits message length, uses the provider key only in the Authorization header, has an AbortController timeout, parses a Zod schema, and returns generic error messages.

- [ ] **Step 2: Run the focused tests before implementation.**

  Run: `node scripts/check-chatbot-structure.mjs`

  Expected: the checker fails until each boundary protection exists.

- [ ] **Step 3: Keep the Zod schema strict and normalize optional filters.**

  Use the existing `analysisSchema`; reject unknown enum values, cap response/filter strings, and return only the parsed schema result.

- [ ] **Step 4: Add abort cleanup and provider readiness guards.**

  Use `AbortController` with a 15-second timeout and clear the timer in a `finally` block. Return 503 when the provider key is absent and 502 for provider failures.

- [ ] **Step 5: Decide and document the rate-limit deployment mode.**

  Keep the in-memory limiter only if Hostinger runs one process; otherwise add a shared HTTP-compatible limiter before enabling multiple instances. Document the selected mode in `DEPLOYMENT.md`.

- [ ] **Step 6: Run focused validation and commit.**

  Run: `node scripts/check-chatbot-structure.mjs`; `npx tsc --noEmit`; `npx eslint src/app/api/chatbot/route.ts supabase/functions/chat-ai/index.ts --quiet`

  Commit: `git add src/app/api/chatbot/route.ts supabase/functions/chat-ai/index.ts src/lib/env.ts && git commit -m "fix: validate chatbot provider boundaries"`

### Task 3: Remove correctness and warning blockers

**Files:**
- Modify: files reported by `npx eslint .`
- Modify: `src/app/cartel/page.tsx` and any file with a hook warning
- Test: existing build/type checks

**Interfaces:**
- Consumes: current components and hooks.
- Produces: zero ESLint errors and no warnings that indicate incorrect behavior.

- [ ] **Step 1: Capture a machine-readable warning inventory.**

  Run: `npx eslint . > eslint-report.txt 2>&1`

  Group warnings by unused symbols, hook dependencies, unoptimized images, accessibility and generated/build output.

- [ ] **Step 2: Fix correctness warnings first.**

  Add stable dependencies to hooks, remove stale state updates, and preserve cleanup for object URLs and async requests. Do not solve warnings with broad disables.

- [ ] **Step 3: Fix unused symbols and dead branches.**

  Remove imports and variables only after confirming they have no references; keep behavior unchanged.

- [ ] **Step 4: Fix image and accessibility warnings in touched surfaces.**

  Replace eligible remote `<img>` usage with `next/image` only after configuring the exact remote host, and add meaningful alt text. Leave an explicit local exception only when optimization is incompatible with a generated/download image.

- [ ] **Step 5: Validate and commit.**

  Run: `npx eslint . --quiet`; `npx tsc --noEmit`; `npm run build`; `git diff --check`

  Commit: `git add src && git commit -m "chore: resolve production quality warnings"`

### Task 4: Verify release readiness without real secrets

**Files:**
- Modify: `DEPLOYMENT.md`
- Modify: `supabase/PRODUCTION_CHECKLIST.md`
- Test: production check scripts and npm audit

**Interfaces:**
- Consumes: placeholder environment variables.
- Produces: a release checklist with explicit blockers and verification commands.

- [ ] **Step 1: Run a clean dependency install.**

  Run: `npm ci`

- [ ] **Step 2: Run the complete local release gate.**

  Run: `node scripts/check-production-config.mjs`; `node scripts/check-task-5-supabase.mjs`; `npx eslint . --quiet`; `npx tsc --noEmit`; `npm run build`; `npm audit --omit=dev`; `git diff --check`

- [ ] **Step 3: Document unresolved audit advisories by reachability.**

  Record the remaining `deepmerge` advisory as a low-severity transitive issue with no fix available, and state that forced remediation is not approved.

- [ ] **Step 4: Commit the release gate documentation.**

  Commit: `git add DEPLOYMENT.md supabase/PRODUCTION_CHECKLIST.md && git commit -m "docs: define production release gate"`
