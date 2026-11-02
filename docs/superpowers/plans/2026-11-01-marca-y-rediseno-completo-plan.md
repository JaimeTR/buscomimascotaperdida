# Marca nueva y rediseño completo — Plan

> Skill de proyecto: `.claude/skills/limpieza-seguridad-rediseno` (gate, seguridad y reglas de diseño). Ejecutar cada fase con ese gate en verde.

**Decisiones aprobadas (2026-11-01):** backend Supabase en proyecto nuevo · paleta teal + naranja cálido · logo huella + lupa simplificada.

**Estado de partida:** lint 0 warnings, `tsc` y build en verde (commit 8746868). Fundación visual, navbar/footer, portada, dashboard (resumen y pistas) y admin ya existen. Backend no conectado.

## Fase A — Backend Supabase (bloquea pruebas reales)

1. Crear proyecto nuevo (región cercana a Perú: `sa-east-1`). Confirmar costo con el usuario antes de crear.
2. Aplicar migraciones en orden (`supabase/migrations/*`) y la base de `pets`, `profiles`, `sightings` (hoy NO están versionadas: exportar el esquema base a una migración inicial).
3. Verificar RLS con `get_advisors` (seguridad) y casos de abuso: leer/editar reporte ajeno, escalar rol, subir imagen fuera de la carpeta propia.
4. Crear bucket `pet-images`, configurar Auth (Site URL, Redirect URLs, Google OAuth), Resend (dominio) y variables en `.env.local` y Hostinger. Rotar toda credencial que haya estado expuesta.
5. Otorgar rol admin: `insert into public.admin_users (user_id) values ('<uuid>')`.

Hecho cuando: login (correo y Google), crear reporte con imagen, avistamiento y `/admin` funcionan contra el proyecto real.

## Fase B — Identidad de marca

1. Logo SVG nuevo: símbolo huella dentro de lupa + wordmark "Busco mi mascota" (tipografía Outfit ya cargada). Versiones: color, monocromo, sobre fondo teal.
2. Exportar: `public/logo.svg`, `public/logo_symbol.svg`, íconos PWA 72–512 y maskable, `favicon.ico`, imagen OG 1200×630. Sustituir `generate-icons.*` por un único script a partir del SVG.
3. Paleta completa en `globals.css`: escala teal 50–900, naranja CTA, success/warning/destructive, neutros cálidos; verificar contraste AA con tabla en `docs/`. Modo oscuro opcional (decidir al final de la fase).
4. Actualizar `manifest.json`, `themeColor`, plantillas de correo (`src/emails`, `lib/email.tsx`) con la marca.

Hecho cuando: ningún azul `#3b82f6`/logo azul antiguo queda en el repo (`grep`), y Lighthouse PWA instalable.

## Fase C — Páginas públicas (una por commit)

| Página | Problemas conocidos | Objetivo |
|---|---|---|
| `/` | Filtros duplicados con `/mascotas` | Hero con búsqueda, casos recientes reales, cómo funciona, CTA |
| `/mascotas` | Imágenes y filtros extensos | Filtros en panel móvil, mapa diferido, estados vacío/carga/error |
| `/mascotas/[id]` | Placeholder externo, contacto | Galería accesible, estado, mapa aproximado, contacto seguro, compartir |
| `/mascotas/[id]/avistamiento` | Formulario largo | Pasos cortos, vista previa de imagen con limpieza |
| `/reportar` | 500 líneas en un archivo | Dividir en pasos (datos → fotos → ubicación → contacto), sin cambiar el contrato de envío |
| `/cartel` | Imágenes de Unsplash fijas | Cartel imprimible desde datos reales del reporte |
| `/promocionar` | Imágenes de ejemplo externas | Decidir: ¿se ofrece destacar reportes? Si no hay pagos, quitar o convertir en "cómo difundir" |
| `/contacto` | Formulario sin envío real y foto externa | Enviar por Resend (Server Action + Zod + rate limit) o quitar el formulario |
| `/login`, `/register`, `/forgot-password`, `/update-password` | Logos `<img>` y copy | Layout único de auth, Google primero, errores traducidos |
| `/privacidad`, `/terminos` | Genéricas | Revisar con datos reales (retención, borrado de cuenta e imágenes); añadir Cookies si se usan |
| `/offline` | — | Alinear con marca |

## Fase D — Dashboard y admin

- `/dashboard/reports`: extraer lista a componentes, acciones de ciclo de vida (pausar, marcar encontrado, cerrar) con confirmación.
- `/dashboard/settings` y `/edit`: mismo layout y validación Zod.
- Admin: gestión de usuarios (bloqueo) con auditoría, analítica con gráficos solo si hay datos reales.

## Fase E — Calidad y despliegue

- Gate completo, `npm audit` documentado, pruebas en 375/768/1024/1440, consola sin errores.
- Pruebas automáticas mínimas: `safe-path`, schemas Zod, guard admin.
- Despliegue Hostinger (`DEPLOYMENT.md`), smoke test, rollback.

## Orden y dependencias

A → (B en paralelo) → C → D → E. B no necesita backend; A es lo único que bloquea probar flujos reales.
