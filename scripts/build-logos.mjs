// Genera isologo, logotipo y piezas cuadradas para redes en public/brand/.
//   node scripts/build-logos.mjs
// El texto se convierte a trazos (Outfit) para que no dependa de fuentes instaladas.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"
import opentype from "opentype.js"
import sharp from "sharp"
import { TEAL, ORANGE, ORANGE_LIGHT, CREAM, MUTED, NAME, SLOGAN, VIEW, symbolColor, symbolLight } from "./brand-core.mjs"

const load = (w) => {
  const b = readFileSync(`node_modules/@fontsource/outfit/files/outfit-latin-${w}-normal.woff`)
  const f = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength))
  f.tables.gsub = null // opentype.js no soporta algunos lookups GSUB de Outfit; no se necesitan ligaduras
  return f
}
const bold = load(800)
const medium = load(500)

const width = (font, text, size, ls = 0) => font.getAdvanceWidth(text, size, { letterSpacing: ls / size })

// Serializador propio: toPathData de opentype.js emite "NaN" en algunos trazos (p. ej. la "C" a cierto tamaño).
const n = (v) => +v.toFixed(2)
const toD = (cmds) => cmds.map((c) => {
  if (c.type === "Z") return "Z"
  const pts = c.type === "M" || c.type === "L" ? [c.x, c.y] : c.type === "Q" ? [c.x1, c.y1, c.x, c.y] : [c.x1, c.y1, c.x2, c.y2, c.x, c.y]
  return c.type + pts.map(n).join(" ")
}).join("")
const path = (font, text, x, y, size, fill, ls = 0) => {
  const d = toD(font.getPath(text, x, y, size, { letterSpacing: ls / size }).commands)
  if (/NaN/.test(d)) throw new Error(`NaN en trazo de "${text}"`)
  return `<path fill="${fill}" d="${d}"/>`
}
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Busco mi mascota. ${SLOGAN}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${body}</svg>\n`

const out = "public/brand"
mkdirSync(out, { recursive: true })
const save = (name, svg) => writeFileSync(`${out}/${name}.svg`, svg)
const png = (name, svg, w) => sharp(Buffer.from(svg), { density: 300 }).resize({ width: w }).png().toFile(`${out}/${name}.png`)

// Nombre en dos tonos: "Busco mi" (teal) + "mascota" (naranja).
const palette = {
  color: { a: TEAL, b: ORANGE, slogan: MUTED, sym: symbolColor, bg: null },
  claro: { a: CREAM, b: ORANGE_LIGHT, slogan: "#cfe9e5", sym: symbolLight, bg: TEAL },
}

// ISOLOGO: símbolo + nombre en dos líneas + eslogan, un solo bloque.
function isologo(p) {
  const S = 1.7, size = 70, lh = 66, sl = 22, ls = 3
  const sx = 14, tx = sx + VIEW * S * 0.82 + 30
  const y1 = 96, y2 = y1 + lh, y3 = y2 + 44
  const wName = Math.max(width(bold, NAME[0], size), width(bold, NAME[1], size))
  const wSlogan = width(medium, SLOGAN.toUpperCase(), sl, ls)
  const W = Math.ceil(tx + Math.max(wName, wSlogan) + 24), H = 236
  const body =
    `<g transform="translate(${sx - 17 * S} 6) scale(${S})">${p.sym}</g>` +
    path(bold, NAME[0], tx, y1, size, p.a) +
    path(bold, NAME[1], tx, y2, size, p.b) +
    path(medium, SLOGAN.toUpperCase(), tx, y3, sl, p.slogan, ls)
  return doc(W, H, body, p.bg)
}

// LOGOTIPO: solo tipografía (nombre + eslogan), sin símbolo.
function logotipo(p) {
  const size = 120, sl = 30, ls = 5, pad = 40
  const a = `${NAME[0]} `, w1 = width(bold, a, size), w2 = width(bold, NAME[1], size)
  const wSlogan = width(medium, SLOGAN.toUpperCase(), sl, ls)
  const W = Math.ceil(pad * 2 + w1 + w2), H = 250, y1 = 130
  const body =
    path(bold, a, pad, y1, size, p.a) +
    path(bold, NAME[1], pad + w1, y1, size, p.b) +
    path(medium, SLOGAN.toUpperCase(), pad + (W - pad * 2 - wSlogan) / 2, y1 + 66, sl, p.slogan, ls)
  return doc(W, H, body, p.bg)
}

for (const [k, p] of Object.entries(palette)) {
  const suf = k === "color" ? "" : "-claro"
  const iso = isologo(p), logo = logotipo(p)
  save(`isologo${suf}`, iso); save(`logotipo${suf}`, logo)
  await png(`isologo${suf}`, iso, 1600); await png(`logotipo${suf}`, logo, 1600)
}

// REDES: avatar 1080 (se recorta en círculo: símbolo centrado con margen amplio).
{
  const S = 6.2, off = (1080 - VIEW * S) / 2
  const svg = doc(1080, 1080, `<g transform="translate(${off} ${off}) scale(${S})">${symbolLight}</g>`, TEAL)
  save("social-avatar", svg); await png("social-avatar", svg, 1080)
}
// REDES: cuadrado de publicación 1080 con símbolo, nombre y eslogan.
{
  const S = 4.4, size = 104, sl = 32, ls = 6
  const a = NAME[0] + " ", wa = width(bold, a, size), wn = wa + width(bold, NAME[1], size)
  const wsl = width(medium, SLOGAN.toUpperCase(), sl, ls)
  const x0 = (1080 - wn) / 2
  const body =
    `<rect width="1080" height="18" fill="${TEAL}"/>` +
    `<g transform="translate(${(1080 - VIEW * S) / 2} 100) scale(${S})">${symbolColor}</g>` +
    path(bold, a, x0, 770, size, TEAL) +
    path(bold, NAME[1], x0 + wa, 770, size, ORANGE) +
    path(medium, SLOGAN.toUpperCase(), (1080 - wsl) / 2, 850, sl, MUTED, ls) +
    `<rect x="${1080 / 2 - 200}" y="920" width="400" height="76" rx="38" fill="${ORANGE}"/>` +
    path(bold, "buscomimascotaperdida.com", 1080 / 2 - width(bold, "buscomimascotaperdida.com", 25) / 2, 968, 25, "#ffffff")
  const svg = doc(1080, 1080, body, CREAM)
  save("social-cuadrado", svg); await png("social-cuadrado", svg, 1080)
}
console.log("Logos generados en", out)
