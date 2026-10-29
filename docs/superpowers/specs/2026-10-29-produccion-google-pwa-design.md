# Diseño: preparación para producción, Google OAuth y PWA

## Objetivo

Dejar `buscomimascotaperdida.com` preparado para desplegarse en Hostinger como una aplicación Next.js SSR, manteniendo Supabase como plataforma de autenticación, base de datos y almacenamiento. El trabajo incluye integrar Google OAuth, corregir fallos de calidad, reforzar seguridad, actualizar dependencias compatibles y mejorar la experiencia PWA móvil.

## Alcance aprobado

- Integrar inicio de sesión con Google mediante el proveedor OAuth de Supabase.
- Mantener correo/contraseña, confirmación de correo y recuperación de contraseña.
- Permitir acceso inmediato a usuarios autenticados con Google.
- Solicitar teléfono, departamento y distrito únicamente cuando un usuario intente crear un reporte y esos datos sean necesarios.
- Revisar y corregir seguridad de autenticación, rutas privadas, APIs, redirecciones, RLS, almacenamiento y variables de entorno.
- Retirar secretos expuestos de la documentación y recomendar su rotación antes de producción.
- Actualizar dependencias solo cuando sean compatibles con la aplicación actual.
- Corregir errores de ESLint, TypeScript y advertencias relevantes de Next.js.
- Mejorar instalación PWA, modo offline seguro, rendimiento móvil y accesibilidad.
- Preparar documentación y checklist de despliegue para Hostinger, Supabase, Google Cloud y Resend.

## Fuera de alcance de esta fase

- Notificaciones push: requieren seleccionar proveedor, gestionar permisos y definir el modelo de suscripciones.
- Migración a Vercel, otro framework o un backend distinto.
- Rediseño completo de la interfaz o cambios funcionales no relacionados con producción, autenticación, PWA, rendimiento y accesibilidad.
- Gestión automática de credenciales en paneles externos: se documentarán los pasos manuales necesarios.

## Arquitectura

La aplicación conservará esta distribución:

- **Frontend y servidor:** Next.js con App Router y renderizado SSR.
- **Autenticación:** Supabase Auth con correo/contraseña y Google OAuth.
- **Datos y seguridad:** Supabase Postgres con RLS y migraciones versionadas.
- **Archivos:** Supabase Storage con políticas de acceso revisadas.
- **Correo:** Resend en rutas y servicios del servidor.
- **Despliegue:** Hostinger Node.js o PM2, según el plan disponible.

No se convertirá la aplicación a exportación estática porque utiliza Server Actions, rutas API, sesiones SSR, subida de imágenes y servicios del servidor.

## Flujo de autenticación

1. El usuario pulsa `Continuar con Google`.
2. El cliente inicia `signInWithOAuth` con Supabase y `redirectTo` apuntando a `/auth/callback`.
3. Google devuelve el código al callback.
4. El servidor intercambia el código por una sesión usando Supabase.
5. El callback valida que el destino solicitado sea una ruta interna segura.
6. El usuario accede al panel sin bloquearse por datos de perfil incompletos.
7. El flujo de creación de reportes comprueba los datos mínimos y solicita completar teléfono, departamento y distrito cuando falten.

El parámetro de navegación posterior no podrá convertirse en una redirección abierta. Los destinos válidos serán rutas relativas internas o un destino predeterminado seguro.

## Seguridad

- Las variables privadas permanecerán fuera del repositorio y no se copiarán a documentación.
- La credencial expuesta en documentación debe revocarse y regenerarse antes de publicar.
- Se validarán las variables obligatorias al iniciar operaciones dependientes de ellas.
- Las Server Actions y rutas API validarán payloads con los esquemas existentes o nuevos esquemas Zod.
- Las operaciones de modificación comprobarán sesión y propiedad del recurso.
- Se revisarán políticas RLS de perfiles, mascotas, avistamientos, mensajes, notificaciones y almacenamiento.
- Se limitará o eliminará cualquier endpoint de prueba que no deba existir en producción.
- Se revisarán nombres de rutas, URLs de reportes, cookies, encabezados y errores para evitar fuga de información.
- No se almacenará información privada del panel en el caché offline.

## PWA, rendimiento y accesibilidad

- Mantener manifest e instalación PWA con metadatos compatibles con Next.js actual.
- Controlar el ciclo de vida del service worker para evitar servir versiones obsoletas indefinidamente.
- Permitir offline únicamente para recursos y pantalla informativa pública.
- Excluir del caché panel, autenticación, mensajes, reportes personalizados y respuestas privadas.
- Optimizar imágenes, diferir mapas y cargar componentes pesados solo cuando sean necesarios.
- Revisar foco, navegación por teclado, etiquetas accesibles, contraste, estados de carga y mensajes de error.
- Validar la experiencia en viewport móvil y escritorio.

## Actualización tecnológica

Se revisará `package.json` y el lockfile para identificar versiones obsoletas, vulnerabilidades y cambios incompatibles. Se actualizará de forma conservadora, agrupando solo cambios que puedan validarse con lint, TypeScript, build y pruebas funcionales. No se introducirán dependencias nuevas salvo que resuelvan una necesidad concreta del alcance.

## Correcciones de calidad

- Resolver los errores de ESLint del código de aplicación y scripts relevantes.
- Revisar usos de `any`, errores silenciosos y logs que puedan revelar datos sensibles.
- Ajustar metadatos `viewport` y `themeColor` al API recomendado por Next.js.
- Evaluar la migración de la convención `middleware` a `proxy` si la versión instalada lo exige y el cambio conserva el refresco de sesión.
- Corregir rutas o enlaces inconsistentes detectados durante las pruebas.
- Mantener el comportamiento existente fuera de los cambios aprobados.

## Validación

### Automatizada

- `npm run lint`
- comprobación TypeScript mediante `npm run build`
- `npm run build`
- `npm start` y comprobación de respuesta HTTP en modo producción
- auditoría de dependencias disponible en el ecosistema actual

### Funcional

- página pública y navegación principal
- registro, confirmación y login por correo
- login y callback con Google
- recuperación y actualización de contraseña
- acceso al panel y cierre de sesión
- creación, edición, eliminación y consulta de reportes
- subida y visualización de imágenes
- avistamientos, mapas y contacto
- chatbot, notificaciones y correo
- instalación PWA, offline y actualización del service worker
- revisión de consola, errores HTTP, cookies y redirecciones

## Despliegue en Hostinger

La guía final documentará:

1. Requisitos de Node.js y configuración de la aplicación.
2. `npm ci`, `npm run build` y `npm start` o PM2.
3. Variables de entorno requeridas, sin valores reales.
4. Configuración de dominio y HTTPS.
5. Site URL y Redirect URLs en Supabase.
6. Cliente OAuth, pantalla de consentimiento y Redirect URI en Google Cloud.
7. Dominio remitente y API key en Resend.
8. Ejecución de migraciones y revisión de políticas RLS.
9. Smoke test posterior al despliegue.
10. Procedimiento de rollback y rotación de secretos.

## Criterios de finalización

La fase se considera lista cuando:

- el build de producción termina sin errores;
- el lint no tiene errores;
- no hay secretos en el repositorio ni en documentación;
- Google OAuth funciona con las URLs de producción configuradas;
- los flujos críticos funcionan en navegador móvil y escritorio;
- las rutas privadas y APIs rechazan accesos no autorizados;
- el modo offline no expone datos privados;
- la documentación de Hostinger identifica claramente los pasos manuales restantes;
- cualquier bloqueo externo queda listado como requisito de publicación, no oculto como una tarea completada.
