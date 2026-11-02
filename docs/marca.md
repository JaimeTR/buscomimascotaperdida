# Marca — Busco mi mascota

Guía visual en una imagen: `public/brand/guia-de-marca.png`. Todo se regenera con `node scripts/build-logos.mjs` (logos, símbolo, guía) y `node scripts/build-brand.mjs` (favicon, íconos de la app, imagen para compartir).

**Nombre:** Busco mi mascota · **Dominio:** buscomimascotaperdida.com
**Eslogan:** Juntos, de vuelta a casa
**Promesa:** una red comunitaria para que las mascotas perdidas vuelvan a casa.

## 1. El símbolo

Un perro de perfil (cráneo redondo, hocico con la nariz marcada, línea de la boca, oreja caída) con un gato sentado recortado en el espacio negativo de su pecho y una lupa pequeña dentro del gato. Funciona para perros y gatos y dice "buscar" sin ser una lupa gigante.

- El símbolo es de **un solo color** más dos tonos propios en la versión a color: la oreja y la nariz van en un tono más profundo (22 % más oscuro sobre fondo claro, 12 % sobre crema).
- La lupa usa el color del perro y contrasta con el hueco del gato: **verde sobre el gato blanco, blanca sobre el gato verde**.
- En monocromo (blanco o negro) la oreja se marca con un contorno y la nariz con un hueco, porque no hay tonos.

## 2. Estructura del logotipo

- **Nombre:** siempre en **MAYÚSCULAS** y en **dos líneas**: `BUSCO MI` (color de marca) y `MASCOTA` (naranja). En las versiones monocromas ambas líneas llevan el mismo color.
- **Eslogan:** `JUNTOS, DE VUELTA A CASA` en Poppins Medium mayúsculas, con espaciado de 0.12 em y **ajustado para medir exactamente lo mismo que la línea `BUSCO MI`**.
- **Isologo horizontal:** el símbolo mide exactamente de la parte alta de `BUSCO MI` a la base del eslogan.
- Todos los textos están convertidos a trazos: no hace falta instalar fuentes para usar los archivos.

## 3. Versiones del logo

Cada pieza existe en cuatro versiones (sufijo del archivo) en SVG y PNG, dentro de `public/brand/`:

| Versión | Sufijo | Fondo donde se usa | Colores |
|---|---|---|---|
| **Color** | (ninguno) | Crema, blanco o fotos muy claras | Teal + naranja, oreja y nariz en tono profundo |
| **Claro** | `-claro` | Teal `#0f766e` (incluye su fondo teal) | Crema + naranja claro `#fdba74` |
| **Blanco** | `-blanco` | Cualquier fondo oscuro o foto oscura (transparente) | Solo blanco `#ffffff` |
| **Negro** | `-negro` | Cualquier fondo claro, fax, sellos, un solo color de tinta (transparente) | Solo negro `#000000` |

Piezas:

| Pieza | Archivo base | Uso |
|---|---|---|
| Isologo horizontal | `isologo-horizontal` | Cabeceras anchas, documentos, firmas de correo |
| Isologo vertical | `isologo-vertical` | Portadas, carteles, pantallas altas |
| Isologo cuadrado 1:1 | `isologo-cuadrado` | Perfiles, stickers, impresión cuadrada |
| Logotipo horizontal (solo texto, a la izquierda) | `logotipo-horizontal` | Donde el símbolo ya aparece cerca |
| Logotipo vertical (solo texto, centrado) | `logotipo-vertical` | Formatos altos, textiles |
| Símbolo solo | `simbolo` (+ sufijos) | Favicon, avatar de app, sellos |
| Perro suelto / gato suelto | `simbolo-perro.svg`, `simbolo-gato.svg` | Íconos por tipo de mascota (filtros, etiquetas) |

Piezas para redes y la web (no tienen versión monocroma):

| Pieza | Archivo | Uso |
|---|---|---|
| Avatar 1080² (recorte circular seguro) | `social-avatar.png` | Foto de perfil Instagram, Facebook, TikTok, WhatsApp |
| Cuadrado de publicación 1080² | `social-cuadrado.png` | Publicación fija, historias destacadas (incluye el dominio) |
| Imagen para compartir 1200×630 | `public/og.png` | Vista previa al compartir el enlace |
| Símbolo web y favicon | `public/logo_symbol.svg`, `src/app/icon.svg` | Barra de navegación, pestaña del navegador |
| Íconos de la app | `public/icons/*` (incluye `maskable-512x512.png`) | Instalación como app (PWA) |

Láminas de control (no se usan en la web): `revision.png` (color y claro), `revision-monocromo.png` (blanco y negro).

### Cuándo usar cada versión
- Fondo crema/blanco → **color**. Fondo teal de marca → **claro**.
- Fondo oscuro o foto oscura → **blanco**. Fondo claro, una sola tinta o impresión sin color → **negro**.
- Nunca el logo a color sobre una foto: usar la versión `claro` sobre una capa teal sólida, o `blanco`/`negro` según la luminosidad.

## 4. Paleta de color

| Nombre | Hex | Uso |
|---|---|---|
| **Teal** (primario) | `#0f766e` | Marca, enlaces, botones principales, `BUSCO MI` |
| Teal profundo | `#115e59` | Hover del primario, fondos oscuros |
| **Naranja** (acento) | `#c2410c` | `MASCOTA`, **un solo** botón de acción (CTA) por pantalla |
| Naranja claro | `#fdba74` | `MASCOTA` y detalles sobre fondo teal |
| **Crema** | `#faf8f3` | Fondo de la web |
| **Tinta** | `#0b2b2a` | Texto principal |
| Gris teal | `#3d5655` | Texto secundario y eslogan |
| Éxito | `#1d724a` | Encontrado, confirmaciones |
| Alerta | `#935f06` | En revisión |
| Error | `#b81e1e` | Errores y acciones destructivas |

Escalas completas (teal y naranja) y tokens de la web: ver `DESIGN.md`.

### Contraste (WCAG)
| Combinación | Ratio | Resultado |
|---|---|---|
| Tinta sobre crema | 14.20 | AAA |
| Gris teal sobre crema | 7.44 | AAA |
| Teal sobre crema | 5.16 | AA |
| Blanco sobre teal | 5.47 | AA |
| Crema sobre teal | 5.16 | AA |
| Blanco sobre teal profundo | 7.58 | AAA |
| Naranja sobre crema | 4.88 | AA |
| Blanco sobre naranja | 5.18 | AA |
| Naranja claro sobre teal | 3.25 | solo texto grande (≥ 24 px o 19 px en negrita): úsalo en el logo, no en texto pequeño |
| Blanco sobre éxito / alerta / error | 5.90 / 5.41 / 6.48 | AA |

## 5. Tipografía

- **Braze** — nombre del logo y títulos cortos. Solo mayúsculas. Es la tipografía de marca de Devmark; el archivo está en `scripts/fonts/Braze.otf`. **No trae licencia visible**: confirmar que se puede usar fuera de Devmark antes de publicar el repositorio o servirla en la web.
- **Poppins** (Medium 500 en el logo; 400/500/600/700 en la web) — eslogan, interfaz y párrafos.
- La interfaz web usa hoy Outfit (`next/font`); el rediseño la reemplaza (ver `DESIGN.md`).

## 6. Reglas de uso

- **Espacio libre mínimo:** el ancho de la oreja del perro alrededor de cualquier versión.
- **Tamaño mínimo:** símbolo 24 px (a ese tamaño la lupa y el gato son apenas una marca); isologo horizontal 140 px de ancho; isologo vertical 90 px.
- No rotar, estirar, añadir sombras, contornos ni degradados. No cambiar los colores entre sí (excepto las cuatro versiones oficiales).
- No separar el símbolo de la lupa del gato ni cambiar la posición del gato.
- No escribir el nombre en minúsculas dentro del logo.
- Con fondos de color distintos al teal, usar la versión `blanco` o `negro`, no inventar combinaciones.

## 7. Cómo regenerar

```bash
node scripts/build-logos.mjs   # isologos, logotipos, símbolo, avatar, cuadrado, guía
node scripts/build-brand.mjs   # favicon, íconos PWA, og.png
```

Fuentes del dibujo: `scripts/brand-shapes.mjs` (perro y gato), `scripts/brand-models.mjs` (símbolo, lupa, variantes), `scripts/brand-text.mjs` (texto a trazos), `scripts/brand-core.mjs` (colores, nombre y eslogan).
