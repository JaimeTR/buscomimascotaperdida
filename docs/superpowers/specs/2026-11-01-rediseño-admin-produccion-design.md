# Rediseño de confianza comunitaria y administración de producción

## Contexto

Busco Mi Mascota es una aplicación Next.js con Supabase para publicar, buscar y
dar seguimiento a reportes de mascotas perdidas o encontradas. La base técnica
ya contiene autenticación, Google OAuth, reportes, mapas, almacenamiento de
imágenes, mensajería, chatbot y un dashboard inicial, pero necesita una
experiencia visual coherente, un panel administrativo seguro y una última fase
de calidad antes de publicar.

La dirección visual aprobada es **Confianza comunitaria**: conservar la
identidad actual y modernizarla con una interfaz cálida, clara, accesible y
orientada a la acción.

## Objetivos

1. Hacer que una persona pueda buscar o publicar un reporte sin confusión.
2. Dar a cada reportante un espacio claro para gestionar sus casos y mensajes.
3. Dar a administradores autorizados herramientas de moderación y métricas sin
   exponer datos a usuarios normales.
4. Consolidar una identidad visual consistente entre portada, búsqueda,
   autenticación, reportes, dashboard y administración.
5. Corregir warnings relevantes, conservar type safety y dejar un proceso
   reproducible de validación y despliegue.
6. Completar la preparación de producción sin copiar secretos al repositorio ni
   ejecutar migraciones remotas sin confirmación.

## Fuera de alcance inicial

- Aplicación móvil nativa.
- Chat en tiempo real completo entre todos los usuarios.
- Pagos, recompensas gestionadas por la plataforma o verificación de identidad.
- Reescritura total de Next.js, Supabase o el modelo existente.
- Exportación estática: la aplicación seguirá usando SSR, APIs, sesiones y
  servicios server-side.

## Arquitectura de superficies

### 1. Web pública

Rutas públicas principales:

- `/`: portada con búsqueda protagonista, CTA para reportar, confianza,
  estadísticas reales y casos recientes.
- `/mascotas`: búsqueda con filtros, resultados accesibles y mapa.
- `/mascotas/[id]`: detalle del reporte con estado, ubicación aproximada,
  contacto seguro y acciones de compartir.
- `/reportar`: flujo guiado para crear reporte, subir imágenes y completar
  datos mínimos.
- `/login`, `/register`, recuperación de contraseña y Google OAuth.
- `/privacidad`, `/terminos`, `/contacto` y `/offline`.

La portada debe priorizar una acción principal por sección: buscar, reportar o
iniciar sesión. Los enlaces placeholder `/#` se eliminarán o se sustituirán por
rutas reales.

### 2. Dashboard de reportantes

Rutas protegidas bajo `/dashboard`:

- Resumen con casos activos, encontrados, pendientes y mensajes no leídos.
- Mis reportes con filtros por estado.
- Crear, editar, pausar, marcar como encontrado y cerrar un reporte propio.
- Detalle de actividad y mensajes relacionados con cada reporte.
- Configuración de perfil y datos de contacto.

El dashboard conservará el lenguaje cálido de la portada, pero con una
estructura operativa: navegación lateral en escritorio, navegación compacta en
móvil, tarjetas de resumen, tablas/listas con estados y acciones explícitas.

### 3. Panel administrativo

Rutas protegidas bajo `/admin`:

- `/admin`: métricas generales y alertas de moderación.
- `/admin/reports`: listado paginado y filtrable de reportes.
- `/admin/reports/[id]`: revisión, cambio de estado, ocultamiento y eliminación
  con confirmación.
- `/admin/users`: listado mínimo de usuarios, estado de cuenta y rol.
- `/admin/analytics`: tendencias de reportes, zonas y resoluciones.
- `/admin/settings`: solo si se necesita configurar parámetros no sensibles.

El panel no se mostrará en la navegación pública para usuarios normales. El
servidor verificará el rol antes de renderizar o mutar datos; la interfaz nunca
será la única barrera.

## Autorización y seguridad

### Roles

Se usará un rol `admin` gestionado en Supabase, separado del perfil público.
La implementación preferida es una tabla de roles o `app_metadata` respaldada
por funciones/políticas RLS. El cliente no podrá elevar su propio rol.

Reglas mínimas:

- Usuarios normales solo leen reportes públicos según su estado y modifican
  recursos propios.
- Reportantes solo acceden a sus mensajes y reportes mediante ownership.
- Administradores autorizados pueden moderar reportes y gestionar usuarios.
- Las operaciones destructivas requieren confirmación, autorización server-side,
  registro de auditoría y respuesta genérica ante errores.
- Las claves service-role nunca llegan al navegador.
- El rate limiting debe ser compatible con el número real de procesos de
  Hostinger; si se ejecuta más de una instancia, se requiere un store
  compartido o una configuración explícita de instancia única.

### Datos personales

Se minimizarán teléfono, ubicación y mensajes al propósito de recuperación.
Las respuestas públicas no deben incluir campos privados innecesarios. Se
documentarán retención, eliminación de cuenta y eliminación de reportes,
incluyendo almacenamiento de imágenes y copias operativas cuando aplique.

### IA y servicios externos

Los mensajes del chatbot tendrán límites de tamaño y frecuencia. Toda salida
del modelo se tratará como dato no confiable y se validará con esquema antes de
usarse para filtros o respuestas. Las claves de proveedores se leerán solo
desde variables de entorno. CORS se limitará al origen configurado y los
errores no revelarán detalles internos.

## Sistema visual

La modernización mantendrá la identidad existente y aplicará:

- Teal como color de confianza y superficies principales.
- Crema/blanco para fondos y lectura cómoda.
- Naranja reservado para CTA y estados que requieren atención.
- Tipografía redondeada y legible, con jerarquía clara.
- Tarjetas con bordes suaves y sombras discretas, sin exceso de decoración.
- Estados de reporte consistentes: perdido, encontrado, en contacto, pausado,
  pendiente de revisión y cerrado.
- Focus visible, navegación completa por teclado, contraste mínimo WCAG AA y
  soporte para `prefers-reduced-motion`.
- Diseño responsive validado en 375, 768, 1024 y 1440 píxeles.

Se reutilizarán componentes y tokens existentes antes de introducir nuevos
componentes o dependencias.

## Modelo de datos y migraciones

Antes de ejecutar cambios remotos se inspeccionará el esquema actual y el
proyecto Supabase objetivo. Las migraciones nuevas serán versionadas y no
editarán migraciones ya aplicadas.

Cambios esperados:

- Rol administrativo y función/política segura para comprobarlo.
- Auditoría mínima de acciones administrativas.
- Índices para filtros de reportes, estados, propietario y fechas.
- Revisión de RLS para reportes, mensajes, perfiles y Storage.
- Paginación server-side para listados administrativos.

La migración se probará primero con placeholders/local y luego en el proyecto
remoto confirmado por el usuario.

## Calidad y warnings

La limpieza de ESLint se hará por impacto y archivo:

1. Errores de lint, type errors y warnings que indiquen bugs o dependencias
   incorrectas de hooks.
2. Imports, variables y ramas muertas que puedan eliminarse con seguridad.
3. Warnings de imágenes, accesibilidad y rendimiento.
4. Refactors pequeños solo cuando reduzcan complejidad o eviten duplicación.

No se silenciarán reglas globalmente ni se añadirán `eslint-disable` sin una
justificación local. Cada cambio deberá conservar `npm run build`,
`npx tsc --noEmit`, validaciones de producción y `git diff --check`.

## Fases de implementación

### Fase 0: saneamiento y seguridad

- Revisar los seis archivos modificados del worktree.
- Rotar/revocar credenciales históricas expuestas.
- Corregir warnings críticos y confirmar que no quedan secretos en el código.
- Confirmar dependencias y auditoría sin usar `npm audit fix --force`.

### Fase 1: fundación visual

- Definir tokens de color, tipografía, espaciado, estados y componentes.
- Modernizar layout, navegación, footer, formularios, botones, tarjetas y
  estados vacíos.
- Eliminar enlaces placeholder y mejorar accesibilidad.

### Fase 2: experiencia pública

- Rediseñar portada, búsqueda, detalle y flujo de reportar.
- Mejorar filtros, mapa, carga, errores y compartir.
- Validar móvil y escritorio en navegador.

### Fase 3: dashboard de reportantes

- Crear resumen operativo.
- Organizar mis reportes, mensajes, perfil y acciones de estado.
- Mantener ownership y RLS en cada operación.

### Fase 4: administración

- Añadir rol, políticas, guard server-side y navegación admin.
- Implementar reportes, moderación, usuarios, métricas y auditoría.
- Añadir paginación, filtros, confirmaciones y estados de error.

### Fase 5: conexión y despliegue

- Configurar Supabase real, Google OAuth, Resend y proveedores AI sin compartir
  secretos por chat.
- Ejecutar migraciones aprobadas.
- Probar login, RLS, Storage, email, chatbot y recuperación de contraseña.
- Preparar Hostinger, dominio, HTTPS, variables y rollback.

## Criterios de aceptación

- La portada comunica claramente buscar y reportar en los primeros segundos.
- Un usuario móvil puede buscar y crear un reporte sin perderse.
- Un reportante ve solo sus reportes y puede seguir su estado.
- Un usuario sin rol admin no puede abrir ni invocar operaciones de `/admin`.
- Un administrador puede revisar, moderar y consultar métricas con auditoría.
- Todas las mutaciones protegidas tienen validación server-side y RLS.
- No existen secretos en el código ni en documentación.
- `npx eslint . --quiet`, `npx tsc --noEmit`, `npm run build`,
  checks de producción y `git diff --check` pasan.
- La auditoría de dependencias queda documentada y sin vulnerabilidades
  críticas/altas alcanzables sin una decisión explícita.
- La aplicación se prueba en 375, 768, 1024 y 1440 píxeles y no presenta
  errores de consola bloqueantes.

## Decisiones aprobadas

- Dirección visual: **Confianza comunitaria**.
- Identidad: conservar logo y base de marca; modernizar colores, composición,
  tipografía y componentes.
- Administración: rol `admin` en Supabase con RLS.
- Capacidades admin: consultar métricas, revisar reportes, editar estados,
  ocultar/eliminar reportes y gestionar usuarios.
- Arquitectura: Next.js SSR + Supabase Auth/Postgres/Storage/RLS + Resend,
  desplegado en Hostinger.
