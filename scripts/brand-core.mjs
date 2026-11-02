// Fuente única de la identidad: colores, nombre, eslogan y el símbolo (lupa + huella).
export const TEAL = "#0f766e"
export const ORANGE = "#c2410c"
export const CREAM = "#faf8f3"
export const INK = "#0b2b2a"
export const MUTED = "#3d5655"

export const NAME = ["Busco mi", "mascota"]
export const SLOGAN = "Juntos, de vuelta a casa"

// Símbolo en viewBox 96x96. ring/paw/handle son colores.
export const symbol = ({ ring, paw, handle }) => `
  <circle cx="42" cy="42" r="30" fill="none" stroke="${ring}" stroke-width="8"/>
  <line x1="64" y1="64" x2="86" y2="86" stroke="${handle}" stroke-width="11" stroke-linecap="round"/>
  <g fill="${paw}">
    <ellipse cx="42" cy="51" rx="11.5" ry="9"/>
    <ellipse cx="27.5" cy="39.5" rx="4.6" ry="6.2" transform="rotate(-22 27.5 39.5)"/>
    <ellipse cx="36.5" cy="30.5" rx="4.6" ry="6.6"/>
    <ellipse cx="47.5" cy="30.5" rx="4.6" ry="6.6"/>
    <ellipse cx="56.5" cy="39.5" rx="4.6" ry="6.2" transform="rotate(22 56.5 39.5)"/>
  </g>`

export const symbolColor = symbol({ ring: TEAL, paw: TEAL, handle: ORANGE })
// Sobre fondo oscuro/teal: símbolo crema, mango naranja claro (contraste).
export const symbolLight = symbol({ ring: CREAM, paw: CREAM, handle: "#fdba74" })
