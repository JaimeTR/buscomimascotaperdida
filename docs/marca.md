# Marca — Busco mi mascota

**Nombre:** Busco mi mascota · **Dominio:** buscomimascotaperdida.com
**Eslogan:** Juntos, de vuelta a casa
**Símbolo:** un perro de perfil, con oreja caída y nariz marcadas, y un gato sentado recortado en el espacio negativo de su pecho: sirve para perros y gatos. Una lupa pequeña dentro del pecho del gato aporta la idea de "buscar": va de un solo color, verde sobre el gato blanco y blanca sobre el gato verde.
**Nombre en el logo:** siempre en MAYÚSCULAS y en dos líneas: "BUSCO MI" (teal) y "MASCOTA" (naranja).

## Piezas (`public/brand/`, se regeneran con `node scripts/build-logos.mjs`)

| Pieza | Archivos | Uso |
|---|---|---|
| Isologo horizontal (símbolo a la izquierda; su alto = de lo alto de "BUSCO MI" a la base del eslogan) | `isologo-horizontal.svg/.png`, `-claro` | Cabeceras anchas, documentos, firmas |
| Isologo vertical (símbolo arriba) | `isologo-vertical.svg/.png`, `-claro` | Portadas, carteles, espacios cuadrados |
| Isologo cuadrado 1:1 (todo centrado, aire parejo) | `isologo-cuadrado.svg/.png`, `-claro` | Perfiles, stickers, impresión en formato cuadrado |
| Logotipo horizontal (solo texto, alineado a la izquierda) | `logotipo-horizontal.*`, `-claro` | Donde el símbolo ya aparece cerca |
| Logotipo vertical (solo texto, centrado) | `logotipo-vertical.*`, `-claro` | Formatos altos |
| Avatar de redes 1080² (recorte circular seguro) | `social-avatar.png` | Foto de perfil Instagram, Facebook, TikTok, WhatsApp |
| Cuadrado de publicación 1080² | `social-cuadrado.png` | Publicación fija, historias destacadas |
| Símbolos sueltos | `simbolo-perro.svg`, `simbolo-gato.svg` | Íconos por tipo de mascota |
| `-claro` | | Versión para fondo teal u oscuro |
| Símbolo web, favicon, íconos PWA, imagen social | `public/logo_symbol.svg`, `src/app/icon.svg`, `public/icons/*`, `public/og.png` | `node scripts/build-brand.mjs` |

`public/brand/revision.png` es una lámina de control con las cuatro piezas; no se usa en la web.

## Colores

| Token | Hex | Uso |
|---|---|---|
| Teal (primario) | `#0f766e` | Marca, enlaces, botones principales |
| Naranja (acento) | `#c2410c` | "MASCOTA" y un solo CTA por pantalla (claro: `#fdba74`) |
| Crema | `#faf8f3` | Fondo |
| Tinta | `#0b2b2a` | Texto principal |
| Gris teal | `#3d5655` | Texto secundario / eslogan |

Contraste: texto tinta sobre crema ≥ 14:1; blanco sobre teal y sobre naranja ≥ 5:1 (AA).

## Tipografía
- **Nombre:** Braze (la tipografía de marca de Devmark), solo mayúsculas. El archivo está en `scripts/fonts/Braze.otf`; en los logos el texto ya está convertido a trazos. No incluye licencia visible: confirmar que se puede usar fuera de Devmark.
- **Eslogan:** Poppins Medium en MAYÚSCULAS, con espaciado de 0.12 em y ajustado para medir exactamente lo mismo que la línea "BUSCO MI".
- **Interfaz web:** Outfit (`next/font`).

## Reglas
- Margen libre mínimo alrededor del logo: el ancho de la oreja del perro.
- Tamaño mínimo: símbolo 24 px; isologo 140 px de ancho.
- El símbolo es teal (o crema sobre fondo teal) con la oreja y la nariz en un tono más profundo; no rotar, no añadir sombras ni contornos.
- Sobre fotos: usar la versión `-claro` sobre una capa teal sólida, no directamente sobre la imagen.
