# Producción, Google OAuth y PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar la aplicación para producción en Hostinger con Google OAuth, seguridad revisada, calidad validada y una PWA móvil segura.

**Architecture:** Mantener Next.js App Router con SSR y Server Actions, Supabase para Auth/Postgres/Storage y Resend para correo. Google OAuth se integra mediante Supabase y el callback existente; el caché offline se limita a recursos públicos y la pantalla offline, sin datos privados.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase SSR/Auth, Supabase Storage/RLS, Resend, Zod, Leaflet, PWA service worker, Hostinger Node.js/PM2.

**Spec:** `docs/superpowers/specs/2026-10-29-produccion-google-pwa-design.md`

## Global Constraints

- El despliegue objetivo es Hostinger y la aplicación debe conservar SSR.
- Google OAuth usa el proveedor de Supabase; no se crea un sistema paralelo de usuarios.
- Los usuarios de Google obtienen acceso inmediato; teléfono, departamento y distrito se solicitan al crear un reporte cuando falten.
- No guardar datos privados del panel, autenticación, mensajes ni reportes personalizados en caché offline.
- No incluir secretos reales en código, documentación ni archivos versionables.
- Actualizar dependencias de forma conservadora y validar cada cambio con lint, TypeScript y build.
- No añadir notificaciones push en esta fase.
- No cambiar funcionalidades fuera del alcance aprobado.

---

### Task 1: Establecer inventario seguro y configuración de validación

**Files:**
- Modify: `.env.example`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `.gitignore`
- Create: `src/lib/env.ts`
- Create: `scripts/check-production-config.mjs`
- Test: `scripts/check-production-config.mjs` mediante ejecución CLI

**Interfaces:**
- Produces `assertServerEnv()` para validar variables privadas al usar servicios de servidor.
- Produces `isSafeInternalPath(value: string | null, fallback: string): string` para callbacks y acciones de autenticación.

- [ ] **Step 1: Documentar solo nombres de variables**

  Mantener en `.env.example` `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY` y `HUGGINGFACE_API_KEY`, usando valores ficticios y explicando qué variables son obligatorias en producción.

- [ ] **Step 2: Crear validación server-only**

  Implementar `src/lib/env.ts` con funciones que lancen un error descriptivo cuando falten `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y que diferencien variables opcionales de obligatorias. No imprimir valores.

- [ ] **Step 3: Crear comprobación de configuración de producción**

  Hacer que `scripts/check-production-config.mjs` compruebe que no existen valores de ejemplo, URLs localhost ni claves con nombres sensibles en archivos documentales. El script debe devolver código distinto de cero cuando encuentre una condición insegura.

- [ ] **Step 4: Ejecutar la comprobación**

  Run: `node scripts/check-production-config.mjs`

  Expected: PASS en el estado limpio o un listado explícito de cada valor que debe corregirse.

- [ ] **Step 5: Commit**

  ```bash
  git add .env.example package.json README.md .gitignore src/lib/env.ts scripts/check-production-config.mjs
  git commit -m "chore: validate production configuration"
  ```

### Task 2: Integrar Google OAuth con callback seguro

**Files:**
- Modify: `src/app/auth/actions.ts`
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/utils/supabase/server.ts`
- Modify: `src/utils/supabase/client.ts`
- Create: `src/components/auth/google-login-button.tsx`
- Test: `src/app/auth/callback/route.ts` mediante pruebas de rutas o comprobaciones manuales documentadas

**Interfaces:**
- `GoogleLoginButton` accepts `{ next: string }` and starts Supabase OAuth.
- `isSafeInternalPath()` from Task 1 is reused by login and callback.
- The callback returns a redirect to an internal path or `/dashboard`; external destinations are rejected.

- [ ] **Step 1: Definir destinos internos permitidos**

  Implementar y probar casos para `/dashboard`, `/reportar`, `/mascotas/abc` y valores inválidos como `https://example.com`, `//example.com` y cadenas sin `/`.

- [ ] **Step 2: Implementar el botón Google**

  Crear un componente cliente que llame `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/auth/callback?next=${encodedNext}` } })`, muestre estado de carga y presente errores mediante el toast existente.

- [ ] **Step 3: Integrar el botón en login**

  Mostrarlo junto al login por contraseña, conservando el destino interno solicitado y los estados de carga accesibles.

- [ ] **Step 4: Endurecer el callback**

  Intercambiar el código con `exchangeCodeForSession`, usar el destino validado y devolver un error controlado a `/login?error=auth-callback-failed` sin revelar detalles internos.

- [ ] **Step 5: Configurar las acciones de correo con el mismo guard**

  Aplicar el destino seguro en login, recuperación de contraseña y redirecciones posteriores. No aceptar `next` como URL absoluta.

- [ ] **Step 6: Validar el flujo**

  Run: `npm run build`

  Expected: build exitoso; la prueba manual se realizará con el proveedor Google habilitado en Supabase y las URLs de producción configuradas.

- [ ] **Step 7: Commit**

  ```bash
  git add src/app/auth src/components/auth src/utils/supabase
  git commit -m "feat: add Google OAuth login"
  ```

### Task 3: Completar perfil mínimo al crear reportes

**Files:**
- Modify: `src/app/reportar/page.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/lib/schemas/auth.ts`
- Create: `src/components/auth/complete-profile-dialog.tsx`
- Test: flujo de reporte con perfil incompleto

**Interfaces:**
- `CompleteProfileDialog` receives the current profile and an `onCompleted` callback.
- The report flow blocks submission only when required profile fields are absent.

- [ ] **Step 1: Identificar los campos mínimos desde el perfil actual**

  Reutilizar `phone`, `department` y `district`; no duplicar la fuente de verdad ni alterar el perfil público de Google.

- [ ] **Step 2: Crear el formulario de completado**

  Reutilizar los controles y validaciones del registro, permitir guardar solo los campos faltantes y exponer errores del servidor.

- [ ] **Step 3: Integrarlo antes de crear el reporte**

  Consultar el perfil autenticado; si faltan datos, abrir el formulario y no iniciar la inserción hasta completar correctamente.

- [ ] **Step 4: Validar casos**

  Comprobar usuario Google completo, usuario Google incompleto, usuario existente con perfil completo y usuario no autenticado.

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/reportar src/app/dashboard/settings src/components/auth/complete-profile-dialog.tsx src/lib/schemas/auth.ts
  git commit -m "feat: complete profile before reporting"
  ```

### Task 4: Revisar APIs, Server Actions y exposición de datos

**Files:**
- Modify: `src/app/api/chatbot/route.ts`
- Modify: `src/app/api/notify-nearby-users/route.ts`
- Modify: `src/app/api/email/test/route.ts`
- Modify: `src/app/auth/actions.ts`
- Modify: `src/lib/email.tsx`
- Modify: `src/lib/notifications.ts`
- Modify: `src/components/auth/login-form.tsx`
- Test: llamadas autenticadas/no autenticadas y payloads inválidos

**Interfaces:**
- Cada endpoint devuelve errores JSON estables sin stack traces ni secretos.
- Los servicios server-only validan variables mediante `assertServerEnv()`.

- [ ] **Step 1: Eliminar `any` de las rutas**

  Usar `unknown` en catches y un helper de error seguro para extraer mensajes sin asumir la forma del error.

- [ ] **Step 2: Validar método, payload y autenticación**

  Rechazar métodos no soportados, cuerpos inválidos y operaciones que requieran sesión sin usuario válido.

- [ ] **Step 3: Restringir la ruta de email de prueba**

  Mantenerla deshabilitada en producción y evitar que permita enviar correo arbitrario en entornos compartidos sin una protección explícita.

- [ ] **Step 4: Redactar logs**

  Evitar imprimir emails completos, tokens, respuestas de proveedores o datos de mascotas; conservar mensajes útiles y códigos de operación.

- [ ] **Step 5: Ejecutar lint focalizado**

  Run: `npx eslint src/app/api src/app/auth src/lib src/components/auth`

  Expected: cero errores.

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/api src/app/auth src/lib src/components/auth
  git commit -m "fix: harden server endpoints"
  ```

### Task 5: Revisar migraciones, RLS y Storage de Supabase

**Files:**
- Review/Modify: `supabase/migrations/*.sql`
- Review/Modify: `src/app/dashboard/reports/page.tsx`
- Review/Modify: `src/app/dashboard/reports/[id]/edit/page.tsx`
- Review/Modify: `src/app/mascotas/[id]/avistamiento/page.tsx`
- Review/Modify: `src/app/reportar/page.tsx`
- Create: `supabase/PRODUCTION_CHECKLIST.md`

**Interfaces:**
- Cada operación de lectura/escritura conserva la protección RLS del proyecto.
- Storage permite solo las lecturas públicas previstas y escrituras autenticadas con rutas controladas.

- [ ] **Step 1: Enumerar tablas y operaciones**

  Mapear perfiles, mascotas, imágenes, avistamientos, mensajes, preferencias y notificaciones contra las consultas de la aplicación.

- [ ] **Step 2: Revisar políticas**

  Confirmar que insertar, actualizar y eliminar requieren `auth.uid()` y que un usuario no puede modificar recursos ajenos.

- [ ] **Step 3: Revisar Storage**

  Confirmar límites de tipo/tamaño en cliente y políticas de objetos; no confiar solo en la extensión del archivo.

- [ ] **Step 4: Documentar pasos manuales**

  Crear checklist con migraciones en orden, URL del proyecto, revisión de RLS, buckets, Google provider y rotación de credenciales; nunca incluir secretos.

- [ ] **Step 5: Commit**

  ```bash
  git add supabase src/app/reportar src/app/mascotas src/app/dashboard/reports
  git commit -m "docs: document Supabase production checks"
  ```

### Task 6: Corregir metadatos, middleware y calidad Next.js

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/**/page.tsx` donde existan exports obsoletos
- Review/Modify: `src/middleware.ts`
- Modify: `next.config.ts`
- Modify: `eslint.config.mjs`
- Modify: `convert-icons.js` y scripts auxiliares lintados
- Test: `npm run lint`, `npm run build`

**Interfaces:**
- `viewport` se exporta mediante el tipo/API recomendado por Next.js.
- El refresco de sesión Supabase permanece activo tras cualquier migración de `middleware` a `proxy`.

- [ ] **Step 1: Separar metadata y viewport**

  Mover `themeColor` y configuración viewport al export recomendado y eliminar duplicados de páginas.

- [ ] **Step 2: Resolver el warning de root**

  Configurar explícitamente `turbopack.root` al directorio del proyecto o documentar la eliminación segura del lockfile externo; no borrar archivos sin verificar su pertenencia.

- [ ] **Step 3: Evaluar `middleware`**

  Si Next.js 16 requiere `proxy`, renombrar y actualizar el export conservando el matcher y la actualización de cookies; si no es necesario para compatibilidad de Hostinger, mantenerlo y documentar la advertencia.

- [ ] **Step 4: Corregir ESLint**

  Sustituir `require` en scripts por imports compatibles o ajustar el alcance de lint para scripts generadores que no forman parte del runtime; no silenciar errores de aplicación.

- [ ] **Step 5: Validar**

  Run: `npm run lint`

  Expected: cero errores; warnings justificados y no relacionados con secretos.

- [ ] **Step 6: Commit**

  ```bash
  git add src/app next.config.ts src/middleware.ts eslint.config.mjs convert-icons.js scripts
  git commit -m "fix: align Next.js quality checks"
  ```

### Task 7: Mejorar PWA segura, rendimiento y accesibilidad

**Files:**
- Review/Modify: `public/manifest.json` o equivalente existente
- Review/Modify: `public/sw.js` o registro actual del service worker
- Modify: `src/components/pwa-register.tsx`
- Modify: `src/components/pwa-install-prompt.tsx`
- Modify: `src/app/offline/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: componentes con controles sin etiquetas detectados durante la prueba
- Test: navegador móvil/escritorio y offline

**Interfaces:**
- El service worker solo cachea recursos públicos y la pantalla offline.
- `PWARegister` registra, actualiza y reporta errores sin bloquear la aplicación.

- [ ] **Step 1: Inventariar el service worker**

  Confirmar ubicación, precache y estrategias actuales antes de editar; identificar cualquier regla que capture `/dashboard`, `/auth`, `/api` o datos privados.

- [ ] **Step 2: Excluir rutas privadas**

  Rechazar caché para autenticación, panel, mensajes, reportes personalizados, APIs y respuestas con cookies.

- [ ] **Step 3: Controlar actualizaciones**

  Implementar aviso o actualización controlada cuando exista una nueva versión, sin borrar datos de sesión ni forzar un reload repetitivo.

- [ ] **Step 4: Revisar instalación y metadatos**

  Confirmar iconos, nombre, colores, `display`, idioma y manifest válido; mantener fallback cuando la instalación no esté disponible.

- [ ] **Step 5: Auditar accesibilidad**

  Verificar foco, `aria-label`, botones con texto claro, inputs asociados a labels, contraste y estados de carga en login, registro, reportes, navegación y modales.

- [ ] **Step 6: Optimizar carga**

  Mantener mapas y componentes pesados diferidos; revisar imágenes con dimensiones/alt y evitar cargar recursos duplicados.

- [ ] **Step 7: Validar offline**

  Run: arrancar producción, abrir la página pública, desconectar red y comprobar `/offline`; luego intentar panel/API y comprobar que no se sirve información privada desde caché.

- [ ] **Step 8: Commit**

  ```bash
  git add public src/components/pwa-register.tsx src/components/pwa-install-prompt.tsx src/app/offline src/app/layout.tsx src/app/globals.css
  git commit -m "feat: harden mobile PWA experience"
  ```

### Task 8: Actualizar dependencias con control de compatibilidad

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `DEPENDENCY_AUDIT.md`
- Test: `npm outdated`, `npm audit`, `npm run lint`, `npm run build`

**Interfaces:**
- No dependencia nueva se introduce sin justificar su uso dentro del alcance.
- Las versiones actualizadas deben permanecer compatibles con Next.js 16, React 19, Supabase SSR y Node soportado por Hostinger.

- [ ] **Step 1: Capturar estado actual**

  Run: `npm outdated --json` y `npm audit --omit=dev`

  Guardar solo nombres, versiones y severidades en `DEPENDENCY_AUDIT.md`; no copiar tokens ni rutas privadas.

- [ ] **Step 2: Actualizar por grupos**

  Actualizar primero parches/minors compatibles de runtime, luego herramientas de desarrollo; evitar major upgrades de Next.js/React/Supabase en esta entrega salvo que una vulnerabilidad crítica lo exija.

- [ ] **Step 3: Instalar de forma reproducible**

  Run: `npm ci`

  Expected: instalación limpia usando el lockfile actualizado.

- [ ] **Step 4: Validar cada grupo**

  Run: `npm run lint && npm run build`

  Expected: PASS; si una actualización rompe el build, revertir solo ese grupo y documentarlo.

- [ ] **Step 5: Commit**

  ```bash
  git add package.json package-lock.json DEPENDENCY_AUDIT.md
  git commit -m "chore: update compatible dependencies"
  ```

### Task 9: Actualizar documentación y checklist Hostinger

**Files:**
- Modify: `DEPLOYMENT.md`
- Modify: `.env.example`
- Modify: `README.md`
- Create: `PRODUCTION_CHECKLIST.md`
- Create: `docs/superpowers/plans/2026-10-29-produccion-google-pwa.md` (este plan)

**Interfaces:**
- La documentación usa placeholders y nombres de variables, nunca valores reales.
- Los pasos de configuración externa quedan separados de los checks automatizables.

- [ ] **Step 1: Eliminar credenciales expuestas**

  Reemplazar cualquier API key o valor sensible en `DEPLOYMENT.md` por placeholders y registrar que la clave anterior debe revocarse/regenerarse.

- [ ] **Step 2: Documentar Hostinger**

  Incluir Node compatible, instalación, build, start/PM2, puerto, variables, dominio, HTTPS, logs, reinicio y rollback.

- [ ] **Step 3: Documentar Google/Supabase**

  Incluir proveedor Google, Client ID/Secret en Supabase, Site URL, Redirect URLs de desarrollo y producción, y la URI de callback sin credenciales.

- [ ] **Step 4: Documentar Resend y migraciones**

  Incluir dominio remitente, API key como paso de panel, aplicación ordenada de migraciones, Storage y RLS.

- [ ] **Step 5: Crear checklist**

  Separar `Automático`, `Manual externo`, `Smoke test` y `Rollback`; incluir rotación de secretos como requisito bloqueante antes de publicar.

- [ ] **Step 6: Commit**

  ```bash
  git add DEPLOYMENT.md README.md .env.example PRODUCTION_CHECKLIST.md
  git commit -m "docs: finalize Hostinger production guide"
  ```

### Task 10: Validación final de producción

**Files:**
- Test: aplicación completa y checklist
- Review: todos los archivos modificados en Tasks 1-9

**Interfaces:**
- La entrega final debe demostrar lint limpio, build limpio y arranque real en modo producción.

- [ ] **Step 1: Instalar dependencias limpias**

  Run: `npm ci`

  Expected: código de salida 0.

- [ ] **Step 2: Ejecutar lint**

  Run: `npm run lint`

  Expected: cero errores.

- [ ] **Step 3: Construir producción**

  Run: `npm run build`

  Expected: build completado sin errores; revisar warnings y resolver los relacionados con configuración o seguridad.

- [ ] **Step 4: Arrancar producción**

  Run: `npm start`

  Expected: servidor escuchando en el puerto configurado; comprobar con `Invoke-WebRequest http://localhost:3000`.

- [ ] **Step 5: Ejecutar smoke test**

  Comprobar página principal, login, callback inválido, rutas públicas, protección del panel, formularios, subida de imagen, mapas, chatbot y pantalla offline.

- [ ] **Step 6: Revisar secretos**

  Run: `git grep -n -i -E 'api[_-]?key|secret|password|re_[A-Za-z0-9]|sb_secret' -- ':!package-lock.json'`

  Expected: ningún valor real; solo nombres, placeholders o documentación de rotación.

- [ ] **Step 7: Marcar bloqueos externos**

  Confirmar manualmente en Hostinger, Supabase, Google Cloud y Resend las URLs, credenciales nuevas, dominio, HTTPS, migraciones y proveedor OAuth.

- [ ] **Step 8: Commit final**

  ```bash
  git add .
  git commit -m "chore: validate production readiness"
  ```
