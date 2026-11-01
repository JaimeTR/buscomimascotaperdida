# Publica y Fundacion Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar la identidad actual con la dirección Confianza comunitaria y mejorar la experiencia pública de búsqueda y reporte.

**Architecture:** Reutilizar componentes UI existentes, definir tokens en `globals.css` y mantener las páginas App Router existentes. La portada seguirá cargando datos reales desde Supabase mediante los hooks actuales; el rediseño cambiará jerarquía, estados y accesibilidad sin duplicar la lógica de consulta.

**Tech Stack:** Next.js App Router, Tailwind CSS 4, Radix UI, lucide-react, Supabase hooks, Leaflet.

**Spec:** `docs/superpowers/specs/2026-11-01-rediseño-admin-produccion-design.md`

## Global Constraints

- Conservar logo, nombre y base de marca; modernizar sin rebranding total.
- Teal/crema como base y naranja solo para CTA o atención.
- Validar 375, 768, 1024 y 1440 píxeles.
- Cumplir contraste WCAG AA, focus visible, teclado y reduced motion.
- No añadir una dependencia si los componentes existentes resuelven el caso.

---

### Task 1: Definir tokens y primitives visuales

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/badge.tsx`
- Create: `src/components/ui/status-badge.tsx`
- Test: visual browser review and lint

**Interfaces:**
- Consumes: existing Tailwind CSS variables and UI primitives.
- Produces: stable tokens and `StatusBadge({ status, size? })` for `lost`, `found`, `in_contact`, `paused`, `pending_review`, `reunited`, `closed`.

- [ ] **Step 1: Add the semantic color and spacing tokens.**

  Define CSS variables for trust teal, cream background, action orange, readable muted text, borders, focus ring and status colors without removing dark-mode variables used by existing components.

- [ ] **Step 2: Update button and badge variants.**

  Preserve existing variant names, improve focus/hover/disabled states, and use the new semantic tokens rather than page-specific blue values.

- [ ] **Step 3: Create the shared status badge.**

  Map every supported status to Spanish label, background, foreground and optional icon; unknown statuses must render a neutral safe label.

- [ ] **Step 4: Run lint and build.**

  Run: `npx eslint src/app/globals.css src/components/ui/button.tsx src/components/ui/badge.tsx src/components/ui/status-badge.tsx --quiet`; `npx tsc --noEmit`

- [ ] **Step 5: Commit.**

  Commit: `git add src/app/globals.css src/components/ui/button.tsx src/components/ui/badge.tsx src/components/ui/status-badge.tsx && git commit -m "feat: add community trust design tokens"`

### Task 2: Rediseñar layout, navegación y footer

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/navbar.tsx`
- Modify: `src/components/footer.tsx`
- Modify: metadata/icon files under `src/app` and `public`
- Test: browser at mobile and desktop widths

**Interfaces:**
- Consumes: shared tokens and existing auth/session UI.
- Produces: responsive navigation with public actions, authenticated dashboard/admin entry points only when authorized, and real footer links.

- [ ] **Step 1: Inventory every placeholder link and inaccessible control.**

  Search: `git grep -n '#/' -- src public` and inspect each result before changing it.

- [ ] **Step 2: Implement mobile-first navigation.**

  Keep the logo and language, expose Buscar and Reportar as primary actions, collapse secondary links into a keyboard-accessible menu, and show dashboard/admin links only from server/client authorization state already available.

- [ ] **Step 3: Replace placeholder footer links.**

  Link privacy, terms, contact, report and search to real routes; remove links that have no supported destination rather than leaving `/#`.

- [ ] **Step 4: Validate focus, labels and responsive layout in browser.**

  Check keyboard tab order, menu escape behavior, 375px and 1440px screenshots, and console errors.

- [ ] **Step 5: Commit.**

  Commit: `git add src/app/layout.tsx src/components/navbar.tsx src/components/footer.tsx public src/app && git commit -m "feat: modernize responsive site navigation"`

### Task 3: Rediseñar portada y búsqueda pública

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/mascotas/page.tsx`
- Modify: `src/components/pet-card.tsx`
- Modify: `src/components/location-popover.tsx`
- Modify: `src/components/breed-popover.tsx`
- Modify: `src/components/color-popover.tsx`
- Test: browser smoke and accessibility review

**Interfaces:**
- Consumes: `usePets` filters and existing popover components.
- Produces: search-first hero, clear filter state, responsive cards, empty/loading/error states and accessible map CTA.

- [ ] **Step 1: Add a visible primary action hierarchy.**

  Put search input and Buscar mascota first, Reportar mascota second, and trust/community proof below; avoid competing CTA colors.

- [ ] **Step 2: Preserve existing filter query behavior.**

  Keep `searchQuery`, location, type, breed, color and date filters; extract repeated filter button styles into local helpers instead of changing the hook contract.

- [ ] **Step 3: Improve result cards.**

  Use `StatusBadge`, stable image dimensions, alt text from pet name/type, location text with fallbacks, and explicit keyboard/focus behavior.

- [ ] **Step 4: Add robust empty/loading/error states.**

  Make clear whether there are no reports, filters are active, or Supabase failed; never show a success-shaped empty result on a query error.

- [ ] **Step 5: Validate at all four target widths and commit.**

  Run the browser review and `npx eslint src/app/page.tsx src/app/mascotas/page.tsx src/components/pet-card.tsx --quiet`.

  Commit: `git add src/app/page.tsx src/app/mascotas/page.tsx src/components/pet-card.tsx src/components/location-popover.tsx src/components/breed-popover.tsx src/components/color-popover.tsx && git commit -m "feat: redesign public pet search experience"`

### Task 4: Mejorar flujo de reportar y detalle público

**Files:**
- Modify: `src/app/reportar/page.tsx`
- Modify: `src/app/mascotas/[id]/page.tsx`
- Modify: `src/app/cartel/page.tsx`
- Modify: `src/lib/image-upload.ts`
- Test: authenticated and unauthenticated browser flows

**Interfaces:**
- Consumes: profile completion, image upload validation, LocationMap and Supabase RLS.
- Produces: guided report form with clear progress/errors and public detail with safe contact/location presentation.

- [ ] **Step 1: Split the report form into visible stages without changing submission contract.**

  Group identity, location, photos and contact/profile completion; preserve existing field names sent to `pets`.

- [ ] **Step 2: Add upload cleanup and accessible previews.**

  Revoke removed object URLs, label main image selection, show file type/size errors before upload, and keep the 5 MiB JPEG/PNG/WebP rule.

- [ ] **Step 3: Improve the public detail page.**

  Show status, approximate location, date, image gallery, safe contact action and report moderation affordance without exposing private profile fields.

- [ ] **Step 4: Test auth and failure states.**

  Verify unauthenticated redirect, incomplete Google profile dialog, failed image upload, failed insert, successful insert and notification failure without losing the report.

- [ ] **Step 5: Commit.**

  Commit: `git add src/app/reportar src/app/mascotas src/app/cartel src/lib/image-upload.ts && git commit -m "feat: improve report and public detail flows"`
