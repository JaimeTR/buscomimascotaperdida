# Sistema de diseño — Busco mi mascota (web)

Fuente de verdad para rediseñar la web. La identidad (logo, versiones, reglas) está en `docs/marca.md` y la guía visual en `public/brand/guia-de-marca.png`. El producto y el tono están en `PRODUCT.md`. Dirección: **Confianza comunitaria** — cálida, clara, accesible y orientada a la acción.

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
| **Display y títulos cortos** | **Braze** | Solo MAYÚSCULAS, hasta ~4 palabras, desde 24 px, espaciado +0.01em. Nunca en párrafos ni botones. |
| **Interfaz y texto** | **Poppins** | 400 texto, 500 etiquetas y navegación, 600 títulos y botones, 700 énfasis. |
| Reserva | `system-ui, sans-serif` | Mientras carga la fuente |

### Escala
| Nivel | Fuente | Tamaño (móvil → escritorio) | Interlínea |
|---|---|---|---|
| Display (hero) | Braze | 36 → 64 px | 1.05 |
| H1 de página | Braze | 28 → 44 px | 1.1 |
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
- **Braze:** convertir `scripts/fonts/Braze.otf` a `woff2` con subconjunto (A–Z, 0–9, acentos y puntuación básica) y cargarla con `next/font/local` solo para display y H1. **Antes de servirla en la web hay que confirmar su licencia** (la fuente no trae licencia visible y es de la marca Devmark).

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
Transiciones de 150–250 ms con `ease-out`; solo transformaciones y opacidad. Respetar `prefers-reduced-motion` (ya está en `globals.css`). Nada de animaciones decorativas en bucle.

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
| `/` | Buscar o publicar en segundos | Hero con `Display` en Braze y búsqueda protagonista, CTA naranja, casos recientes reales, "cómo funciona" |
| `/mascotas` | Explorar y filtrar | Filtros en panel (móvil) y barra (escritorio), mapa diferido, estados de carga/vacío/error |
| `/mascotas/[id]` | Ayudar a un caso | Galería accesible, estado, mapa aproximado, contacto solo si es público, compartir |
| `/reportar` y `/mascotas/[id]/avistamiento` | Publicar sin perderse | Formulario en pasos (datos → fotos → ubicación → contacto), vista previa de fotos |
| `/cartel`, `/promocionar` | Difundir | Cartel desde datos reales; quitar contenido de ejemplo |
| `/contacto` | Escribirnos | Formulario real (Server Action + Zod) o quitarlo |
| `/login`, `/register`, `/forgot-password`, `/update-password` | Entrar fácil | Disposición única, Google primero, errores traducidos |
| `/dashboard/*` | Gestionar mis casos | Resumen real, lista con filtros y acciones de estado |
| `/admin/*` | Moderar | Tablas paginadas, confirmaciones, auditoría |
| `/privacidad`, `/terminos`, `/offline` | Confianza | Texto revisado con datos reales (retención, borrado) |

## 12. Estado de implementación (rediseño aplicado)
- **Hecho:** Poppins (`next/font/google`) y Braze (`next/font/local`, archivo en `src/fonts/Braze.otf`) cargadas en `layout.tsx`; utilidades `font-sans` y `font-display`; tokens y variante de botón `cta`; barra superior, barra de pestañas móvil y pie; portada con panel, accesos rápidos y filtros (`PetFilters`); `PetCard`; dashboard (barra lateral, pestañas móviles, resumen, mis reportes) y panel de administración (barra lateral oscura, resumen con barras, reportes, usuarios y auditoría); clases `stone-*` y `teal-*` migradas a tokens en el resto de páginas; títulos principales en Braze.
- **Pendiente:** `/reportar` por pasos, detalle `/mascotas/[id]` y `/cartel` con el estilo nuevo en profundidad, ajustes del dashboard, modo oscuro y la licencia de Braze (ver `docs/marca.md`).

## 13. Orden recomendado
1. Fuentes (Poppins y Braze) y revisión de tokens. 2. Barra, pie y portada. 3. Búsqueda y detalle. 4. Reportar y avistamiento. 5. Auth. 6. Dashboard y admin. Cada paso con el flujo de calidad: `npx eslint . --max-warnings 0`, `npx tsc --noEmit`, `npm run build` y revisión en 375, 768, 1024 y 1440 px.
