// Símbolo, favicon, íconos PWA e imagen social (Open Graph) desde brand-core.
//   node scripts/build-brand.mjs
// Salida: public/logo_symbol.svg, src/app/icon.svg, public/icons/*.png, public/og.png
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { TEAL, ORANGE, CREAM, MUTED, NAME, SLOGAN, VIEW, symbolColor, symbolLight } from "./brand-core.mjs"

const svg = (inner, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" ${extra}>${inner}</svg>\n`

writeFileSync("public/logo_symbol.svg", svg(symbolColor, 'role="img" aria-label="Busco mi mascota"'))
writeFileSync("src/app/icon.svg", svg(symbolColor))

// Ícono de app: fondo teal, símbolo crema. pad = margen (maskable necesita zona segura ~22%).
const appIcon = (pad) => {
  const size = VIEW * (1 - pad * 2), off = (VIEW - size) / 2
  return svg(`<rect width="${VIEW}" height="${VIEW}" fill="${TEAL}"/><g transform="translate(${off} ${off}) scale(${size / VIEW})">${symbolLight}</g>`)
}

mkdirSync("public/icons", { recursive: true })
const render = (source, size, file) => sharp(Buffer.from(source), { density: 384 }).resize(size, size).png().toFile(file)
for (const s of [72, 96, 128, 144, 152, 180, 192, 384, 512]) await render(appIcon(0.08), s, `public/icons/icon-${s}x${s}.png`)
await render(appIcon(0.22), 512, "public/icons/maskable-512x512.png")

// Imagen para compartir (Open Graph) 1200x630. Texto en Arial: es solo una miniatura social.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <rect width="1200" height="14" fill="${TEAL}"/>
  <g transform="translate(90 70) scale(4.2)">${symbolColor}</g>
  <text x="640" y="290" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="${TEAL}">${NAME[0]}</text>
  <text x="640" y="372" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="${ORANGE}">${NAME[1]}</text>
  <text x="644" y="430" font-family="Arial, Helvetica, sans-serif" font-size="30" letter-spacing="3" fill="${MUTED}">${SLOGAN.toUpperCase()}</text>
</svg>`
await sharp(Buffer.from(og)).png().toFile("public/og.png")
console.log("Marca generada")
