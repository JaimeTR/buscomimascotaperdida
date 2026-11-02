// Texto → trazos SVG con Outfit, para que los logos no dependan de fuentes instaladas.
import { readFileSync } from "node:fs"
import opentype from "opentype.js"
import { SLOGAN } from "./brand-core.mjs"

const load = (w) => {
  const b = readFileSync(`node_modules/@fontsource/outfit/files/outfit-latin-${w}-normal.woff`)
  const f = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength))
  f.tables.gsub = null // opentype.js no soporta algunos lookups GSUB de Outfit; no se necesitan ligaduras
  return f
}
export const bold = load(800)
export const medium = load(500)

export const width = (font, text, size, ls = 0) => font.getAdvanceWidth(text, size, { letterSpacing: ls / size })

// Serializador propio: toPathData de opentype.js emite "NaN" en algunos trazos (p. ej. la "C" a cierto tamaño).
const n = (v) => +v.toFixed(2)
const toD = (cmds) => cmds.map((c) => {
  if (c.type === "Z") return "Z"
  const pts = c.type === "M" || c.type === "L" ? [c.x, c.y] : c.type === "Q" ? [c.x1, c.y1, c.x, c.y] : [c.x1, c.y1, c.x2, c.y2, c.x, c.y]
  return c.type + pts.map(n).join(" ")
}).join("")
export const path = (font, text, x, y, size, fill, ls = 0) => {
  const d = toD(font.getPath(text, x, y, size, { letterSpacing: ls / size }).commands)
  if (/NaN/.test(d)) throw new Error(`NaN en trazo de "${text}"`)
  return `<path fill="${fill}" d="${d}"/>`
}
export const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Busco mi mascota. ${SLOGAN}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${body}</svg>\n`
