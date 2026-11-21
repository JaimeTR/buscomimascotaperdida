export type MatchPet = {
    id: string
    type: string
    status: string
    breed: string | null
    colors: string[] | null
    last_seen_district: string | null
    last_seen_date: string
}

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

/** Puntaje 0-100 de qué tan probable es que un perdido y un encontrado sean la misma mascota. 0 = no comparables. */
export function matchScore(a: MatchPet, b: MatchPet): number {
    if (a.id === b.id || a.type !== b.type || a.status === b.status) return 0
    const days = Math.abs(new Date(a.last_seen_date).getTime() - new Date(b.last_seen_date).getTime()) / 864e5
    if (days > 30) return 0
    let score = Math.round(30 * (1 - days / 30)) // cercanía en el tiempo
    if (a.last_seen_district && b.last_seen_district && norm(a.last_seen_district) === norm(b.last_seen_district)) score += 30
    const ca = new Set((a.colors ?? []).map(norm))
    const shared = (b.colors ?? []).filter((c) => ca.has(norm(c))).length
    if (ca.size && b.colors?.length) score += Math.round(25 * (shared / Math.max(ca.size, b.colors.length)))
    if (a.breed && b.breed && norm(a.breed) === norm(b.breed)) score += 15
    return score
}
