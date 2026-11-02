// Símbolo definitivo (perro con el gato recortado en negativo) y versiones sueltas. viewBox 120x120.
import { TEAL, CREAM, ORANGE, ORANGE_LIGHT } from "./brand-core.mjs"
import { dog, dogCuts, cat, BASE } from "./brand-shapes.mjs"

let n = 0
const uid = () => `k${n++}`
const mask = (id, cuts) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="260" height="360"><rect x="-20" y="-20" width="260" height="360" fill="#fff"/>${cuts}</mask>`
const T = "translate(-7.5 -4.5) scale(.6)" // centra el perro (lienzo 200) en 120x120
const CAT_AT = `translate(94 ${BASE}) scale(.78) translate(-30 -100)` // gato sentado en la base del pecho

// Caja real del símbolo dentro del cuadro 120 (para alinearlo con el texto): x 16.5..102.3, y 15.3..104.7.
export const BBOX = { x0: 40 * 0.6 - 7.5, x1: 183 * 0.6 - 7.5, y0: 33 * 0.6 - 4.5, y1: BASE * 0.6 - 4.5 }
BBOX.w = BBOX.x1 - BBOX.x0
BBOX.h = BBOX.y1 - BBOX.y0
// Coloca el símbolo con su caja a partir de (x, y) y con alto `h` px. Devuelve el grupo SVG.
export const place = (svg, x, y, h) => {
  const k = h / BBOX.h
  return `<g transform="translate(${x - BBOX.x0 * k} ${y - BBOX.y0 * k}) scale(${k})">${svg}</g>`
}
export const placedWidth = (h) => (h * BBOX.w) / BBOX.h

// Perro de un solo color con el gato recortado (hueco) en su pecho.
export const symbol = ({ art, mono = false }) => {
  const id = uid()
  const m = mask(id, `${dogCuts(mono)}<g transform="${CAT_AT}">${cat("#000")}</g>`)
  // Lupa dentro del pecho del gato (coordenadas del gato). Un solo color = el del perro, que contrasta con el hueco:
  // verde sobre el gato blanco, blanca sobre el gato verde. Aro, brillo del cristal, collarín y mango.
  const lupa = `<g transform="${CAT_AT}" fill="none" stroke="${art}" stroke-linecap="round">` +
    `<circle cx="26.5" cy="66" r="11" stroke-width="4.2"/>` +
    `<path d="M19.6 64.4 A7.2 7.2 0 0 1 24.6 58.9" stroke-width="2.4"/>` +
    `<line x1="35.2" y1="74.7" x2="38.8" y2="78.3" stroke-width="7.2"/>` +
    `<line x1="39.6" y1="79.1" x2="47.2" y2="86.7" stroke-width="5.6"/></g>`
  return `<defs>${m}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art, undefined, mono)}</g>${lupa}</g>`
}

// Versiones sueltas: solo perro y solo gato (un color) para íconos por tipo de mascota.
export const dogOnly = ({ art, mono = false }) => {
  const id = uid()
  return `<defs>${mask(id, dogCuts(mono))}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art, undefined, mono)}</g></g>`
}
export const catOnly = ({ art }) => {
  const id = uid()
  const eyes = `<circle cx="21" cy="28" r="2.6" fill="#000"/><circle cx="39" cy="28" r="2.6" fill="#000"/>`
  return `<defs>${mask(id, eyes)}</defs><g transform="translate(26 6) scale(1.1)"><g mask="url(#${id})">${cat(art)}</g></g>`
}

export const variants = {
  color: { art: TEAL, accent: ORANGE, wordA: TEAL, wordB: ORANGE, slogan: "#3d5655", fond: null },
  claro: { art: CREAM, accent: ORANGE_LIGHT, wordA: CREAM, wordB: ORANGE_LIGHT, slogan: "#cfe9e5", fond: TEAL },
  // Monocromo: un solo color y fondo transparente (el fondo oscuro/claro de la lámina es solo de vista previa).
  blanco: { art: "#ffffff", mono: true, wordA: "#ffffff", wordB: "#ffffff", slogan: "#ffffff", fond: null },
  negro: { art: "#000000", mono: true, wordA: "#000000", wordB: "#000000", slogan: "#000000", fond: null },
}
