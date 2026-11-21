# Autenticación

## Flujo
- **Rutas protegidas** (`/dashboard/*`, `/reportar`, `/mascotas/:id/avistamiento`): el proxy (`src/proxy.ts` → `src/utils/supabase/middleware.ts`) redirige a `/login?next=…&reason=report` si no hay sesión. La lista está en `src/lib/auth-guard.ts` (con test).
- **`/login` y `/register` con sesión activa:** redirigen a `next` (validado con `isSafeInternalPath`) o a `/dashboard`.
- **Botón "Reportar":** sin popup; va directo al login con aviso. Tras entrar vuelve a la ruta original.
- **Métodos:** correo + contraseña (mínimo 8), Google y Facebook (`src/components/auth/social-buttons.tsx`, OAuth de Supabase).
- **Registro mínimo:** nombre, correo y contraseña. Teléfono y zona se piden al primer reporte (`complete-profile-dialog.tsx`).
- **Confirmación de correo:** si Supabase la exige, se muestra "Revisa tu correo" con reenvío; el enlace pasa por `/auth/callback?next=…`.
- **Correo ya registrado:** también se detecta cuando Supabase devuelve un usuario sin identidades.
- **Recuperar contraseña:** `/forgot-password` → correo → `/update-password`.

## Persistencia
- La sesión vive en cookie de Supabase, renovada por el proxy.
- `localStorage`: `bmm.email` (solo con "Recordar mi correo"), `bmm.email.off`, `bmm.me` (nombre y foto para el encabezado; se borra al cerrar sesión).

## Perfil desde OAuth
El trigger `handle_new_user` (migración `20261121130000`) toma `full_name`/`name` y `avatar_url`/`picture`.

## Configuración en Supabase (manual)
Authentication → URL Configuration: Site URL y `https://<dominio>/auth/callback` (más localhost). Providers: Google y Facebook (Facebook requiere una app en Meta con los redirect URIs que da Supabase).

## Seguridad
`next` siempre pasa por `isSafeInternalPath`; RLS es la barrera real de datos; no se guarda la contraseña en el navegador; no se usan servicios externos de avatar.
