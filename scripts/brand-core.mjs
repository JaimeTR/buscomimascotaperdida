// Fuente única de la identidad: colores, nombre, eslogan y el símbolo.
// Símbolo: silueta sólida de un perro con un gato recortado en negativo (sirve para perros y gatos).
export const TEAL = "#0f766e"
export const ORANGE = "#c2410c"
export const ORANGE_LIGHT = "#fdba74"
export const CREAM = "#faf8f3"
export const INK = "#0b2b2a"
export const MUTED = "#3d5655"

export const NAME = ["Busco mi", "mascota"]
export const SLOGAN = "Juntos, de vuelta a casa"
export const VIEW = 120

// Perro de perfil mirando a la derecha, con base plana (coordenadas locales 20..95 x 21..112).
const DOG =
  "M22 112 C20 76 24 40 44 28 C52 22 64 21 71 27 C77 31 83 33 89 34 C93 35 94.5 40 92 44 C89 48 82 49 76 51 C71 53 68 58 68 64 C68 80 72 98 78 112 Z"
// Oreja caída (solo contorno) y ojo: huecos reales.
const EAR = "M47 29.5 C38.5 33.5 34.5 44 38 53 C40.5 58.5 47 59 51 54.5 C55 49.5 54.5 41 51 35 C49.8 32.3 48.5 30.8 47 29.5"
const EYE = { cx: 70, cy: 33.5, r: 2.6 }
// Gato sentado (orejas, cabeza, pecho), también hueco.
const CAT =
  "M40.5 78 L41 65 L48 71 C50.5 70.4 53 70.4 55.5 71 L62.5 65 L63 78 C63 84 58.5 87.5 54.5 88.5 C58.5 93 62.5 100 63.5 118 L32.5 118 C34.5 100 39.5 93 44.5 88.5 C42 86.5 40.5 82.5 40.5 78 Z"

// Una sola figura de un color; los huecos son de máscara, así funciona sobre cualquier fondo.
// Se centra en un viewBox 120x120 (escala 1.2 y desplazamiento).
let uid = 0
export const symbol = ({ art }) => {
  const id = `m${uid++}`
  return `
  <defs>
    <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
      <rect width="120" height="120" fill="#fff"/>
      <path d="${CAT}" fill="#000"/>
      <path d="${EAR}" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="${EYE.cx}" cy="${EYE.cy}" r="${EYE.r}" fill="#000"/>
    </mask>
  </defs>
  <g transform="translate(-9 -20) scale(1.2)"><g mask="url(#${id})"><path d="${DOG}" fill="${art}"/></g></g>`
}

export const symbolColor = symbol({ art: TEAL })
export const symbolLight = symbol({ art: CREAM })
