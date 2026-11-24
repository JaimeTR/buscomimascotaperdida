# Plan de mejoras — 2026-11-24

Orden de ejecución. Cada fase termina con `npx tsc --noEmit`, `npx eslint src`, `npm test` y un commit en `dev`. Las reglas de `CLAUDE.md` mandan (honestidad, privacidad, sin cobros en línea, móvil primero).

## Acciones del dueño (no son código)
Sin esto el sitio no está «lanzado». Detalle en `docs/ESTADO-DEL-PROYECTO.md`.
1. Dominio propio en Vercel + Supabase (Site URL) + Google Cloud.
2. Buzón `contacto@` y dominio verificado en Resend.
3. `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `ALLOWED_ORIGIN` en Vercel.
4. Datos legales reales (RUC, razón social, domicilio) → `docs/legal.md`.
5. Reemplazar los 63 casos importados (derechos de foto).
6. Registrar el sitio en Google Search Console y Bing.
7. Registro del banco de datos ante la Autoridad de Protección de Datos Personales (Ley 29733).

## Fase 1 — Rendimiento y caché
Meta: que un caso viral no tumbe el sitio.
- Caché con revalidación en `/mascotas` (listado sin filtros) y `/mascotas/[id]`; invalidar al crear/editar/cerrar un reporte.
- Migrar `<img>` a `next/image` donde sea seguro (listas y tarjetas).
- Mapas cargados bajo demanda (`dynamic`, sin SSR).
- Índices para filtros (estado, especie, distrito, fecha).
- Cabeceras de caché para estáticos.

## Fase 2 — Avisos al dueño
- Correo al dueño cuando llega un avistamiento o mensaje; correo al aportante cuando se confirma su apoyo; correo al admin cuando llega mensaje o impulso.
- Estado del impulso visible en el perfil de la mascota (solo para el dueño).

## Fase 3 — Alertas por zona
- Tabla `zone_alerts` (usuario, distrito, especie opcional) con RLS.
- Pantalla en `/panel/ajustes` para activar/quitar alertas.
- Al publicar un reporte: push/correo a quienes tienen alerta en ese distrito.

## Fase 4 — Ciclo de vida del reporte
- Botón «Ya apareció» (cierra el caso, ofrece contar la historia).
- Renovar reporte a los 30 días; recordatorio por el cron existente.
- Reportes cerrados/viejos fuera del sitemap.

## Fase 5 — SEO y GEO
- `/mascotas/distrito/[slug]` y `/mascotas/especie/[slug]` con contenido real de la base, JSON-LD y entrada en el sitemap.
- Guías (`/guias`) con pasos de «qué hacer las primeras 24 horas».
- JSON-LD `Organization`, `FAQPage`; `llms.txt` actualizado.

## Fase 6 — Accesibilidad y legal
- Foco visible, `prefers-reduced-motion`, áreas táctiles de 44 px, contraste AA, alt real en fotos.
- Política de contenido (`/politica-de-contenido`) y botón «Denunciar» en cada reporte con cola en admin.
- Ajustes de privacidad/ARCO en la página de privacidad.

## Fase 7 — Aliados, transparencia y admin
- Ficha pública por aliado (`/aliados/[slug]`) con SEO local.
- Página de transparencia con cifras reales de `pet_boosts` confirmados (solo si existen).
- Admin: métricas simples y exportar CSV de impulsos.

## Fuera de alcance por ahora
Cobros en línea, chapitas con QR (requiere proveedor/logística), modo oscuro, rol de moderador.
