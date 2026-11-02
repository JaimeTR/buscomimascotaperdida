// Texto → trazos SVG para que los logos no dependan de fuentes instaladas.
// Nombre: Braze (la tipografía de marca de Devmark), siempre en MAYÚSCULAS. Eslogan: Poppins Medium.
import { readFileSync } from "node:fs"
import opentype from "opentype.js"
import { SLOGAN } from "./brand-core.mjs"

const parse = (buf) => {
  const f = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  f.tables.gsub = null // opentype.js no soporta algunos lookups GSUB; no se necesitan ligaduras
  return f
}
export const braze = parse(readFileSync(new URL("./fonts/Braze.otf", import.meta.url)))
export const poppins = parse(readFileSync("node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff"))

export const width = (text, size, ls = 0, f = braze) => f.getAdvanceWidth(text, size, { letterSpacing: ls / size })

// Serializador propio: toPathData de opentype.js emite "NaN" en algunos trazos y los corta.
const n = (v) => +v.toFixed(2)
const toD = (cmds) => cmds.map((c) => {
  if (c.type === "Z") return "Z"
  const pts = c.type === "M" || c.type === "L" ? [c.x, c.y] : c.type === "Q" ? [c.x1, c.y1, c.x, c.y] : [c.x1, c.y1, c.x2, c.y2, c.x, c.y]
  return c.type + pts.map(n).join(" ")
}).join("")
export const path = (text, x, y, size, fill, ls = 0, f = braze) => {
  const d = toD(f.getPath(text, x, y, size, { letterSpacing: ls / size }).commands)
  if (/NaN/.test(d)) throw new Error(`NaN en trazo de "${text}"`)
  return `<path fill="${fill}" d="${d}"/>`
}
export const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Busco mi mascota. ${SLOGAN}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${body}</svg>\n`
