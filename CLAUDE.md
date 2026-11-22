# Contexto del proyecto (para personas y asistentes de IA)

**Busco mi mascota** (buscomimascotaperdida.com): red comunitaria gratuita para reencontrar mascotas perdidas en Perú (primero Lima). Producción de prueba: https://buscomimascotaperdida.vercel.app. Lee primero `docs/ESTADO-DEL-PROYECTO.md`.

## Stack
Next.js 16 (App Router, `proxy.ts` como middleware) · React 19 · Tailwind v4 · Supabase (Auth, Postgres con RLS, Storage) · Vercel (deploy desde GitHub: `main` = producción, `dev` = vista previa) · Resend (correos) · Groq (asistente de IA "Huellita").

## Comandos
```
npm run dev                  # desarrollo (puerto 3000; el visor usa 3101)
npx tsc --noEmit             # tipos
npx eslint src               # lint (debe quedar sin errores)
npm test                     # pruebas node --test
npm run check:production-config
```
Si `tsc` falla con `.next/types/validator.ts`, borra `.next/types` (caché vieja).

## Dónde está cada cosa
- Rutas en español: `/ingresar /registro /panel /reportar /mascotas /mascotas/[id] /cartel /anuncios /aliados /contacto /casos-de-exito`. Hay redirecciones 301 desde los nombres en inglés (`next.config.ts`).
- `src/components/ui`: base (Button, FormDialog, IconField, Reveal…). `src/components/pet`, `boost`, `contact`, `promo`, `poster`, `home`, `ads`: por área.
- `src/lib`: reglas sin React (`poster.ts`, `featured.ts`, `ads.ts`, `site-config.ts`, `rate-limit.ts`…).
- `supabase/migrations`: esquema versionado. Toda tabla nueva lleva RLS. Se aplican con el MCP de Supabase y se guardan aquí.
- Documentación: `docs/` (índice en `docs/README.md`), `PRODUCT.md` (producto), `DESIGN.md` (diseño).

## Reglas que no se rompen
1. **Honestidad:** nada de cifras, testimonios, personas ni números de contacto inventados. Lo que no está configurado simplemente no se muestra (`src/lib/site-config.ts` lee variables `NEXT_PUBLIC_*`).
2. **Privacidad por defecto:** teléfono, WhatsApp y correo solo se muestran si su dueño los marcó públicos; lo decide SQL (`pet_contact_info`), nunca el navegador.
3. **Sin cobros en línea.** El apoyo es voluntario por Yape/Plin; un administrador verifica y confirma el monto (`pet_boosts`). El orden de destacados lo da la base (`featured_pets`).
4. **Móvil primero**, sin scroll horizontal; probar 375, 768, 1024 y 1280 px.
5. **Seguridad:** `next` de login pasa por `isSafeInternalPath`; formularios públicos llevan campo trampa y límite por IP; archivos subidos se validan por tipo y tamaño.
6. Estilo: tokens de `globals.css` (`bg-primary`, `bg-cta`…), no colores sueltos. Un solo CTA naranja por pantalla.

## Flujo de trabajo
- Se trabaja en `dev` y se fusiona a `main` (sin PR; el push a `main` despliega). Commits en inglés con prefijo (`feat:`, `fix:`, `chore:`).
- **Varias sesiones pueden editar el mismo directorio:** antes de commitear revisa `git status` y añade solo tus archivos.
- Variables de entorno: en Vercel (Settings → Environment Variables). Las `NEXT_PUBLIC_*` se leen al construir: tras cambiarlas hay que redesplegar.

## Pendientes conocidos
Ver la sección "Pendiente" de `docs/ESTADO-DEL-PROYECTO.md` (Facebook login, dominio propio, clave de servicio en Vercel, correo del dominio).
