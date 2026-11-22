# Estado del proyecto — 2026-11-22

Punto de partida para retomar el trabajo. Actualizar al cerrar cada sesión. Contexto para asistentes: `CLAUDE.md`.

## Qué es
Red comunitaria gratuita para encontrar mascotas perdidas en Perú (buscomimascotaperdida.com). Next.js 16 + Supabase (Postgres, Auth, Storage, RLS) + Tailwind. PWA con push. **En línea en Vercel:** https://buscomimascotaperdida.vercel.app (`main` = producción, `dev` = vista previa; sin dominio propio todavía).

## Hecho
- **Marca y diseño:** logo pin+huella, Outfit + Poppins, tokens (`docs/marca.md`, `DESIGN.md`, `docs/componentes.md`). Fondo con marca de agua de huellitas, banners en panel de color con buscador flotante, encabezado fijo que se encoge al hacer scroll (escritorio: solo isologo y foto de perfil), movimiento al pasar el cursor y al hacer clic (también en iconos).
- **Rutas en español** con redirecciones 301 (`/ingresar`, `/registro`, `/panel`…), SEO/GEO (JSON-LD, canonical, sitemap, robots, `noindex` en panel y admin).
- **Búsqueda:** portada y `/mascotas` con «Consultar a nuestra IA» (abre el asistente con tus filtros), filtros rápidos centrados en escritorio y panel de filtros completo en móvil (color, raza, tamaño, fecha, lugar), lista con paginación real de 12 en 12, scroll infinito con precarga y llamados a reportar entre bloques.
- **Reportar** (`/reportar`): pasos mascota → lugar → fotos → **apoyo voluntario (opcional)**; modo «perdí» o «encontré», fecha, fotos con controles táctiles.
- **Perfil de la mascota** rediseñado: galería, tarjeta de contacto, historial como línea de tiempo, compartir. Ver `docs/perfil-mascota-y-contacto.md`.
- **Cartel** (`/cartel`): página completa con vistas reales de 5 plantillas y 6 formatos; plantilla de la marca por defecto; franja «¿Lo viste? Repórtalo en buscomimascotaperdida.com».
- **Apoyo voluntario y destacados:** sin planes; el monto confirmado ordena «Mascotas destacadas» (portada), aviso flotante en otras páginas y anuncios de negocios. Ver `docs/apoyo-voluntario.md`.
- **Contacto y formularios en modal**, bandeja de mensajes del admin, grupo de colaboradores por WhatsApp. Ver `docs/contacto-y-formularios.md`.
- **Acceso:** Google funcionando y publicado; Facebook oculto (ver pendiente). Guard de servidor, registro mínimo. Ver `docs/autenticacion.md`.
- **Casos de éxito, legal, admin** (reportes, usuarios, promociones, anuncios, aliados, mensajes, impulsos, auditoría), cron diario de recordatorios (`vercel.json`).
- **Calidad:** `tsc`, `eslint` sin errores, 18 pruebas, `check:production-config`.

## Pendiente (acciones tuyas, paneles externos)
1. **Admin:** insertar tu usuario en `admin_users` (`insert into admin_users`). Sin eso no se ven `/admin/*` (mensajes, impulsos, promociones).
2. **Vercel:** `SUPABASE_SERVICE_ROLE_KEY` (eliminar cuenta, cron, límites compartidos), `NEXT_PUBLIC_APP_URL`/`ALLOWED_ORIGIN` con la URL real, `CRON_SECRET`. Ya cargadas: Yape/Plin, titular, WhatsApp, teléfono y correo de contacto.
3. **Dominio propio** (`buscomimascotaperdida.com`): agregar al proyecto de Vercel, y actualizar Google Cloud (orígenes y marca), Supabase (Site URL y redirects) y el correo `contacto@…` (hoy no recibe nada hasta tener buzón).
4. **Facebook login:** crear app en Meta con el callback de Supabase y activar el proveedor; luego `FACEBOOK_ENABLED = true` en `social-buttons.tsx`.
5. **Resend:** verificar dominio y remitente.
6. **Datos legales reales** (RUC, razón social, domicilio): `docs/legal.md`.

## Pendiente (desarrollo)
- **Mapa con MapLibre** (otra sesión): `pets-map`, `sightings-map`, `map-picker`, `location-map` y `base-map-layer` en curso; no está en `main`.
- Avisos por correo: al admin cuando llega un mensaje/impulso y a la persona cuando se confirma su aporte.
- Estado del impulso visible para el dueño (panel y perfil).
- Sección pública de agradecimiento a colaboradores.
- Probar con una cuenta real: reportar con aporte, subir comprobante, aprobar en `/admin/impulsos`, contacto público y avistamientos (aún no hay datos reales de esos flujos).
- Casos reales para reemplazar los importados y fotos reales en lugar de stock. Los 63 casos importados enlazan la foto de su fuente (no está alojada aquí): riesgo de derechos de autor, quitar a pedido.
- Libro de reclamaciones hoy por correo; si hay volumen, tabla.

## Cómo trabajar
`npm run dev` · `npm test` · `npx tsc --noEmit` · `npx eslint src`. Dev → `main` sin PR; el push a `main` despliega. Varias sesiones pueden editar el mismo directorio: commitear solo los archivos propios y revisar `git status`.
