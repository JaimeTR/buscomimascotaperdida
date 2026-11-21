# Estado del proyecto — 2026-11-21

Punto de partida para retomar el trabajo. Actualizar al cerrar cada sesión.

## Qué es
Red comunitaria gratuita para encontrar mascotas perdidas en Perú (buscomimascotaperdida.com). Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage, RLS) + Tailwind/shadcn. PWA con push. Hosting previsto: Hostinger (Node.js), ver `DEPLOYMENT.md`.

## Hecho
- **Marca y diseño:** logo pin+huella, tipografía Outfit, tokens (`docs/marca.md`, `DESIGN.md`, `docs/componentes.md`).
- **Público:** home (hero, historias de reencuentro), búsqueda con lista/mapa, detalle de mascota, avistamientos, cartel por reporte, aliados, anuncios, promocionar, contacto.
- **Reportar:** flujo de 3 pasos, subida de imágenes validada, coincidencias perdido↔encontrado con correo al dueño, imagen OG para casos sin foto.
- **Dashboard:** reportes propios, pistas recibidas, perfil con avatar y notificaciones push.
- **Admin:** moderación, usuarios, anuncios/aliados/promociones, auditoría (`admin_users`, RLS).
- **Imágenes HD:** hero (`reencuentro-atardecer.webp`, 2400px) y login/registro (`paseo-en-el-parque.webp`, 2000px). Créditos en `docs/creditos-imagenes.md`. `next.config.ts` permite `quality` 75/85/90.
- **Encabezado:** solo isologo (el nombre en texto queda en el menú del dashboard).
- **Acceso** (ver `docs/autenticacion.md`): guard de servidor, Google + Facebook, registro mínimo, recordar correo, avatar instantáneo.
- **Legal** (ver `docs/legal.md`): términos, privacidad (Ley 29733), cookies, libro de reclamaciones.
- **Calidad:** tests `node --test` (`npm test`), CI en `.github/workflows/ci.yml`, tsc/eslint limpios.

## Pendiente (acciones tuyas, paneles externos)
1. Supabase → Auth: Site URL y Redirect URLs de producción; activar proveedores **Google** y **Facebook**; decidir "Confirm email" (recomendado: activo).
2. Aplicar migraciones pendientes de `supabase/migrations` (última de acceso: `20261121130500_oauth_profile_metadata.sql`; revisar también `push_subscriptions` y `promos`).
3. Resend: verificar dominio y remitente.
4. `insert into admin_users` con tu usuario.
5. Variables de producción en el hosting (`.env.example`): `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, VAPID, Sentry.
6. Datos legales reales (RUC, razón social, domicilio): ver `docs/legal.md`.

## Pendiente (desarrollo)
- Eliminar cuenta desde el perfil (derecho de cancelación; hoy solo por correo).
- `notify-nearby-users`: usar cliente service-role en servidor; el enlace usa `/pets/<id>` en vez de `/mascotas/<id>`.
- Libro de reclamaciones: hoy por correo; si hay volumen, guardarlo en tabla.
- Si se añade analítica, revisar cookies y banner de consentimiento (hoy solo hay cookies técnicas).
- Casos reales para reemplazar los demo; fotos reales en lugar de stock.
- Probar en navegador el flujo de acceso completo con Supabase real (no se verificó visualmente).

## Cómo trabajar
`npm run dev` · `npm test` · `npx tsc --noEmit` · `npx eslint src`. Varias sesiones trabajan en paralelo: commitear solo los archivos propios y revisar `git status` antes de subir.
