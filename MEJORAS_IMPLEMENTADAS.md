
# Mejoras de Seguridad y Arquitectura Implementadas

Hemos reestructurado el sistema de autenticación para hacerlo más robusto, seguro y escalable.

## 1. Validación de Datos (Zod)
- Se implementó **Zod** para validar estrictamente todos los datos de entrada tanto en el frontend como en el backend.
- Archivo: `src/lib/schemas/auth.ts`
- **Beneficio**: Previene ataques de inyección y asegura que los datos sean correctos antes de llegar a la base de datos.
- **Validaciones**: Emails válidos, contraseñas seguras, campos obligatorios de ubicación.

## 2. Server Actions (Next.js 14+)
- Se movió la lógica de registro y login a **Server Actions**.
- Archivo: `src/app/auth/actions.ts`
- **Beneficio**: La lógica sensible se ejecuta en el servidor, no en el navegador del usuario. Mejora la seguridad y reduce el código enviado al cliente.

## 3. Componentes Modulares
- Se separó la página de Login/Registro en componentes pequeños y manejables.
- `src/components/auth/login-form.tsx`: Login simplificado.
- `src/components/auth/register-form.tsx`: Registro con validación en tiempo real y manejo de errores campo por campo.

## 4. Sistema de Emails (Preparado)
- Se creó una estructura para enviar correos transaccionales bonitos usando **React Email**.
- Archivo de Template: `src/emails/welcome-template.tsx` (Diseño moderno y responsive).
- Servicio Mock: `src/lib/email.ts` (Listo para conectar con Resend).

---

# Próximos Pasos Recomendados

## 1. Instalar Dependencias de Email
Para activar el envío real de correos, ejecuta:
```bash
npm install resend @react-email/components @react-email/render
```

## 2. Configurar Resend
1. Crea una cuenta en [Resend.com](https://resend.com).
2. Obtén tu API KEY.
3. Agrégala a tu archivo `.env.local`:
   ```bash
   RESEND_API_KEY=your_resend_api_key
   ```
4. Descomenta el código en `src/lib/email.ts`.

## 3. Alertas por Geolocalización
Para enviar alertas a usuarios cercanos cuando se pierde una mascota:
1. Necesitamos una función de base de datos (PostGIS sería ideal, pero podemos usar latitud/longitud simple) para encontrar usuarios en un radio de X km.
2. Crear un disparador (Database Webhook) o una Server Action que llame a `sendAlertEmail` con la lista de usuarios encontrados.

## 4. Verificar RLS (Row Level Security)
Asegúrate de ejecutar este SQL en Supabase para proteger tus tablas:

```sql
-- Permitir insertar mascotas solo a usuarios autenticados
create policy "Users can create pets" 
on public.pets for insert 
to authenticated 
with check (auth.uid() = owner_id);

-- Permitir editar sus propias mascotas
create policy "Users can update own pets" 
on public.pets for update
to authenticated 
using (auth.uid() = owner_id);
```
