// Genera todos los assets de marca desde un único símbolo SVG.
//   node scripts/build-brand.mjs
// Salida: public/logo_symbol.svg, src/app/icon.svg, public/icons/*.png, public/og.png
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"

import { TEAL, ORANGE, CREAM, symbolColor as color, symbolLight as light } from "./brand-core.mjs"

const svg = (inner, viewBox = "0 0 96 96", extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${extra}>${inner}</svg>\n`

writeFileSync("public/logo_symbol.svg", svg(color, "0 0 96 96", 'role="img" aria-label="Busco mi mascota"'))
writeFileSync("src/app/icon.svg", svg(color))

// Ícono de app: fondo teal, símbolo claro, mango naranja claro (contraste sobre teal).
const appIcon = (pad) => {
  // pad = fracción del lado reservada como margen (maskable necesita zona segura ~20%)
  const size = 96 * (1 - pad * 2)
  const off = (96 - size) / 2
  return svg(`<rect width="96" height="96" fill="${TEAL}"/><g transform="translate(${off} ${off}) scale(${size / 96})">${light}</g>`)
}

mkdirSync("public/icons", { recursive: true })
const render = (source, size, file) => sharp(Buffer.from(source), { density: 384 }).resize(size, size).png().toFile(file)

for (const s of [72, 96, 128, 144, 152, 180, 192, 384, 512]) {
  await render(appIcon(0.1), s, `public/icons/icon-${s}x${s}.png`)
}
await render(appIcon(0.22), 512, "public/icons/maskable-512x512.png")

// Imagen para compartir (Open Graph), 1200x630.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <rect x="0" y="0" width="1200" height="14" fill="${TEAL}"/>
  <g transform="translate(110 180) scale(2.6)">${color}</g>
  <text x="440" y="300" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="72" fill="#0b2b2a">Busco mi mascota</text>
  <text x="444" y="370" font-family="Arial, Helvetica, sans-serif" font-size="38" fill="#3d5655">Red comunitaria para que vuelvan a casa</text>
  <rect x="444" y="420" width="400" height="72" rx="36" fill="${ORANGE}"/>
  <text x="644" y="468" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="30" fill="#fff">Reportar una mascota</text>
</svg>`
await sharp(Buffer.from(og)).png().toFile("public/og.png")
console.log("Marca generada")
