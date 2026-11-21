// Reglas puras del flujo de reencuentro (con test).
const DAY = 86_400_000

export const REMIND_AFTER_DAYS = 7
export const REMIND_EVERY_DAYS = 14

export const ACTIVE_STATUSES = ["lost", "found", "in_contact"]

export function daysBetween(from: string | Date, to: string | Date = new Date()): number {
    return Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / DAY))
}

// ¿Toca preguntar "¿ya apareció?"? Solo casos activos, con 7+ días y sin recordatorio en los últimos 14.
export function reminderDue(p: { status: string; created_at: string; reminded_at?: string | null }, now: Date = new Date()): boolean {
    if (!ACTIVE_STATUSES.includes(p.status)) return false
    if (daysBetween(p.created_at, now) < REMIND_AFTER_DAYS) return false
    return !p.reminded_at || daysBetween(p.reminded_at, now) >= REMIND_EVERY_DAYS
}

export function reunionDays(p: { created_at: string; reunited_at?: string | null }): number | null {
    return p.reunited_at ? daysBetween(p.created_at, p.reunited_at) : null
}
