// Siluetas base (se leen limpias a cualquier tamaño).
// Perro en lienzo 200x200 (base en y=200). Gato en lienzo 60x100 (base en y=100).

// Oscurece un color hex multiplicando sus canales (para la oreja, un tono más profundo que la cabeza).
const shade = (hex, f) =>
  "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("")
const isLight = (hex) => [1, 3, 5].reduce((s, i) => s + parseInt(hex.slice(i, i + 2), 16), 0) > 450

// Perro de perfil mirando a la derecha: cráneo redondo, frente suave, hocico de retriever con nariz marcada,
// oreja caída rellena (tono más oscuro) y cuello grueso. `base` = y inferior (más largo para recortar con un círculo).
export const dog = (fill, base = 200) => {
  const ear = shade(fill, isLight(fill) ? 0.88 : 0.78)
  return `<g fill="${fill}">
  <path d="M60 124 C58 100 55 66 70 48 C79 38 88 34 98 33 C118 30 133 40 138 54 C150 55 160 57 168 60 L172 96 C158 98 146 100 134 104 C128 108 124 114 122 122 L100 134 Z"/>
  <ellipse cx="168" cy="78" rx="15" ry="18"/>
  <path d="M60 124 C57 146 55 170 53 ${base} L140 ${base} C139 168 134 140 131 122 C130 114 126 108 120 106 L100 96 Z"/>
  <ellipse cx="179.5" cy="72" rx="6.2" ry="8" fill="${ear}"/>
  <path fill="${ear}" d="M90 40 C112 40 121 66 117 94 C115 112 99 120 89 110 C81 102 83 80 83 66 C83 52 85 44 90 40 Z"/>
</g>`
}
export const EYE = { cx: 130, cy: 58, r: 5.2 }
// Huecos del perro: ojo y línea de la boca.
export const dogCuts = () => `
  <circle cx="${EYE.cx}" cy="${EYE.cy}" r="${EYE.r}" fill="#000"/>
  <path d="M168 90 C156 93 148 91 141 84" fill="none" stroke="#000" stroke-width="2.8" stroke-linecap="round"/>`

// Gato sentado de frente: cabeza redonda con orejas triangulares, hombros y ancas.
export const cat = (fill, extra = "") => `<g fill="${fill}" ${extra}>
  <circle cx="30" cy="27" r="20"/>
  <path d="M11 22 L12 1 L28 10 Z"/>
  <path d="M49 22 L48 1 L32 10 Z"/>
  <path d="M17 42 C8 54 3 76 4 100 L56 100 C57 76 52 54 43 42 Z"/>
</g>`
export const catTail = (stroke, w = 5) => `<path d="M55 97 C74 96 76 72 65 62" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`
