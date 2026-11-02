// Símbolo definitivo (perro con el gato recortado en negativo) y versiones sueltas. viewBox 120x120.
import { TEAL, CREAM, ORANGE, ORANGE_LIGHT } from "./brand-core.mjs"
import { dog, dogCuts, cat } from "./brand-shapes.mjs"

let n = 0
const uid = () => `k${n++}`
const mask = (id, cuts) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="260" height="360"><rect x="-20" y="-20" width="260" height="360" fill="#fff"/>${cuts}</mask>`
const T = "translate(-7.5 -14) scale(.6)" // centra el perro (lienzo 200) en 120x120
const CAT_AT = "translate(94 200) scale(.8) translate(-30 -100)" // gato sentado en la base del pecho

// Perro de un solo color con el gato recortado (hueco) en su pecho.
export const symbol = ({ art, accent }) => {
  const id = uid()
  const m = mask(id, `${dogCuts()}<g transform="${CAT_AT}">${cat("#000")}</g>`)
  // Lupa pequeña dentro del pecho del gato (en coordenadas del gato): aro del color del perro y mango de acento.
  const lupa = `<g transform="${CAT_AT}"><circle cx="28" cy="65" r="8.6" fill="none" stroke="${art}" stroke-width="3.4"/>` +
    `<line x1="34.2" y1="71.2" x2="41.5" y2="78.5" stroke="${accent}" stroke-width="4.4" stroke-linecap="round"/></g>`
  return `<defs>${m}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g>${lupa}</g>`
}

// Versiones sueltas: solo perro y solo gato (un color) para íconos por tipo de mascota.
export const dogOnly = ({ art }) => {
  const id = uid()
  return `<defs>${mask(id, dogCuts())}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g></g>`
}
export const catOnly = ({ art }) => {
  const id = uid()
  const eyes = `<circle cx="21" cy="28" r="2.6" fill="#000"/><circle cx="39" cy="28" r="2.6" fill="#000"/>`
  return `<defs>${mask(id, eyes)}</defs><g transform="translate(26 6) scale(1.1)"><g mask="url(#${id})">${cat(art)}</g></g>`
}

export const variants = {
  color: { art: TEAL, accent: ORANGE, wordA: TEAL, wordB: ORANGE, slogan: "#3d5655", fond: null },
  claro: { art: CREAM, accent: ORANGE_LIGHT, wordA: CREAM, wordB: ORANGE_LIGHT, slogan: "#cfe9e5", fond: TEAL },
}
