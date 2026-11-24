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

## Fase 1 — Rendimiento y caché ✅ (2026-11-24)
Meta: que un caso viral no tumbe el sitio.
Hecho: lecturas públicas del perfil (zona y coincidencias) en caché de 60 s, índices en `pets`, caché de estáticos; los mapas ya cargaban bajo demanda. Después: tarjetas y galería usan `next/image` (optimiza solo fotos de Supabase; las de fuentes externas se sirven sin optimizar). No hecho: el perfil sigue siendo dinámico porque lee la sesión (dueño/contacto), el listado `/mascotas` sigue en el cliente y quedan `<img>` menores (vistas previas, avatares, mapas).
- Caché con revalidación en `/mascotas` (listado sin filtros) y `/mascotas/[id]`; invalidar al crear/editar/cerrar un reporte.
- Migrar `<img>` a `next/image` donde sea seguro (listas y tarjetas).
- Mapas cargados bajo demanda (`dynamic`, sin SSR).
- Índices para filtros (estado, especie, distrito, fecha).
- Cabeceras de caché para estáticos.

## Fase 2 — Avisos al dueño ✅ (2026-11-24)
- Correo al dueño cuando llega un avistamiento o mensaje; correo al aportante cuando se confirma su apoyo; correo al admin cuando llega mensaje o impulso.
- Estado del impulso visible en el perfil de la mascota (solo para el dueño).

## Fase 3 — Alertas por zona ✅ ya existía
Las alertas por radio (`profiles.notification_location`, `notification_targets`, correo + push) ya estaban hechas; no se duplicó.
- Tabla `zone_alerts` (usuario, distrito, especie opcional) con RLS.
- Pantalla en `/panel/ajustes` para activar/quitar alertas.
- Al publicar un reporte: push/correo a quienes tienen alerta en ese distrito.

## Fase 4 — Ciclo de vida del reporte ✅ (parcial)
«Marcar reunido» y el recordatorio por cron ya existían. Hecho: reencontrados fuera de los casos activos del sitemap. No hecho: renovar reporte (el recordatorio cubre la necesidad).
- Botón «Ya apareció» (cierra el caso, ofrece contar la historia).
- Renovar reporte a los 30 días; recordatorio por el cron existente.
- Reportes cerrados/viejos fuera del sitemap.

## Fase 5 — SEO y GEO ✅ (2026-11-24)
- `/mascotas/distrito/[slug]` y `/mascotas/especie/[slug]` con contenido real de la base, JSON-LD y entrada en el sitemap.
- Guías (`/guias`) con pasos de «qué hacer las primeras 24 horas».
- JSON-LD `Organization`, `FAQPage`; `llms.txt` actualizado.

## Fase 6 — Accesibilidad y legal ✅ (parcial)
Hecho: enlace «Saltar al contenido», botón y tipo «Denuncia» en el formulario de contacto, textos que mencionaban planes de pago corregidos. Ya existían: `prefers-reduced-motion`, `:focus-visible`, derechos ARCO. Contraste de los tokens calculado: todos los pares pasan AA (≥ 5,18). Botones pequeños de cerrar/quitar foto con área táctil ampliada y alt corregidos. Pendiente: página de política de contenido (los Términos ya cubren las obligaciones).
- Foco visible, `prefers-reduced-motion`, áreas táctiles de 44 px, contraste AA, alt real en fotos.
- Política de contenido (`/politica-de-contenido`) y botón «Denunciar» en cada reporte con cola en admin.
- Ajustes de privacidad/ARCO en la página de privacidad.

## Fase 7 — Aliados, transparencia y admin ✅ (parcial)
Hecho: `/transparencia` (cifras reales, las que valen cero no se muestran), CSV de aportes en admin, ficha pública por aliado (`/aliados/[id]`, con JSON-LD y sitemap) y métricas de aportes por verificar y mensajes nuevos en el resumen del admin.
- Ficha pública por aliado (`/aliados/[slug]`) con SEO local.
- Página de transparencia con cifras reales de `pet_boosts` confirmados (solo si existen).
- Admin: métricas simples y exportar CSV de impulsos.

## Fuera de alcance por ahora
Cobros en línea, chapitas con QR (requiere proveedor/logística), modo oscuro, rol de moderador.
