// Rutas que exigen sesión (el proxy las corta en el servidor, sin parpadeo ni popups).
const PROTECTED = [/^\/dashboard(\/|$)/, /^\/reportar(\/|$)/, /^\/mascotas\/[^/]+\/avistamiento(\/|$)/]
const GUEST_ONLY = /^\/(login|register)\/?$/

export const isProtectedPath = (pathname: string) => PROTECTED.some((r) => r.test(pathname))
export const isGuestOnlyPath = (pathname: string) => GUEST_ONLY.test(pathname)

// Rutas que piden cuenta para actuar: el login muestra un aviso según el motivo.
export const loginReason = (pathname: string) => (pathname.startsWith("/dashboard") ? undefined : "report")
