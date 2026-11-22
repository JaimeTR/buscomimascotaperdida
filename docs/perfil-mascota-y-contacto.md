# Perfil de la mascota (`/mascotas/[id]`) y privacidad del contacto

## Estructura de la página
Migas y encabezado (nombre, estado, «Caso destacado», zona, hace cuánto) → **galería** → **tarjeta de acción** (a la derecha en escritorio, bajo la galería en móvil) → **Sobre {nombre}** (tipo, raza, género, tamaño, edad, microchip, colores con muestra, señas, personalidad) → **mapa de avistamientos** → **historial** (línea de tiempo) → «Si ves a…» → coincidencias y otras alertas de la zona.

Componentes (`src/components/pet`): `PetGallery` (flechas siempre visibles en táctil, deslizar, contador, miniaturas, foto ampliada), `ContactCard`, `SightingTimeline`. Compartir: `SocialShare variant="button"` (menú nativo del teléfono o panel con WhatsApp/Facebook/X/Copiar).

Casos según contexto: si el reporte es de **quien encontró** la mascota («Encontrado y publicado por…») el texto cambia a «quien la encontró»; si está **reunida** se celebra y se enlaza a casos de éxito; si el visitante es **el dueño** ve su barra («Este es tu reporte»: editar, destacar, datos de contacto) y un aviso si no muestra ningún dato.

## Cómo se decide quién ve qué dato de contacto
| Dónde se elige | Qué controla |
|---|---|
| Perfil → Ajustes (`/panel/ajustes`) | `phone_public`, `whatsapp_public`, `email_public` (todos apagados por defecto): lo que se ve en el reporte del dueño. |
| Al reportar un avistamiento | `share_phone`, `share_whatsapp`, `share_email` por avistamiento (apagados por defecto): lo que se ve en esa tarjeta del historial. |

El filtro es del **servidor**: la función SQL `pet_contact_info(pet)` devuelve el teléfono/WhatsApp/correo solo si la bandera está activa; el navegador nunca recibe el dato si no es público. Si el dueño no muestra nada, la vía es «Reportar avistamiento», que llega a su panel como pista.

Casos externos (importados, con `source_url`): no muestran contacto; enlazan a la fuente y piden crear cuenta a quien sea el dueño real.

## Pendiente
- Mensajería interna entre personas (hoy solo avistamientos y contacto elegido).
- Mostrar el estado del impulso (apoyo) al dueño en esta página.
