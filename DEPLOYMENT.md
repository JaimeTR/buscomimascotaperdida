# 🚀 Guía de Despliegue en Hostinger

Este proyecto es una aplicación Next.js que se puede desplegar en Hostinger usando la opción "App web de Node.js".

## 📋 Requisitos Previos

1. **Plan de Hostinger**: Business, Premium o VPS
2. **Node.js**: Versión 20.9 o superior (requerida por Next.js 16)
3. **Git** (para deployment desde GitHub)

---

## 🎯 Método 1: Desplegar desde GitHub (RECOMENDADO)

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub:
   ```bash
   git add .
   git commit -m "Preparado para producción en Hostinger"
   git push origin main
   ```

### Paso 2: Configurar en Hostinger

1. Ve a tu panel de Hostinger
2. Haz clic en **"+ Añadir sitio web"**
3. Selecciona **"App web de Node.js"**
4. Conecta tu cuenta de GitHub
5. Selecciona el repositorio: `buscomimascotaperdida.com`
6. Configura:
   - **Branch**: `main`
   - **Comando de Build**: `npm ci && npm run build`
   - **Comando de Start**: `npm start`
   - **Puerto**: `3000`
   - **Node Version**: `20` o superior

### Paso 3: Variables de Entorno

En el panel de Hostinger, agrega estas variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-me-with-supabase-anon-key
RESEND_API_KEY=replace-me-with-resend-key
GROQ_API_KEY=replace-me-if-chatbot-is-enabled
SUPABASE_SERVICE_ROLE_KEY=replace-me-server-only
EMAIL_TEST_TOKEN=replace-me-local-test-token
NEXT_PUBLIC_APP_URL=https://tu-dominio-en-hostinger.com
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Reemplaza todos los placeholders en el panel de Hostinger. Nunca subas estas claves al repositorio ni las pegues en esta guía.

`SUPABASE_SERVICE_ROLE_KEY` lo usa solo el servidor (avisos por correo y push, límite de
peticiones del chatbot y el importador administrativo). Nunca debe configurarse como
variable pública ni llegar al navegador. El chatbot (Huellita) usa `GROQ_API_KEY`; sin ella
sigue funcionando con respuestas basadas en los reportes y la base de conocimiento, sin IA.

### Paso 4: Desplegar

Hostinger automáticamente:
1. Clonará el repositorio
2. Instalará las dependencias (`npm ci`)
3. Construirá el proyecto (`npm run build`)
4. Iniciará el servidor (`npm start`)

---

## 🔧 Método 2: Subir Archivos Manualmente

Si prefieres subir los archivos directamente:

### Paso 1: Construir Localmente

```bash
npm ci
npm run build
```

### Paso 2: Archivos a Subir

Sube estos archivos/carpetas a Hostinger:
- `.next/` (carpeta completa)
- `public/`
- `node_modules/` (o instalar en el servidor)
- `package.json`
- `package-lock.json`
- `next.config.ts`

### Paso 3: Instalar Dependencias en el Servidor

Conéctate por SSH a Hostinger:

```bash
cd /path/to/your/app
npm ci --production
```

### Paso 4: Iniciar la Aplicación

Con PM2 (recomendado):
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

O directamente:
```bash
npm start
```

---

## ⚙️ Configuración Post-Despliegue

### 1. Configurar Dominio

En Hostinger:
1. Ve a "Dominios"
2. Apunta tu dominio a la aplicación Node.js
3. Configura SSL/HTTPS (Hostinger lo hace automáticamente)

### 2. Configurar Supabase

En tu proyecto de Supabase:
1. Ve a **Settings > API** y copia la URL y la clave pública anónima en Hostinger.
2. En **Authentication > URL Configuration**, configura la Site URL de producción.
3. Agrega `https://tu-dominio.com/auth/callback` a las Redirect URLs.
4. En **Authentication > Providers > Google**, habilita Google y agrega el Client ID/Secret.
5. En Google Cloud Console, autoriza la URL de callback que muestra Supabase.
6. Ejecuta las migraciones y revisa `supabase/PRODUCTION_CHECKLIST.md`.

### 3. Configurar Email Templates

Si usas Resend:
1. Verifica que tu API key esté en las variables de entorno
2. Agrega tu dominio verificado en Resend

### 4. Rotar credenciales históricas antes de publicar

La revocación y rotación de credenciales históricas requiere acceso externo y no
puede ejecutarse desde este repositorio. Antes del despliegue:

1. Revoca las claves Gemini y Hugging Face que hayan aparecido en commits,
   documentos, logs o copias de seguridad antiguas.
2. Crea nuevas claves con el menor alcance posible y configúralas únicamente en
   los secretos de Supabase.
3. Rota cualquier `SUPABASE_SERVICE_ROLE_KEY`, Resend API key o secreto de
   pruebas que haya estado expuesto; revisa también proveedores y paneles
   externos que acepten esas credenciales.
4. Configura los nuevos valores en Hostinger/Supabase y reinicia o redespliega
   la aplicación para que no conserve procesos con el entorno anterior.
5. Comprueba los logs de auditoría y elimina copias o variables antiguas. No
   registres valores de secretos en Git, tickets, capturas ni mensajes.

### 5. Validar la PWA

La PWA solo almacena recursos públicos y la pantalla offline; no almacena sesiones,
formularios, reportes, mensajes ni respuestas de API. Verifica en un navegador móvil
que `/`, `/offline` y los iconos carguen sin conexión y que las rutas privadas no se
sirvan desde caché.

### 6. Modo de rate limiting del chatbot

La aplicación se despliega actualmente como un único proceso Node.js (`npm start`)
en Hostinger. Por eso el límite del chatbot usa memoria local del proceso y no
requiere una dependencia externa para compartir contadores.

No habilites múltiples instancias, PM2 en modo cluster ni balanceo horizontal
sin sustituir este límite por un rate limiter compartido compatible con HTTP
(por ejemplo, respaldado por Redis o un servicio equivalente). Los contadores
en memoria no se comparten entre procesos y dejarían el límite incompleto.

### 7. Revisar dependencias

Antes de publicar, ejecuta la compuerta local completa desde la raíz del
repositorio. Los comprobadores de configuración y Supabase pueden ejecutarse
sin secretos reales; usa solo placeholders para las variables que esos checks
aceptan:

```bash
npm ci
NODE_ENV=production NEXT_PUBLIC_APP_URL=https://your-production-domain.example \
  node scripts/check-production-config.mjs
node scripts/check-task-5-supabase.mjs
npx eslint . --quiet
npx tsc --noEmit
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-me-with-supabase-anon-key \
NEXT_PUBLIC_APP_URL=https://your-production-domain.example \
  npm run build
npm audit --omit=dev
git diff --check
```

La auditoría de producción debe revisarse por alcance, no solo por su código
de salida. Actualmente `npm audit --omit=dev` sale con código `1` y reporta
cuatro instancias de vulnerabilidad de baja severidad correspondientes al mismo
aviso alcanzable de `deepmerge`; no quedan otros hallazgos de auditoría de
producción. `@react-email/components` usa `@react-email/render`, que usa
`html-to-text@9.0.5`, que alcanza `deepmerge@4.3.1`. El aviso afecta la ruta
de renderizado de plantillas de correo cuando se envían notificaciones. No
hay una corrección publicada para esa cadena: este resultado no cero es una
salvedad de release aceptada y documentada, pendiente de una corrección
upstream. `npm audit fix --force` permanece prohibido porque podría introducir
cambios mayores; registra el aviso y revalídalo cuando los mantenedores
publiquen una actualización, sin forzar una resolución en producción.

---

## 🔍 Verificación

Después del despliegue, verifica:

✅ La página principal carga correctamente
✅ El chatbot funciona
✅ Login/Register funciona
✅ Subir mascota funciona
✅ Búsqueda funciona
✅ Mapa se muestra correctamente
✅ Login con Google redirige al dashboard y no acepta destinos externos
✅ Un usuario Google completa teléfono, departamento y distrito antes de reportar
✅ Rutas privadas y APIs no se entregan desde la caché offline
✅ No quedan credenciales reales en el repositorio

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm ci
npm run build
```

### Error: "Port already in use"
Cambia el puerto en el panel de Hostinger o usa:
```bash
pm2 stop all
pm2 start ecosystem.config.js
```

### Error: "Build failed"
Revisa los logs en el panel de Hostinger y verifica que todas las variables de entorno estén configuradas.

### La página no carga
1. Verifica que el dominio esté apuntando correctamente
2. Revisa los logs del servidor
3. Asegúrate de que el puerto esté abierto

---

## 📊 Monitoreo

Para monitorear tu aplicación en producción:

```bash
# Ver logs en tiempo real
pm2 logs buscomimascotaperdida

# Ver estado de la app
pm2 status

# Reiniciar la app
pm2 restart buscomimascotaperdida
```

---

## 🔄 Actualizaciones

Para actualizar después de cambios en GitHub:

**Con deployment automático**: Hostinger detectará los cambios y redesplegará automáticamente.

**Manual** (SSH):
```bash
cd /path/to/your/app
git pull origin main
npm ci
npm run build
pm2 restart buscomimascotaperdida
```

---

## 🆚 Hostinger vs Vercel

| Característica | Hostinger | Vercel |
|----------------|-----------|--------|
| **Costo** | Desde $2.99/mes | Gratis para hobby |
| **Facilidad** | Media | Muy fácil |
| **Performance** | Buena | Excelente (Edge) |
| **Límites** | Según plan | 100GB bandwidth/mes (free) |
| **Server Actions** | ✅ Sí | ✅ Sí |
| **Supabase** | ✅ Compatible | ✅ Compatible |
| **Control** | Alto (VPS) | Medio |

**Recomendación**: Para proyectos Next.js, **Vercel es ideal** (gratis y optimizado). Usa Hostinger si:
- Ya tienes un plan de Hostinger
- Necesitas alojar múltiples proyectos
- Quieres más control del servidor

## Checklist de salida a producción (nuevas funciones)

Variables en el hosting (además de las de Supabase y `NEXT_PUBLIC_APP_URL`):

| Variable | Para qué | Cómo obtenerla |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Avisos por cercanía y coincidencias (correo y push) | Supabase → Project Settings → API |
| `RESEND_API_KEY` | Correos | Resend, con el dominio verificado |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Alertas push web | `npx web-push generate-vapid-keys`; el subject es `mailto:tu-correo` |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Monitoreo de errores (opcional) | Proyecto Next.js en Sentry |

Pasos únicos:

1. Supabase → Authentication → URL Configuration: Site URL y Redirect URLs de producción. Activar Google OAuth.
2. Resend: verificar el dominio y usar el remitente `notificaciones@tu-dominio`.
3. Darte permisos de admin: `insert into public.admin_users (user_id) values ('<tu user id>');`.
4. Reemplazar los casos de ejemplo (`source_name = 'Ejemplo (demo)'`) cuando haya reportes reales: `delete from public.pets where source_name = 'Ejemplo (demo)';`
5. Publicar y apuntar el dominio; probar el interruptor de notificaciones en Ajustes con una cuenta real.
