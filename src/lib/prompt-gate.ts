// Avisos flotantes (instalar app, reportar, caso destacado, asistente) sin ser invasivos:
// - al cerrarlos no vuelven a salir hasta pasadas 24 horas (guardado en este navegador);
// - nunca hay dos a la vez: el que llega segundo espera y, si no hay lugar, simplemente no se muestra.
const DAY = 24 * 60 * 60 * 1000
const PREFIX = "bmm.prompt."
let active: string | null = null

export function dismissedToday(key: string): boolean {
    try {
        const t = Number(localStorage.getItem(PREFIX + key))
        return t === Infinity || (t > 0 && Date.now() - t < DAY)
    } catch { return false }
}

/** Marca el aviso como cerrado: 24 h, o para siempre si `forever` (p. ej. ya instaló la app). */
export function markDismissed(key: string, forever = false) {
    try { localStorage.setItem(PREFIX + key, forever ? "Infinity" : String(Date.now())) } catch { /* sin storage */ }
}

/** Pide el único lugar para mostrar un aviso. Devuelve false si ya hay otro visible o si se cerró hoy. */
export function claimPrompt(key: string): boolean {
    if (dismissedToday(key) || (active && active !== key)) return false
    active = key
    return true
}

export function releasePrompt(key: string) {
    if (active === key) active = null
}
