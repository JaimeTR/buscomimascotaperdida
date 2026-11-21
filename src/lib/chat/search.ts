import { norm, tokens } from './knowledge.ts'
import { PERU_LOCATIONS } from '../peru-locations.ts'

export type ChatFilters = { type?: string; size?: string; district?: string; color?: string; breed?: string }

export type ChatPet = {
    id: string
    name: string | null
    type: string
    breed: string | null
    status: string
    district: string | null
    date: string
    image: string | null
    lat: number | null
    lng: number | null
    colors: string[]
}

type Row = {
    id: string; name: string | null; type: string; breed: string | null; size: string | null; status: string
    colors: string[] | null; last_seen_district: string | null; last_seen_date: string
    image_urls: string[] | null; last_seen_lat: number | null; last_seen_lng: number | null
}

const DISTRICTS = [...new Set(Object.values(PERU_LOCATIONS.Lima).flat())]
const ALIASES: Record<string, string> = { surco: 'Santiago de Surco', sjl: 'San Juan de Lurigancho', sjm: 'San Juan de Miraflores', vmt: 'Villa María del Triunfo', ves: 'Villa El Salvador', smp: 'San Martín de Porres', cercado: 'Lima (Cercado)' }
const COLORS = ['negro', 'blanco', 'marron', 'gris', 'dorado', 'crema', 'naranja', 'beige', 'atigrado', 'canela', 'amarillo', 'carey']

/** Lee tipo, tamaño, distrito y color del texto libre. Solo detecta; nunca inventa. */
export function extractFilters(text: string): ChatFilters {
    const t = norm(text)
    const f: ChatFilters = {}
    if (/\b(perr[oa]s?|cachorr[oa]s?|can)\b/.test(t)) f.type = 'dog'
    else if (/\b(gat[oa]s?|minino|gatit[oa]s?)\b/.test(t)) f.type = 'cat'
    else if (/\b(conejo|hamster|cuy|ave|loro|tortuga)s?\b/.test(t)) f.type = 'other'
    if (/peque[ñn]o|chico|mini|toy/.test(t)) f.size = 'small'
    else if (/mediano/.test(t)) f.size = 'medium'
    else if (/\bgrande\b/.test(t)) f.size = 'large'
    const alias = Object.keys(ALIASES).find((a) => new RegExp(`\\b${a}\\b`).test(t))
    f.district = alias ? ALIASES[alias] : DISTRICTS.filter((d) => norm(d).length > 3).sort((a, b) => b.length - a.length).find((d) => t.includes(norm(d).replace(/ \(cercado\)/, '')))
    f.color = COLORS.find((c) => new RegExp(`\\b${c}\\b`).test(t))
    return Object.fromEntries(Object.entries(f).filter(([, v]) => v)) as ChatFilters
}

const district = (d: string | null) => norm(d ?? '')
const sameDistrict = (a: string | null, b: string) => {
    const x = district(a), y = norm(b)
    return Boolean(x) && (x.includes(y) || y.includes(x))
}

/** Puntúa cada reporte contra los filtros y las palabras del mensaje; devuelve los mejores. Sin criterios: los más recientes. */
export function rankPets(rows: Row[], filters: ChatFilters, text: string, limit = 5): ChatPet[] {
    const words = new Set(tokens(text))
    const hasCriteria = Object.keys(filters).length > 0 || words.size > 0
    const scored = rows.map((r) => {
        let score = 0
        if (filters.type && r.type === filters.type) score += 2
        if (filters.type && r.type !== filters.type) score -= 10 // otra especie nunca es una buena respuesta
        if (filters.size && r.size === filters.size) score += 1
        if (filters.district && sameDistrict(r.last_seen_district, filters.district)) score += 3
        if (filters.color && (r.colors ?? []).some((c) => norm(c) === norm(filters.color!))) score += 2
        if (filters.breed && r.breed && norm(r.breed).includes(norm(filters.breed))) score += 3
        const name = tokens(r.name ?? '')
        const breed = tokens(r.breed ?? '')
        for (const w of words) {
            if (name.includes(w)) score += 3
            if (breed.includes(w)) score += 2
        }
        return { r, score }
    })
    const picked = (hasCriteria ? scored.filter((s) => s.score > 0) : scored)
        .sort((a, b) => b.score - a.score || +new Date(b.r.last_seen_date) - +new Date(a.r.last_seen_date))
        .slice(0, limit)
    return picked.map(({ r }) => ({
        id: r.id,
        name: r.name ? r.name.replace(/\s+/g, ' ').slice(0, 40) : null,
        type: r.type,
        breed: r.breed ? r.breed.slice(0, 40) : null,
        status: r.status,
        district: r.last_seen_district,
        date: r.last_seen_date,
        image: r.image_urls?.[0] ?? null,
        lat: r.last_seen_lat,
        lng: r.last_seen_lng,
        colors: r.colors ?? [],
    }))
}
