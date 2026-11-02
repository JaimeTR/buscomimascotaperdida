---
name: limpieza-seguridad-rediseno
description: Use when working on buscomimascotaperdida.com to clean code, harden security, or redesign pages/brand. Runs the fixed gate (lint 0 warnings, tsc, build, admin guard check), the security checklist and the design rules (teal #0f766e + orange CTA, accessible, mobile-first). Trigger on "limpiar", "warnings", "seguridad", "rediseñar", "logo", "colores", "página nueva".
---

# Limpieza, seguridad y rediseño — Busco mi mascota

Orden fijo: **1. Gate → 2. Seguridad → 3. Diseño → 4. Gate otra vez → commit**. No saltar pasos ni silenciar reglas globalmente.

## 1. Gate (debe quedar en verde antes y después de cada tarea)

```bash
npx eslint . --max-warnings 0
npx tsc --noEmit
npm run build
node scripts/check-admin.mjs
git diff --check
```

- Unused imports: `npx eslint src -f json > lint.json && node scripts/remove-unused-imports.mjs lint.json`.
- Prohibido `eslint-disable` sin comentario de motivo en la misma línea. Prohibido bajar umbrales o borrar tests para pasar.
- Si `eslint .` falla por carpetas ajenas, revisar `globalIgnores` (ya excluye `.next`, `.worktrees`).

## 2. Seguridad (checklist por cambio)

- Trust boundary: todo input de Server Action/API se valida con **Zod** (ver `src/app/admin/actions.ts`).
- Autorización en servidor, nunca solo en UI: `requireAdmin()` en todo `/admin`; `getOwnerData()` filtra por `owner_id` en `/dashboard`. RLS es la segunda barrera.
- Filtros PostgREST con texto de usuario: quitar `, ( ) % * \` antes de `.or()/.ilike()`.
- Secretos solo en variables de entorno. Nunca en repo/docs/chat. `SUPABASE_SERVICE_ROLE_KEY` jamás en el cliente.
- Redirects `next=` solo por `src/lib/safe-path.ts` / `auth-redirects.ts`.
- Datos personales (teléfono, correo) no salen en respuestas públicas; admin ve nombre y zona, no contacto.
- Service worker no cachea `/api`, `/auth`, `/dashboard`, `/admin`, `/reportar`, `/login`.
- Migraciones: archivos nuevos y aditivos; **no aplicar en remoto sin confirmación del usuario**; documentar rollback.
- Rate limit de chatbot/email: compatible con el nº real de procesos en Hostinger.

## 3. Diseño

**Marca** (decidido): huella + lupa simplificada, SVG de un solo símbolo, legible a 16px y como ícono PWA. Teal `#0f766e` (primary), naranja `#c2410c` (solo CTA/urgencia), crema `#faf8f3` (fondo). Tokens en `src/app/globals.css` (`--primary`, `--cta`, `--success`, `--warning`); usar `bg-primary`, `bg-cta`, nunca hex ni `teal-*` sueltos en componentes nuevos.

Reglas:
- Una acción principal por sección. Naranja = máximo un CTA por vista.
- Estado siempre con texto (`StatusBadge`), nunca solo color.
- Contraste WCAG AA (≥4.5:1 texto). Foco visible. Todo icono-botón con `aria-label`. Imágenes con `alt` real.
- Mobile-first; validar 375/768/1024/1440 sin scroll horizontal. Targets táctiles ≥44px.
- `prefers-reduced-motion` respetado (ya en globals.css).
- Sin datos inventados: nada de métricas, testimonios, donaciones o personas ficticias. Si no hay dato real, estado vacío honesto.
- Reutilizar `src/components/ui/*`, `status-badge`, tokens. No añadir dependencias para algo que CSS resuelve.
- Imágenes: `next/image` para assets propios (logo, íconos); `<img>` con `alt` y `loading="lazy"` para contenido de usuario/blob (override documentado en `eslint.config.mjs`).
- Metadata por página (`export const metadata`), un solo `<h1>`, HTML semántico.

Para decisiones visuales nuevas invocar la skill `impeccable` (shape → craft); correr una sola ronda de verificación en navegador (móvil + escritorio) y un lote de arreglos.

## 4. Cierre

Gate completo en verde → commit pequeño con mensaje convencional (`feat|fix|chore|docs`). Reportar qué NO se probó (p. ej. flujos con Supabase real).
