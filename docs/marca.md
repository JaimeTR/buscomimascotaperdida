# Marca — Busco mi mascota

**Nombre:** Busco mi mascota · **Dominio:** buscomimascotaperdida.com
**Eslogan:** Juntos, de vuelta a casa
**Idea del símbolo:** la silueta de un perro con un gato recortado en el espacio negativo de su pecho: sirve para los dos tipos de mascota. El nombre va en dos tonos: "Busco mi" en teal y "mascota" en naranja.

## Piezas (`public/brand/`, regenerar con `node scripts/build-logos.mjs`)

| Pieza | Archivo | Uso |
|---|---|---|
| Isologo (símbolo + nombre + eslogan) | `isologo.svg/.png`, `isologo-claro.*` | Cabeceras, documentos, presentaciones. `-claro` sobre fondos teal/oscuros |
| Logotipo (solo tipografía + eslogan) | `logotipo.svg/.png`, `logotipo-claro.*` | Pie de correos, firmas, sitios donde el símbolo ya aparece cerca |
| Avatar de redes (1080², recorte circular seguro) | `social-avatar.png` | Foto de perfil Instagram, Facebook, TikTok, WhatsApp |
| Cuadrado de publicación (1080²) | `social-cuadrado.png` | Publicación fija, portada de historia destacada |
| Símbolo | `public/logo_symbol.svg`, `src/app/icon.svg` | Barra de navegación, favicon |
| Íconos PWA / imagen social | `public/icons/*`, `public/og.png` | `node scripts/build-brand.mjs` |

## Colores

| Token | Hex | Uso |
|---|---|---|
| Teal (primario) | `#0f766e` | Marca, enlaces, botones principales |
| Naranja (acento) | `#c2410c` | "mascota" en el logotipo y un solo CTA por pantalla (claro: `#fdba74`) |
| Crema | `#faf8f3` | Fondo |
| Tinta | `#0b2b2a` | Texto principal |
| Gris teal | `#3d5655` | Texto secundario / eslogan |

Contraste: texto tinta sobre crema ≥ 14:1; blanco sobre teal y sobre naranja ≥ 5:1 (AA).

## Tipografía
Outfit (800 para el nombre, 500 para el eslogan en mayúsculas con espaciado). En los archivos el texto ya está convertido a trazos.

## Reglas
- Margen libre mínimo alrededor del logo: el ancho de la oreja del perro.
- Tamaño mínimo: símbolo 24 px; isologo 120 px de ancho.
- El símbolo es de un solo color (teal, o crema sobre fondo teal); no rotar, no añadir sombras ni contornos.
- Sobre fotos: usar la versión `-claro` sobre una capa teal sólida, no directamente sobre la imagen.
