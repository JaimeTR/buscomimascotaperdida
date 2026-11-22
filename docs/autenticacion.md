# Autenticación

## Flujo
- **Rutas protegidas** (`/panel/*`, `/reportar`, `/mascotas/:id/avistamiento`): el proxy (`src/proxy.ts` → `src/utils/supabase/middleware.ts`) redirige a `/ingresar?next=…&reason=report` si no hay sesión. La lista está en `src/lib/auth-guard.ts` (con test).
- **`/ingresar` y `/registro` con sesión activa:** redirigen a `next` (validado con `isSafeInternalPath`) o a `/panel`.
- **Botón "Reportar":** sin popup; va directo al login con aviso. Tras entrar vuelve a la ruta original.
- **Métodos:** correo + contraseña (mínimo 8) y Google (`src/components/auth/social-buttons.tsx`, OAuth de Supabase). **Facebook está oculto** (`FACEBOOK_ENABLED = false`) hasta crear la app de Meta; ver «Configuración». Los campos llevan icono (correo, contraseña, nombre).
- **Registro mínimo:** nombre, correo y contraseña. Teléfono y zona se piden al primer reporte (`complete-profile-dialog.tsx`).
- **Confirmación de correo:** si Supabase la exige, se muestra "Revisa tu correo" con reenvío; el enlace pasa por `/auth/callback?next=…`.
- **Correo ya registrado:** también se detecta cuando Supabase devuelve un usuario sin identidades.
- **Recuperar contraseña:** `/recuperar-contrasena` → correo → `/nueva-contrasena`.

## Persistencia
- La sesión vive en cookie de Supabase, renovada por el proxy.
- `localStorage`: `bmm.email` (solo con "Recordar mi correo"), `bmm.email.off`, `bmm.me` (nombre y foto para el encabezado; se borra al cerrar sesión).

## Perfil desde OAuth
El trigger `handle_new_user` (migración `20261121130000`) toma `full_name`/`name` y `avatar_url`/`picture`.

## Configuración en Supabase (manual)
Authentication → URL Configuration: Site URL `https://buscomimascotaperdida.vercel.app` (luego el dominio propio), Redirect URLs con `/**` de producción y `http://localhost:3000/**`. Providers: **Google** activo (cliente OAuth en Google Cloud con el callback `https://<proyecto>.supabase.co/auth/v1/callback`, app publicada en producción: cualquier cuenta de Google puede entrar). **Facebook:** pendiente, requiere una app en Meta con ese mismo callback; luego activar el proveedor en Supabase y `FACEBOOK_ENABLED = true`.

## Seguridad
`next` siempre pasa por `isSafeInternalPath`; RLS es la barrera real de datos; no se guarda la contraseña en el navegador; no se usan servicios externos de avatar.
