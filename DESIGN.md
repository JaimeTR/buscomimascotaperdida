# Sistema de diseño — Busco mi mascota (web)

Fuente de verdad para rediseñar la web. La identidad (logo, versiones, reglas) está en `docs/marca.md`. El producto y el tono están en `PRODUCT.md`. Dirección: **Confianza comunitaria** — cálida, clara, accesible y orientada a la acción.

## 1. Principios
1. **Una acción principal por sección.** El naranja se reserva para un solo CTA por pantalla; el teal es el color de todo lo demás.
2. **Crema para leer, blanco para tarjetas.** El fondo es crema, las superficies elevadas (tarjetas, formularios) son blancas con borde fino.
3. **El estado siempre dice su nombre** (texto + color), nunca solo color.
4. **Móvil primero.** Se diseña a 375 px y se amplía; objetivos táctiles de 44 px.
5. **Honestidad.** Sin cifras, testimonios ni personas inventados; estados vacíos claros.

## 2. Color

### Tokens de la web (`src/app/globals.css`, ya alineados con el logo)
| Token | Hex | Uso |
|---|---|---|
| `background` | `#faf8f3` | Fondo de página |
| `foreground` | `#0b2b2a` | Texto principal |
| `card` / `popover` | `#ffffff` | Tarjetas, formularios, menús |
| `primary` / `ring` | `#0f766e` | Botón principal, enlaces, foco |
| `primary-foreground` | `#ffffff` | Texto sobre primario |
| `secondary` / `muted` | `#f3efe8` | Superficies suaves, filas alternas |
| `muted-foreground` | `#3d5655` | Texto secundario |
| `accent` | `#e2f3f1` | Hover y selección suave (tinte del teal) |
| `accent-foreground` | `#0c5a54` | Texto sobre acento |
| `cta` | `#c2410c` | **El** botón de acción de la pantalla |
| `success` | `#1d724a` | Encontrado, confirmaciones |
| `warning` | `#935f06` | En revisión |
| `destructive` | `#b81e1e` | Errores, eliminar |
| `border` | `#e2ded4` | Bordes y divisores |
| `input` | `#d4cfc4` | Borde de campos |

### Escalas (valores de Tailwind; ya disponibles como `teal-*` y `orange-*`)
- **Teal:** 50 `#f0fdfa` · 100 `#ccfbf1` · 200 `#99f6e4` · 300 `#5eead4` · 400 `#2dd4bf` · 500 `#14b8a6` · 600 `#0d9488` · **700 `#0f766e`** · 800 `#115e59` · 900 `#134e4a` · 950 `#042f2e`
- **Naranja:** 50 `#fff7ed` · 100 `#ffedd5` · 200 `#fed7aa` · **300 `#fdba74`** · 400 `#fb923c` · 500 `#f97316` · 600 `#ea580c` · **700 `#c2410c`** · 800 `#9a3412` · 900 `#7c2d12`
- **Neutros cálidos:** crema `#faf8f3`, `#f3efe8`, borde `#e2ded4`, tinta `#0b2b2a`, gris teal `#3d5655`.

### Reglas
- En componentes nuevos usar tokens (`bg-primary`, `text-muted-foreground`, `bg-cta`), no hex ni `teal-*` sueltos. Los `stone-*` y `teal-*` que quedan en páginas antiguas se migran al rediseñar cada página.
- Texto sobre teal: blanco o crema. Texto sobre naranja: blanco. Naranja claro `#fdba74` solo sobre teal y solo en texto grande.
- Contraste mínimo AA (4.5:1 texto, 3:1 texto grande y componentes). Los pares de la paleta y sus ratios están en `docs/marca.md`.
- Modo oscuro: no se incluye en esta fase. Si se añade: fondo `#0b2b2a`, tarjetas `#123836`, primario `#2dd4bf`, CTA `#fb923c`, texto `#faf8f3`.

### Estados de reporte (`StatusBadge`)
| Estado | Texto | Color |
|---|---|---|
| lost | Perdido | naranja (fondo `cta`, texto blanco) |
| found | Encontrado | éxito |
| in_contact | En contacto | teal |
| reunited | Reunido | tinte teal con borde |
| pending | En revisión | alerta |
| paused / closed | Pausado / Cerrado | gris suave con borde |

## 3. Tipografía
| Rol | Fuente | Estilo |
|---|---|---|
| **Display y títulos** | **Outfit** 600 | Sentence case (nunca todo en mayúsculas), interletraje -0.01em, como las referencias. Nunca en párrafos ni botones. |
| **Interfaz y texto** | **Poppins** | 400 texto, 500 etiquetas y navegación, 600 títulos y botones, 700 énfasis. |
| Reserva | `system-ui, sans-serif` | Mientras carga la fuente |

### Escala
| Nivel | Fuente | Tamaño (móvil → escritorio) | Interlínea |
|---|---|---|---|
| Display (hero) | Outfit | 36 → 64 px | 1.05 |
| H1 de página | Outfit | 28 → 44 px | 1.1 |
| H2 de sección | Poppins 600 | 24 → 32 px | 1.2 |
| H3 | Poppins 600 | 18 → 22 px | 1.3 |
| Texto | Poppins 400 | 16 px | 1.6 |
| Texto grande (introducción) | Poppins 400 | 18 → 20 px | 1.6 |
| Texto pequeño | Poppins 400 | 14 px | 1.5 |
| Etiqueta / pie | Poppins 500 | 12–13 px | 1.4 |
| Botón | Poppins 600 | 15–16 px | 1 |

Ancho de línea máximo del texto: 65–70 caracteres.

### Entrega de las fuentes
- **Poppins:** `next/font/google` con los pesos 400, 500, 600 y 700 (`display: "swap"`), reemplaza a Outfit.
- **Outfit:** `next/font/google`, pesos 500 y 600, solo para títulos.

## 4. Espacio y retícula
- Unidad base 4 px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Contenedor máximo 1200 px; márgenes laterales 16 px (móvil), 24 px (tablet), 32 px (escritorio).
- Ritmo de secciones: 64 px en móvil, 96 px en escritorio. Dentro de una tarjeta: 16–24 px.
- Puntos de corte a validar: **375, 768, 1024 y 1440 px**. Sin scroll horizontal en ninguno.
- Tarjetas de mascotas: 1 columna (móvil), 2 (≥640), 3–4 (≥1024), proporción de foto 4:3.

## 5. Forma y elevación
- Radios: 8 px (campos pequeños) · 12 px `--radius` (botones, campos) · 16 px (tarjetas) · 24 px (paneles grandes) · totalmente redondo (pastillas, CTA).
- Bordes de 1 px `#e2ded4`. Sin sombras por defecto; solo al pasar el cursor o en menús: `0 6px 20px -6px rgb(11 43 42 / 0.14)`.

## 6. Componentes
- **Botón primario:** fondo teal, texto blanco, hover teal profundo `#115e59`, alto 44 px, radio 12 px. **Botón CTA:** fondo naranja, texto blanco, pastilla; uno por pantalla (Reportar una mascota). Secundario: borde teal, fondo transparente. Fantasma: sin borde, hover `accent`. Destructivo: `destructive`.
- **Foco:** anillo de 2 px teal con 2 px de separación, en todo elemento interactivo.
- **Campos:** alto 44 px, borde `input`, etiqueta siempre visible, error en rojo con texto y ícono, nunca solo el color.
- **Tarjeta de mascota:** foto 4:3, `StatusBadge` arriba a la izquierda, nombre en Poppins 600, raza y zona en gris teal, un solo enlace. Fotos con `alt` descriptivo.
- **Navegación:** logotipo/símbolo a la izquierda, 4 enlaces, CTA naranja y acceso a la cuenta. En móvil, menú desplegable con el CTA ancho.
- **Pie:** símbolo + isologo horizontal, enlaces reales (nada de `#`), privacidad y términos.
- **Estados vacíos:** ícono suave, titular claro, frase de ayuda y un botón con la acción útil.
- **Avisos (toast):** esquina inferior, texto + ícono, desaparecen a los 5 s y se pueden cerrar con el teclado.
- **Íconos:** Lucide, trazo 1.75 px, tamaño 16/20/24 px, decorativos con `aria-hidden`.

## 7. Movimiento
Respuesta visible a cada acción, siempre breve (150–300 ms, `ease-out`), solo transformaciones, sombra y opacidad.
- **Botones** (`ui/button.tsx`): al pasar el cursor suben 2 px con sombra; al presionar se hunden (`active:scale-[0.97]`). Sus **iconos** se agrandan y giran un poco (excepto los que giran solos, `animate-spin`). Por eso los botones principales llevan icono.
- **Contenedores:** clase `hover-lift` (`globals.css`): se elevan 4 px con la sombra `--shadow-lift`, se hunden al presionar y sus iconos reaccionan. **Imágenes:** `img-zoom` (acercamiento suave dentro de un contenedor con `overflow-hidden` y `group`).
- **Campos con icono** (`IconField`): el icono se tiñe y crece con el foco. Chips y opciones elevan 2 px al pasar el cursor.
- **Entradas:** cada página aparece con un fundido corto (`app/template.tsx`, `.page-enter`); las secciones con `Reveal` al llegar al scroll. **Modales y hojas** (`<dialog>`) entran y salen con transición (opacidad + desplazamiento; el fondo oscurece). Popovers y avisos usan `animate-in`.
- **`prefers-reduced-motion`:** se anulan las animaciones largas (entradas, fundidos) y el scroll suave; **se conservan las respuestas cortas de hover/clic**, porque son retroalimentación y no decoración.
- Nada de animaciones decorativas en bucle.

## 8. Imagen e ilustración
- Fotografía real de mascotas, recortada 4:3, con `alt`. Sin fotos de stock inventadas ni casos falsos.
- Ilustración: siluetas planas de perro y gato con el símbolo de la marca; sin degradados ni 3D.

## 9. Uso del logo en la web
- Cabecera de escritorio: isologo horizontal (≥ 140 px de ancho). Cabecera móvil: símbolo + `BUSCO MI MASCOTA` o solo el símbolo.
- Favicon e íconos: `public/logo_symbol.svg`, `src/app/icon.svg`, `public/icons/*`. Imagen social: `public/og.png`.
- Sobre fotos: versión `claro` sobre capa teal sólida o `blanco`/`negro` según el fondo.

## 10. Accesibilidad
Contraste AA, teclado completo, orden de foco lógico, `aria-current` en la navegación, `aria-label` en todo botón de solo ícono, un solo `<h1>` por página, etiquetas de formulario, errores anunciados (`role="alert"`), `alt` real en las imágenes y objetivos táctiles de 44 px.

## 11. Guía de rediseño por página
| Página | Objetivo | Cambios clave |
|---|---|---|
| `/` | Buscar o publicar en segundos | Hero con `Display` en Outfit y búsqueda protagonista, CTA naranja, casos recientes reales, "cómo funciona" |
| `/mascotas` | Explorar y filtrar | Banner en panel con «Consultar a nuestra IA» y filtros (fila centrada en escritorio, panel completo en móvil), lista paginada con llamados a reportar entre bloques, mapa diferido |
| `/mascotas/[id]` | Ayudar a un caso | Galería táctil, tarjeta de acción, contacto solo si es público, línea de tiempo de avistamientos, compartir (`docs/perfil-mascota-y-contacto.md`) |
| `/reportar` y `/mascotas/[id]/avistamiento` | Publicar sin perderse | Formulario en pasos (datos → fotos → ubicación → contacto), vista previa de fotos |
| `/cartel`, `/anuncios` | Difundir y apoyar | Página de carteles con vistas reales; `/anuncios` solo promoción con aporte voluntario (`docs/apoyo-voluntario.md`) |
| `/contacto` | Escribirnos y apoyar | Botones que abren el formulario en modal; apoyo por Yape/Plin (`docs/contacto-y-formularios.md`) |
| `/login`, `/register`, `/forgot-password`, `/update-password` | Entrar fácil | Disposición única, Google primero, errores traducidos |
| `/dashboard/*` | Gestionar mis casos | Resumen real, lista con filtros y acciones de estado |
| `/admin/*` | Moderar | Tablas paginadas, confirmaciones, auditoría |
| `/privacidad`, `/terminos`, `/offline` | Confianza | Texto revisado con datos reales (retención, borrado) |

## 12. Estado de implementación
- **Hecho:** fuentes, tokens y botón `cta`; barra superior fija que se encoge, barra de pestañas móvil y pie; portada, `/mascotas`, `/cartel`, `/anuncios`, `/aliados`, `/contacto`, `/reportar` y perfil de la mascota con el estilo nuevo; dashboard y administración; formularios en modal; movimiento (sección 7); patrones de la sección 14.
- **Mapas:** base vectorial (MapLibre + OpenFreeMap sobre Leaflet), marcadores con foto, agrupación, «ubícame» y búsqueda de dirección. Avisos flotantes de uno en uno (`lib/prompt-gate.ts`).
- **Pendiente:** ajustes del dashboard y modo oscuro.

## 13. Orden recomendado
1. Fuentes (Poppins y Outfit) y revisión de tokens. 2. Barra, pie y portada. 3. Búsqueda y detalle. 4. Reportar y avistamiento. 5. Auth. 6. Dashboard y admin. Cada paso con el flujo de calidad: `npx eslint . --max-warnings 0`, `npx tsc --noEmit`, `npm run build` y revisión en 375, 768, 1024 y 1440 px.

## 14. Patrones de la web actual (noviembre 2026)
- **Banner de página:** panel de color (`bg-accent` claro o `bg-primary` oscuro) con esquinas de 2rem, marca de agua de huellitas, etiqueta redondeada, título en Outfit con una palabra en naranja, texto, dos botones con icono y una línea de confianza. Foto a la derecha (arriba en móvil) con una etiqueta flotante. Mismo esqueleto en `/`, `/mascotas`, `/cartel`, `/contacto`, `/aliados`, `/anuncios`.
- **Buscador flotante:** tarjeta blanca que se superpone al borde inferior del banner. Contiene «Consultar a nuestra IA» (centrado, no un buscador de texto largo) y los filtros. Escritorio: Lugar, Mascota, Raza, Color, Tamaño y Fecha en una fila centrada. Móvil: Lugar, Mascota y el botón **Filtros**, que abre una hoja inferior con todas las opciones (el botón no existe en escritorio).
- **Marca de agua:** huellas del isologo en teal (`.paws-teal`, 4.5 % de opacidad fija al fondo del sitio) y en blanco sobre teal (`.paws-white`).
- **Encabezado:** fijo en escritorio y de 64 px; al hacer scroll pasa a 48 px con sombra suave y logo, menú y botón más chicos. Móvil: solo logo, no fijo; cuenta y accesos en la barra inferior. Escritorio con sesión: solo la foto de perfil (nombre dentro de su menú). Entre 768 y 1023 px se usa la barra inferior (el menú de arriba empieza en 1024 px).
- **Barra inferior móvil:** Inicio, Buscar, Reportar (destacado), **Asistente** (abre el chat a pantalla completa) y Menú (o Perfil con la foto). En escritorio el chat es un botón flotante que alterna abrir/cerrar.
- **Modales de formulario** (`FormDialog`): panel de información (teal, a la izquierda) + formulario; hoja inferior en móvil. Las páginas solo muestran botones que los abren.
- **Selector de color de mascota:** círculos de 48 px con nombre y check; 4/5/6 columnas según ancho.
- **Línea de tiempo de avistamientos:** avatar con línea vertical, tarjeta con zona, hora relativa, foto y botones de contacto con etiqueta (solo los que la persona compartió).
- **Destacados:** insignia naranja «Destacado»; sección de portada y aviso flotante (`docs/apoyo-voluntario.md`). El aviso flotante nunca coincide con el chat (izquierda abajo) ni con la barra inferior (se sube en móvil).
- **Insignias de estado** siempre con texto; «Destacado» y «Caso destacado» usan `cta`.
- **Sin cifras ni datos inventados:** secciones de contacto y apoyo se ocultan si falta la variable `NEXT_PUBLIC_*`.
