// Símbolo, favicon, íconos PWA e imagen social (Open Graph) desde brand-core.
//   node scripts/build-brand.mjs
// Salida: public/logo_symbol.svg, src/app/icon.svg, public/icons/*.png, public/og.png
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { TEAL, ORANGE, CREAM, MUTED, NAME, VIEW } from "./brand-core.mjs"
import { symbol, variants } from "./brand-models.mjs"
import { path, width, sloganPath } from "./brand-text.mjs"

const symbolColor = symbol(variants.color)
const symbolLight = symbol(variants.claro)

const svg = (inner, extra = "", box = `0 0 ${VIEW} ${VIEW}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" ${extra}>${inner}</svg>
`
// Recorte ajustado al perro (barra de navegación y favicon).
const TIGHT = "20 0 88 110"

writeFileSync("public/logo_symbol.svg", svg(symbolColor, 'role="img" aria-label="Busco mi mascota"', TIGHT))
writeFileSync("src/app/icon.svg", svg(symbolColor, "", TIGHT))

// Ícono de app: fondo teal, símbolo crema. pad = margen (maskable necesita zona segura ~22%).
const appIcon = (pad) => {
  const size = VIEW * (1 - pad * 2), off = (VIEW - size) / 2
  return svg(`<rect width="${VIEW}" height="${VIEW}" fill="${TEAL}"/><g transform="translate(${off} ${off}) scale(${size / VIEW})">${symbolLight}</g>`)
}

mkdirSync("public/icons", { recursive: true })
const render = (source, size, file) => sharp(Buffer.from(source), { density: 384 }).resize(size, size).png().toFile(file)
for (const s of [72, 96, 128, 144, 152, 180, 192, 384, 512]) await render(appIcon(0.08), s, `public/icons/icon-${s}x${s}.png`)
await render(appIcon(0.22), 512, "public/icons/maskable-512x512.png")

// Imagen para compartir (Open Graph) 1200x630: símbolo, nombre en dos líneas (Braze) y eslogan (Poppins).
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <rect width="1200" height="14" fill="${TEAL}"/>
  <g transform="translate(70 40) scale(4.6)">${symbolColor}</g>
  ${path(NAME[0].toUpperCase(), 600, 270, 92, TEAL, 3)}
  ${path(NAME[1].toUpperCase(), 600, 380, 92, ORANGE, 3)}
  ${sloganPath(width(NAME[0].toUpperCase(), 92, 3), 600, 446, MUTED)}
</svg>`
await sharp(Buffer.from(og)).png().toFile("public/og.png")
console.log("Marca generada")
