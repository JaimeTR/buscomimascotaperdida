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
HUGGINGFACE_API_KEY=replace-me-if-chatbot-is-enabled
GEMINI_API_KEY=replace-me-if-chatbot-is-enabled
ALLOWED_ORIGIN=https://tu-dominio-en-hostinger.com
EMAIL_TEST_TOKEN=replace-me-local-test-token
NEXT_PUBLIC_APP_URL=https://tu-dominio-en-hostinger.com
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Reemplaza todos los placeholders en el panel de Hostinger. Nunca subas estas claves al repositorio ni las pegues en esta guía.

Las claves `GEMINI_API_KEY`, `HUGGINGFACE_API_KEY` y `ALLOWED_ORIGIN` de la
Edge Function deben configurarse como secretos de Supabase. `SUPABASE_SERVICE_ROLE_KEY`
solo se usa localmente para el importador administrativo y nunca debe configurarse
como variable pública ni en el navegador.

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

### 6. Revisar dependencias

Antes de publicar, ejecuta `npm ci`, `npm run lint`, `npx tsc --noEmit`,
`npm run build` y `npm audit --omit=dev`. La auditoría actual no reporta
vulnerabilidades críticas, altas ni moderadas en producción; permanecen avisos
de bajo impacto en la cadena de plantillas de correo (`@react-email`/`deepmerge`)
sin una corrección disponible. No uses `npm audit fix --force` en producción
sin revisar los cambios mayores.

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
