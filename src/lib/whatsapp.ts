/**
 * Enlace https://wa.me con mensaje prellenado. Acepta números peruanos escritos de cualquier forma
 * ("987 654 321", "+51 987654321", "0051987654321"). Devuelve null si no parece un celular válido.
 */
export function whatsappLink(raw: string | null | undefined, message?: string): string | null {
    let digits = (raw ?? '').replace(/\D/g, '').replace(/^00/, '')
    if (/^9\d{8}$/.test(digits)) digits = '51' + digits // celular peruano sin código de país
    if (digits.length < 10 || digits.length > 15) return null // E.164: 10-15 dígitos con código de país
    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
