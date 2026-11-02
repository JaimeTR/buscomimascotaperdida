// Tres modelos de símbolo (perro + gato + lupa pequeña). Todos en viewBox 120x120.
// Cada modelo recibe { art, accent, bg }: art = color principal, accent = naranja, bg = color opuesto (modelo 3).
import { TEAL, CREAM, ORANGE, ORANGE_LIGHT } from "./brand-core.mjs"
import { dog, dogCuts, cat, catTail, EYE, EAR_PATH } from "./brand-shapes.mjs"

let n = 0
const uid = () => `k${n++}`
const mask = (id, cuts) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="260" height="360"><rect x="-20" y="-20" width="260" height="360" fill="#fff"/>${cuts}</mask>`
const cut = `fill="none" stroke="#000" stroke-linecap="round"`
const T = "translate(-7.5 -14) scale(.6)" // centra el perro (lienzo 200) en 120x120

// MODELO 1 — "Lupa en el pecho": una lupa pequeña (aro hueco + mango naranja) enmarca al gato sobre el pecho.
export const model1 = ({ art, accent }) => {
  const id = uid()
  const L = { x: 92, y: 160, r: 28 }
  const m = mask(id, `${dogCuts(5)}
    <circle cx="${L.x}" cy="${L.y}" r="${L.r}" ${cut} stroke-width="6"/>
    <g transform="translate(${L.x} ${L.y}) scale(.4) translate(-30 -52)">${cat("#000")}</g>
    <line x1="112" y1="180" x2="127" y2="193" ${cut} stroke-width="22"/>`)
  return `<defs>${m}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g>
    <line x1="112" y1="180" x2="127" y2="193" stroke="${accent}" stroke-width="11" stroke-linecap="round"/></g>`
}

// MODELO 2 — "Dúo": perro y gato naranja lado a lado (separados por un borde); el ojo del perro es una mini lupa.
export const model2 = ({ art, accent }) => {
  const id = uid()
  const C = "translate(92 200) scale(.62) translate(-30 -100)"
  const m = mask(id, `
    <path d="${EAR_PATH}" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${EYE.cx}" cy="${EYE.cy}" r="7.6" ${cut} stroke-width="3.2"/>
    <line x1="145.6" y1="73.6" x2="153" y2="81" ${cut} stroke-width="4.4"/>
    <g transform="${C}">${cat("#000", 'stroke="#000" stroke-width="15" stroke-linejoin="round"')}<path d="M55 97 C74 96 76 72 65 62" ${cut} stroke-width="19"/></g>`)
  return `<defs>${m}</defs><g transform="${T}"><g mask="url(#${id})">${dog(art)}</g>
    <g transform="${C}">${cat(accent)}${catTail(accent, 6)}</g></g>`
}

// MODELO 3 — "Insignia": círculo con el perro (gato en negativo) y una lupa naranja pequeña en la esquina.
export const model3 = ({ art, accent, bg }) => {
  const id = uid(), clip = uid(), badge = uid()
  const D = "translate(58 66) scale(.52) translate(-112 -118)"
  const m = mask(id, `${dogCuts(6)}<g transform="translate(92 200) scale(.62) translate(-30 -100)">${cat("#000")}</g>`)
  const bm = mask(badge, `<circle cx="96" cy="96" r="17.5" fill="#000"/><line x1="104" y1="104" x2="112" y2="112" ${cut} stroke-width="14"/>`)
  return `<defs>${m}${bm}<clipPath id="${clip}"><circle cx="58" cy="58" r="50.5"/></clipPath></defs>
    <g mask="url(#${badge})"><circle cx="58" cy="58" r="54" fill="${art}"/>
      <g clip-path="url(#${clip})"><g transform="${D}"><g mask="url(#${id})">${dog(bg, 330)}</g></g></g></g>
    <circle cx="96" cy="96" r="10.5" fill="none" stroke="${accent}" stroke-width="5.2"/>
    <line x1="103.5" y1="103.5" x2="112" y2="112" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>`
}

export const variants = {
  color: { art: TEAL, accent: ORANGE, bg: CREAM, wordA: TEAL, wordB: ORANGE, slogan: "#3d5655", fond: null },
  claro: { art: CREAM, accent: ORANGE_LIGHT, bg: TEAL, wordA: CREAM, wordB: ORANGE_LIGHT, slogan: "#cfe9e5", fond: TEAL },
}
