# 🚀 Guía de Despliegue en Hostinger

Este proyecto es una aplicación Next.js que se puede desplegar en Hostinger usando la opción "App web de Node.js".

## 📋 Requisitos Previos

1. **Plan de Hostinger**: Business, Premium o VPS
2. **Node.js**: Versión 18.18 o superior
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
   - **Node Version**: `18` o superior

### Paso 3: Variables de Entorno

En el panel de Hostinger, agrega estas variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qiiwqphdhpzkrjhrxsce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://tu-dominio-en-hostinger.com
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Reemplaza `tu-dominio-en-hostinger.com` con tu dominio real.

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
1. Ve a **Settings > API**
2. Agrega tu dominio de Hostinger a las **Site URLs permitidas**
3. Configura **Redirect URLs**: `https://tu-dominio.com/auth/callback`

### 3. Configurar Email Templates

Si usas Resend:
1. Verifica que tu API key esté en las variables de entorno
2. Agrega tu dominio verificado en Resend

---

## 🔍 Verificación

Después del despliegue, verifica:

✅ La página principal carga correctamente
✅ El chatbot funciona
✅ Login/Register funciona
✅ Subir mascota funciona
✅ Búsqueda funciona
✅ Mapa se muestra correctamente

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
