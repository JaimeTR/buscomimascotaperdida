# Casos de éxito (reencuentros)

## Flujo
1. **Marcar reunido** (dashboard → Mis reportes, o menú de estado en el detalle de la mascota) abre `ReunionDialog` (`src/components/reunion-dialog.tsx`): hasta 3 fotos del reencuentro, relato (≤ 1500) y casilla "Publicar en Casos de éxito" (activa por defecto). Las fotos suben a `pet-images/{userId}/reunion-*`.
2. Se guarda en `pets`: `status='reunited'`, `reunion_story`, `reunion_images`, `reunion_public`; `reunited_at` lo pone un trigger al pasar a reunited (migración `20261121140000_reunion_stories.sql`).
3. Público: `/casos-de-exito` (lista) y `/casos-de-exito/[id]` (fotos del reencuentro, relato, línea de tiempo: reporte → pistas → reunido, mapa de avistamientos, foto original). Solo si `reunion_public` y no `is_hidden`. No muestra datos de contacto ni nombres de quienes dieron pistas. Home muestra los 3 más recientes. Incluido en sitemap y footer.

## Recordatorios ("¿ya apareció?")
- **En la app:** banner en Mis reportes para casos activos con 7+ días (`reminderDue` en `src/lib/reunion.ts`, con test). "Todavía no" pospone 14 días (`reminded_at`).
- **Por correo:** `GET /api/cron/remind-owners` con `Authorization: Bearer $CRON_SECRET`. Programarlo 1 vez al día (cron del hosting o servicio externo). Necesita `SUPABASE_SERVICE_ROLE_KEY`, Resend y `CRON_SECRET`. Máx. 50 por corrida.

## Pendiente
- Moderación: un admin puede ocultar un caso con `is_hidden`; no hay aún botón "despublicar" para el dueño (puede reabrir el reporte desde Mis reportes).
- Aplicar la migración en Supabase y configurar el cron en producción.
