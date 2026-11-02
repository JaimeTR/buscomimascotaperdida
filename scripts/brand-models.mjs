// Tres modelos de símbolo (perro + gato + una lupa pequeña). Todos en viewBox 120x120.
// Cada modelo recibe { art, accent, bg }: art = color principal, accent = naranja, bg = fondo opuesto (modelo 3).
import { TEAL, CREAM, ORANGE, ORANGE_LIGHT } from "./brand-core.mjs"

// Perro tipo labrador, de perfil a la derecha: cráneo redondeado, stop marcado, hocico y papada.
const DOG =
  "M28 112 C30 96 34 80 36 66 C36 56 36 46 40 38 C46 28 58 22 70 25 C76 27 79 31 82 35 C86 34.5 92 34 95.5 37.5 C98 40.5 97.5 45.5 94 47.5 C90 49.5 84.5 49 80.5 52 C76.5 55 74.8 58 74.2 62 C73.5 70 76 80 80 90 C83 98 85 106 86 112 Z"
// Igual pero largo hacia abajo (se recorta con el círculo en el modelo 3).
const DOG_LONG =
  "M27 160 L28 112 C30 96 34 80 36 66 C36 56 36 46 40 38 C46 28 58 22 70 25 C76 27 79 31 82 35 C86 34.5 92 34 95.5 37.5 C98 40.5 97.5 45.5 94 47.5 C90 49.5 84.5 49 80.5 52 C76.5 55 74.8 58 74.2 62 C73.5 70 76 80 80 90 C83 98 85 106 86 112 L87 160 Z"
const EAR = "M54 28 C45 31 40 42 42 55 C43.5 63 49 65 54 60 C58.5 55.5 60 45 58 37 C57 32 56 29.5 54 28"
const EYE = { cx: 73, cy: 33 }
// Gato sentado: orejas puntiagudas, cabeza redonda con mejillas, pecho y lomo.
const CAT =
  "M40 76 L41 62 L47.5 67.5 C50 66.8 52.5 66.8 55 67.5 L61.5 62 L62.5 76 C62.5 81.5 59 84.5 55.5 85.5 C60.5 90 63.5 99 64 118 L32 118 C32.5 108 35.5 98.5 41 91 C43 88.4 44.8 86.8 46.5 85.5 C42.8 83.5 40 80.5 40 76 Z"
const TAIL = "M35 117 C27.5 112 26.5 99 33 92"

const uid = (() => { let i = 0; return () => `k${i++}` })()
const holes = (items) => items.join("")
const maskDef = (id, content) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="200" height="200"><rect x="-20" y="-20" width="200" height="200" fill="#fff"/>${content}</mask>`
const blk = `fill="none" stroke="#000" stroke-linecap="round"`
const T = "translate(-9 -18) scale(1.2)" // centra el perro en 120x120

// MODELO 1 — "Lupa en el pecho": la lupa pequeña (aro hueco + mango naranja) enmarca al gato sobre el pecho del perro.
export const model1 = ({ art, accent }) => {
  const id = uid()
  const lens = { x: 57, y: 90, r: 14.5 }
  const catIn = `translate(${lens.x} ${lens.y}) scale(.46) translate(-48 -92)`
  const mask = maskDef(id,
    holes([
      `<path d="${EAR}" ${blk} stroke-width="2.4"/>`,
      `<circle cx="${EYE.cx}" cy="${EYE.cy}" r="2.7" fill="#000"/>`,
      `<circle cx="${lens.x}" cy="${lens.y}" r="${lens.r}" ${blk} stroke-width="3.2"/>`,
      `<path d="${CAT}" fill="#000" transform="${catIn}"/>`,
      `<line x1="67.5" y1="100.5" x2="77.5" y2="109.5" ${blk} stroke-width="10.5"/>`,
    ]))
  return `<defs>${mask}</defs><g transform="${T}"><g mask="url(#${id})"><path d="${DOG}" fill="${art}"/></g>
    <line x1="67.5" y1="100.5" x2="77.5" y2="109.5" stroke="${accent}" stroke-width="6" stroke-linecap="round"/></g>`
}

// MODELO 2 — "Dúo": perro teal y gato naranja (positivos, separados por un hueco). El ojo del perro es una mini lupa.
export const model2 = ({ art, accent }) => {
  const id = uid()
  const C2 = "translate(58 114) scale(.72) translate(-48 -118)"
  const mask = maskDef(id,
    holes([
      `<path d="${EAR}" ${blk} stroke-width="2.4"/>`,
      `<path d="${CAT}" fill="#000" stroke="#000" stroke-width="6" stroke-linejoin="round" transform="${C2}"/>`,
      `<path d="${TAIL}" ${blk} stroke-width="9" transform="${C2}"/>`,
      `<circle cx="${EYE.cx}" cy="${EYE.cy}" r="4.6" ${blk} stroke-width="1.8"/>`,
      `<line x1="76.6" y1="36.6" x2="80.4" y2="40.4" ${blk} stroke-width="2.4"/>`,
    ]))
  return `<defs>${mask}</defs><g transform="${T}"><g mask="url(#${id})"><path d="${DOG}" fill="${art}"/></g>
    <g transform="${C2}"><path d="${CAT}" fill="${accent}"/><path d="${TAIL}" fill="none" stroke="${accent}" stroke-width="3.6" stroke-linecap="round"/></g></g>`
}

// MODELO 3 — "Insignia": círculo con el perro (gato en negativo); lupa naranja pequeña en la esquina inferior derecha.
export const model3 = ({ art, accent, bg }) => {
  const id = uid(), clip = uid(), badge = uid()
  const D = "translate(58 66) scale(.9) translate(-57 -70)"
  const mask = maskDef(id,
    holes([
      `<path d="${EAR}" ${blk} stroke-width="2.6"/>`,
      `<path d="${CAT}" fill="#000"/>`,
      `<circle cx="${EYE.cx}" cy="${EYE.cy}" r="2.8" fill="#000"/>`,
    ]))
  const badgeMask = maskDef(badge, `<circle cx="96" cy="96" r="17.5" fill="#000"/><line x1="104" y1="104" x2="112" y2="112" ${blk} stroke-width="14"/>`)
  return `<defs>${mask}${badgeMask}<clipPath id="${clip}"><circle cx="58" cy="58" r="50.5"/></clipPath></defs>
    <g mask="url(#${badge})"><circle cx="58" cy="58" r="54" fill="${art}"/>
      <g clip-path="url(#${clip})"><g transform="${D}"><g mask="url(#${id})"><path d="${DOG_LONG}" fill="${bg}"/></g></g></g></g>
    <circle cx="96" cy="96" r="10.5" fill="none" stroke="${accent}" stroke-width="5.2"/>
    <line x1="103.5" y1="103.5" x2="112" y2="112" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>`
}

export const variants = {
  color: { art: TEAL, accent: ORANGE, bg: CREAM, wordA: TEAL, wordB: ORANGE, slogan: "#3d5655", fond: null },
  claro: { art: CREAM, accent: ORANGE_LIGHT, bg: TEAL, wordA: CREAM, wordB: ORANGE_LIGHT, slogan: "#cfe9e5", fond: TEAL },
}
// El modelo 3 necesita lo contrario del color principal para el perro: en "color" el círculo es teal y el perro crema.
