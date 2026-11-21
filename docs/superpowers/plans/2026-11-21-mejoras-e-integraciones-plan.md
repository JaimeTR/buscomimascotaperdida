# Mejoras e integraciones — 2026-11-21

Estado: sitio estable (18 rutas OK, tsc/lint/build limpios, 0 vulnerabilidades, Supabase activo con 12 casos demo).
Orden = impacto / esfuerzo. Cada bloque es independiente.

## A. Para salir a producción (bloqueantes, acciones tuyas en paneles)
1. Supabase Auth: Site URL + redirects de producción; activar Google OAuth.
2. Resend: verificar dominio y definir remitente (hoy los correos no llegan a terceros).
3. `insert into admin_users` con tu usuario para usar `/admin`.
4. `SUPABASE_SERVICE_ROLE_KEY` en el hosting (alertas por cercanía y script de importación).
5. Deploy (Vercel/Hostinger) + dominio + `NEXT_PUBLIC_APP_URL`.

## B. Mejoras de producto (alto impacto)
1. **Alertas por radio**: ya existe `notifyNearbyUsers` (correo). Agregar push web (PWA ya instalada) y WhatsApp deep-link.
2. **Casos reales**: sección "Importados" con fuentes públicas (script `import-reports.mjs` ya valida). Reemplazar los demo cuando haya fuentes verificables.
3. **Coincidencias automáticas** perdido ↔ encontrado (misma especie, distrito/radio, fecha, colores) con aviso al dueño.
4. **Compartir**: imagen OG por mascota (`next/og`) y cartel descargable PDF/imagen (hoy `/cartel` existe).
5. **Mapa**: vista de mapa en `/mascotas` con clusters y filtro por días.
6. **Estado "Reencontrado"** + historias de éxito en la home (confianza y SEO).

## C. Calidad
1. Tests: solo hay 2 `.test.mjs`. Agregar pruebas de `import-reports` (validación) y de `notifications` (radio).
2. CI: GitHub Actions con `tsc`, `eslint`, `build`, `npm audit`.
3. Observabilidad: Sentry (errores) + Vercel Analytics.
4. Accesibilidad/rendimiento: auditoría Lighthouse; logo del navbar se corta en pantallas angostas.
5. Reemplazar stock images por fotos reales conforme haya reportes (créditos en `docs/creditos-imagenes.md`).

## D. Integraciones nuevas
- WhatsApp Business (contacto del dueño y avisos).
- Mapas: geocodificación de distritos con coordenadas reales.
- Veterinarias y refugios aliados (módulo `aliados` ya listo) con mapa y directorio.
- Chatbot: hoy HuggingFace/Gemini opcional; decidir proveedor único y límites de uso.
- Pagos de anuncios (Culqi/Yape) cuando el módulo de promociones tenga demanda.

## E. Deuda técnica conocida
- React 19.3 / TypeScript 7 / ESLint 10 / lucide 1.x / hookform-resolvers 7: migraciones mayores, hacerlas una por una con build verde.
- Carpeta `.worktrees/production-readiness` obsoleta (rutas largas impiden borrarla en Windows).
- `supabase/legacy-sql`: referencia histórica, borrar cuando las migraciones cubran todo.
