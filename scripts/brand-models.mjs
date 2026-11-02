// Tres modelos de símbolo (perro + gato). Todos en viewBox 120x120.
// Cada modelo recibe { art, accent, bg }: art = color principal, accent = naranja, bg = color opuesto (modelo 3).
import { TEAL, CREAM, ORANGE, ORANGE_LIGHT } from "./brand-core.mjs"
import { dog, dogCuts, cat, catTail } from "./brand-shapes.mjs"

let n = 0
const uid = () => `k${n++}`
const mask = (id, cuts) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="260" height="360"><rect x="-20" y="-20" width="260" height="360" fill="#fff"/>${cuts}</mask>`
const cut = `fill="none" stroke="#000" stroke-linecap="round"`
const T = "translate(-7.5 -14) scale(.6)" // centra el perro (lienzo 200) en 120x120
const CAT_AT = "translate(92 200) scale(.62) translate(-30 -100)" // gato sentado en la base del pecho

// MODELO 1 — "Negativo": perro de un solo color con el gato recortado (hueco) en su pecho.
export const model1 = ({ art }) => {
  const id = uid()
  const m = mask(id, `${dogCuts(5)}<g transform="${CAT_AT}">${cat("#000")}</g>`)
  return `<defs>${m}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g></g>`
}

// MODELO 2 — "Dúo": perro teal y gato naranja (positivos), separados por un borde del fondo.
export const model2 = ({ art, accent }) => {
  const id = uid()
  const m = mask(id, `${dogCuts(5)}
    <g transform="${CAT_AT}">${cat("#000", 'stroke="#000" stroke-width="15" stroke-linejoin="round"')}<path d="M55 97 C74 96 76 72 65 62" ${cut} stroke-width="19"/></g>`)
  return `<defs>${m}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g>
    <g transform="${CAT_AT}">${cat(accent)}${catTail(accent, 6)}</g></g>`
}

// MODELO 3 — "Insignia": círculo con el perro (gato en negativo) y un aro naranja fino.
export const model3 = ({ art, accent, bg }) => {
  const id = uid(), clip = uid()
  const D = "translate(60 68) scale(.52) translate(-112 -118)"
  const m = mask(id, `${dogCuts(6)}<g transform="${CAT_AT}">${cat("#000")}</g>`)
  return `<defs>${m}<clipPath id="${clip}"><circle cx="60" cy="60" r="50"/></clipPath></defs>
    <circle cx="60" cy="60" r="55" fill="${art}"/>
    <circle cx="60" cy="60" r="58.2" fill="none" stroke="${accent}" stroke-width="2.4"/>
    <g clip-path="url(#${clip})"><g transform="${D}"><g mask="url(#${id})">${dog(bg, 330)}</g></g></g>`
}

// Versiones sueltas: solo perro y solo gato (un color, sin fondo) para íconos por tipo de mascota.
export const dogOnly = ({ art }) => {
  const id = uid()
  return `<defs>${mask(id, dogCuts(5))}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g></g>`
}
export const catOnly = ({ art }) => {
  const id = uid()
  const eyes = `<circle cx="21" cy="28" r="2.6" fill="#000"/><circle cx="39" cy="28" r="2.6" fill="#000"/>`
  return `<defs>${mask(id, eyes)}</defs><g transform="translate(26 6) scale(1.1)"><g mask="url(#${id})">${cat(art)}</g></g>`
}

export const variants = {
  color: { art: TEAL, accent: ORANGE, bg: CREAM, wordA: TEAL, wordB: ORANGE, slogan: "#3d5655", fond: null },
  claro: { art: CREAM, accent: ORANGE_LIGHT, bg: TEAL, wordA: CREAM, wordB: ORANGE_LIGHT, slogan: "#cfe9e5", fond: TEAL },
}
