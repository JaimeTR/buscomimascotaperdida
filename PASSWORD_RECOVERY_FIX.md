# 🔧 FIX: RECUPERACIÓN DE CONTRASEÑA

## ❌ **PROBLEMA IDENTIFICADO**

Cuando haces clic en el enlace de "Reset Password" del email, te redirige a `/login` en lugar de `/update-password`.

---

## 🔍 **CAUSA DEL PROBLEMA**

El problema tiene 2 posibles causas:

### **1. URL de Redirección no configurada en Supabase**

Supabase necesita tener la URL `https://your-production-domain.example/auth/callback` en su lista de URLs permitidas.

### **2. Variable de entorno**

`NEXT_PUBLIC_APP_URL` podría no estar configurada correctamente.

---

## ✅ **SOLUCIÓN**

### **Paso 1: Configurar en Supabase Dashboard**

1. **Ve a:** https://supabase.com/dashboard
2. **Selecciona tu proyecto**
3. **Ve a:** Authentication → URL Configuration
4. **En "Redirect URLs", agrega:**
   ```
   https://your-production-domain.example/auth/callback
   https://your-production-domain.example/update-password
   https://your-production-domain.example/**
   ```
5. **Guarda los cambios**

### **Paso 2: Verificar/Agregar variable de entorno**

Abre tu archivo `.env.local` y asegúrate de tener:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
```

---

##  **MIENTRAS TANTO - WORKAROUND TEMPORAL**

Si el enlace de email te lleva a `/login`, puedes:

1. **Ir manualmente a:** `https://your-production-domain.example/update-password`
2. **Cambiar tu contraseña ahí**
3. **Funciona igual** porque después de hacer clic en el enlace del email, tu sesión queda "authenticated" por un momento

---

## 🧪 **PRUEBA DESPUÉS DEL FIX**

1. Ve a: `https://your-production-domain.example/forgot-password`
2. Ingresa tu email
3. Revisa tu bandeja de entrada
4. Haz clic en "Reset Password"
5. **Ahora debería llevarte a** `/update-password` ✅

---

## 📋 **CHECKLIST**

- [ ] Configurar redirectTo URLs en Supabase Dashboard
- [ ] Verificar NEXT_PUBLIC_APP_URL en .env.local
- [ ] Reiniciar el servidor (`npm run dev`)
- [ ] Probar flujo completo de forgot-password

---

## 🎯 **SI EL PROBLEMA PERSISTE**

Podríamos implementar un sistema alternativo:
1. Detectar en el callback si es password reset
2. Forzar redirección a /update-password
3. Manejar el flujo manualmente

Pero **primero prueba la configuración en Supabase**, debería funcionar.
