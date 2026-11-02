// Siluetas base construidas con formas geométricas simples (se leen limpias a cualquier tamaño).
// Perro en lienzo 200x200 (base en y=200). Gato en lienzo 60x100 (base en y=100).

// Perro de perfil mirando a la derecha: cráneo redondo, hocico ancho con punta redondeada y cuello grueso.
// `base` = y inferior del cuello (200, o más para recortarlo con un círculo).
export const dog = (fill, base = 200) => `<g fill="${fill}">
  <path d="M58 118 C48 80 62 40 100 34 C116 32 128 40 134 52 C146 54 164 57 177 66 C187 74 185 91 172 96 C158 102 136 104 120 112 L112 130 Z"/>
  <path d="M60 100 C54 134 50 168 48 ${base} L142 ${base} C140 168 134 140 131 120 C130 114 126 108 120 106 L100 96 Z"/>
</g>`
// Oreja: línea abierta que cae desde la coronilla (no un óvalo cerrado) y ojo.
export const EAR_PATH = "M92 40 C122 44 126 84 112 110 C106 120 92 122 86 112"
export const EAR = { cx: 99, cy: 80, rx: 0, ry: 0, rot: 0 }
export const EYE = { cx: 140, cy: 68, r: 5.2 }
export const dogCuts = (ear = 4) => `
  <path d="${EAR_PATH}" fill="none" stroke="#000" stroke-width="${ear}" stroke-linecap="round"/>
  <circle cx="${EYE.cx}" cy="${EYE.cy}" r="${EYE.r}" fill="#000"/>`

// Gato sentado de frente: cabeza redonda con orejas triangulares, hombros y ancas.
export const cat = (fill, extra = "") => `<g fill="${fill}" ${extra}>
  <circle cx="30" cy="27" r="20"/>
  <path d="M11 22 L12 1 L28 10 Z"/>
  <path d="M49 22 L48 1 L32 10 Z"/>
  <path d="M17 42 C8 54 3 76 4 100 L56 100 C57 76 52 54 43 42 Z"/>
</g>`
export const catTail = (stroke, w = 5) => `<path d="M55 97 C74 96 76 72 65 62" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`
