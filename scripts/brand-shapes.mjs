// Siluetas base (se leen limpias a cualquier tamaño).
// Perro en lienzo 200x200 (base en y=200). Gato en lienzo 60x100 (base en y=100).

// Oscurece un color hex multiplicando sus canales (para la oreja, un tono más profundo que la cabeza).
const shade = (hex, f) =>
  "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("")
const isLight = (hex) => [1, 3, 5].reduce((s, i) => s + parseInt(hex.slice(i, i + 2), 16), 0) > 450

// Perro de perfil mirando a la derecha: cráneo redondo, frente suave, hocico de retriever con nariz marcada,
// oreja caída rellena (tono más oscuro) y cuello grueso. `base` = y inferior (más largo para recortar con un círculo).
// y inferior del cuello del perro (más corto que antes) y su ancho en la base: x 40..152.
export const BASE = 182
// mono = versión de un solo color (blanco/negro): la oreja y la nariz no llevan tono propio, se marcan como huecos.
export const dog = (fill, base = BASE, mono = false) => {
  const ear = shade(fill, isLight(fill) ? 0.88 : 0.78)
  return `<g fill="${fill}">
  <path d="M60 124 C58 100 55 66 70 48 C79 38 88 34 98 33 C118 30 133 40 138 54 C150 55 160 57 168 60 L172 96 C158 98 146 100 134 104 C128 108 124 114 122 122 L100 134 Z"/>
  <ellipse cx="168" cy="78" rx="15" ry="18"/>
  <path d="M60 124 C56 146 50 168 40 ${base} L152 ${base} C148 168 137 142 131 122 C130 114 126 108 120 106 L100 96 Z"/>
  ${mono ? "" : `<ellipse cx="179.5" cy="72" rx="6.2" ry="8" fill="${ear}"/>`}
  ${mono ? "" : `<path fill="${ear}" d="M90 40 C111 40 120 60 116 83 C114 98 99 104 90 97 C82 91 84 76 84 64 C84 52 86 44 90 40 Z"/>`}
</g>`
}
export const EYE = { cx: 130, cy: 58, r: 5.2 }
// Huecos del perro: ojo y línea de la boca.
export const dogCuts = (mono = false) => `
  ${mono ? `<path d="M90 40 C111 40 120 60 116 83 C114 98 99 104 90 97 C82 91 84 76 84 64 C84 52 86 44 90 40 Z" fill="none" stroke="#000" stroke-width="3.4" stroke-linejoin="round"/><ellipse cx="179.5" cy="72" rx="6.2" ry="8" fill="#000"/>` : ""}
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
