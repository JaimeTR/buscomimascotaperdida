# Marca — Busco mi mascota

Todo se regenera con `node scripts/build-logos.mjs`.

**Nombre:** Busco mi mascota · **Dominio:** buscomimascotaperdida.com
**Eslogan:** Juntos, de vuelta a casa
**Promesa:** una red comunitaria para que las mascotas perdidas vuelvan a casa.

## 1. El símbolo

Un **pin de ubicación** teal con una **huella de mascota** recortada en el centro y un punto naranja en el suelo (el lugar donde se encuentra). Dice "buscar" y "mascota" sin depender de perro o gato, y se lee bien a 16 px.

## 2. Estructura del logotipo

- **Nombre:** `busco mi mascota` en minúsculas, Outfit 600. `busco mi` en color de marca y `mascota` en naranja; en monocromo ambos del mismo color.
- **Eslogan:** `Juntos, de vuelta a casa`, Outfit 500.
- Todos los textos están convertidos a trazos: no hace falta instalar fuentes.

## 3. Versiones del logo

Cada pieza existe en cuatro versiones (sufijo) en SVG y PNG, dentro de `public/brand/`:

| Versión | Sufijo | Fondo | Colores |
|---|---|---|---|
| **Color** | (ninguno) | Crema, blanco | Teal + naranja |
| **Claro** | `-claro` | Teal `#0f766e` (incluye su fondo) | Crema + naranja claro |
| **Blanco** | `-blanco` | Fondos oscuros (transparente) | Blanco |
| **Negro** | `-negro` | Fondos claros, una tinta (transparente) | Negro |

| Pieza | Archivo base | Uso |
|---|---|---|
| Isologo horizontal | `isologo-horizontal` | Cabeceras, documentos, firmas |
| Isologo vertical | `isologo-vertical` | Portadas, carteles |
| Isologo cuadrado 1:1 | `isologo-cuadrado` | Perfiles, impresión cuadrada |
| Logotipo horizontal (solo texto) | `logotipo-horizontal` | Donde el símbolo ya aparece cerca |
| Símbolo solo | `simbolo` (+ sufijos) | Sellos, iconos |
| Símbolo cuadrado (app) | `simbolo-cuadrado.svg`, `social-avatar.png` | Avatar de redes, ícono de app |
| Imagen para compartir 1200×630 | `public/og.png` | Vista previa al compartir |
| Símbolo web y favicon | `public/logo_symbol.svg`, `src/app/icon.svg` | Barra de navegación, pestaña |
| Íconos de la app | `public/icons/*` | PWA |

Lámina de control (no se usa en la web): `revision.png`.

### Cuándo usar cada versión
- Fondo crema/blanco → **color**. Fondo teal de marca → **claro**.
- Fondo oscuro o foto oscura → **blanco**. Fondo claro, una sola tinta o impresión sin color → **negro**.
- Nunca el logo a color sobre una foto: usar la versión `claro` sobre una capa teal sólida, o `blanco`/`negro` según la luminosidad.

## 4. Paleta de color

| Nombre | Hex | Uso |
|---|---|---|
| **Teal** (primario) | `#0f766e` | Marca, enlaces, botones principales, `busco mi` |
| Teal profundo | `#115e59` | Hover del primario, fondos oscuros |
| **Naranja** (acento) | `#c2410c` | `mascota`, **un solo** botón de acción (CTA) por pantalla |
| Naranja claro | `#fdba74` | `mascota` y detalles sobre fondo teal |
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

- **Outfit** (500/600) — nombre del logo y títulos de la web, en minúsculas normales (sentence case).
- **Poppins** (400/500/600/700) — interfaz y párrafos.

## 6. Reglas de uso

- **Espacio libre mínimo:** el ancho de la huella alrededor de cualquier versión.
- **Tamaño mínimo:** símbolo 16 px; isologo horizontal 140 px de ancho.
- No rotar, estirar, añadir sombras, contornos ni degradados. No cambiar colores fuera de las cuatro versiones.
- Con fondos de color distintos al teal, usar `blanco` o `negro`.

## 7. Cómo regenerar

```bash
node scripts/build-logos.mjs   # todo: logos, símbolo, íconos PWA, og.png, revisión
```

Fuentes de texto: `scripts/fonts/outfit-*.woff` (OFL).
