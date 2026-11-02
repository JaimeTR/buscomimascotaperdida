# Producto — Busco mi mascota

## Qué es
Una red comunitaria para que las mascotas perdidas vuelvan a casa. Cualquier persona publica un reporte de una mascota perdida o encontrada (fotos, zona, fecha); la comunidad lo ve, lo comparte y reporta avistamientos; el dueño recibe pistas y marca el caso como resuelto. Gratis, en Perú (primero Lima).

## Para quién
- **Quien perdió a su mascota:** angustiado, con prisa, casi siempre desde el celular. Necesita publicar en minutos y que se difunda.
- **Quien vio o encontró una mascota:** quiere ayudar rápido y de forma segura, sin dar datos que no quiere dar.
- **Quien busca por la zona (vecino, voluntario):** explora reportes cercanos, filtra por tipo, raza, color y fecha.
- **Administrador:** modera reportes, ve métricas y auditoría.

## Tareas principales
1. Buscar una mascota por zona, tipo, raza, color y fecha (portada y `/mascotas`).
2. Publicar un reporte con fotos y ubicación (`/reportar`), creando un cartel para difundir (`/cartel`).
3. Reportar un avistamiento de una mascota ajena.
4. Gestionar mis casos y pistas (`/dashboard`).
5. Moderar (`/admin`).

## Tono de voz
Cálido, directo y esperanzador; nunca alarmista ni burocrático. Tuteo, español de Perú. Frases cortas y verbos de acción. Ejemplos: "Publica ahora y activa la red de tu zona", "Todavía nadie ha reportado un avistamiento". Eslogan: *Juntos, de vuelta a casa*.

## Principios
- **Una acción principal por pantalla** (buscar, publicar o iniciar sesión).
- **Honestidad:** nada de cifras, testimonios ni personas inventadas; si no hay datos, estado vacío claro.
- **Privacidad por defecto:** teléfono, WhatsApp y correo solo se muestran si su dueño los marcó públicos.
- **Móvil primero:** la mayoría de las visitas llegan desde un celular y con estrés.
- **Accesible:** contraste AA, teclado completo, estados siempre con texto además del color.

## Fuera de alcance por ahora
App nativa, chat en tiempo real, pagos o recompensas gestionadas por la plataforma, verificación de identidad.

## Éxito
Una persona puede publicar un caso en menos de 5 minutos desde el móvil; un vecino puede encontrar un caso de su zona en menos de 3 toques; los casos se marcan como resueltos.

## Restricciones técnicas
Next.js (SSR) + Supabase (Auth, Postgres con RLS, Storage) + Resend + despliegue en Hostinger. Las notificaciones por cercanía usan una clave de servicio solo en el servidor.
