// Datos y reglas del cartel. Sin React ni navegador: se puede probar con `node --test`.

export type TemplateId = 'alerta' | 'marca' | 'foto' | 'urgente' | 'encontrado'
export type FormatId = 'a4' | 'letter' | 'a3' | 'half' | 'story' | 'square'

// w/h en px de CSS. El cartel se dibuja a este tamaño y se escala para la vista previa.
// Papel: 96 dpi exactos. Imagen: se exporta al doble (story 1080x1920, square 1080x1080).
export const FORMATS: Record<FormatId, { label: string; hint: string; w: number; h: number; paper: boolean; page?: string; copies: number }> = {
    a4: { label: 'A4', hint: 'Imprimir o PDF', w: 794, h: 1122, paper: true, page: 'A4 portrait', copies: 1 },
    letter: { label: 'Carta', hint: 'Imprimir o PDF', w: 816, h: 1056, paper: true, page: 'letter portrait', copies: 1 },
    a3: { label: 'A3', hint: 'Vitrinas y postes', w: 1122, h: 1586, paper: true, page: 'A3 portrait', copies: 1 },
    half: { label: 'Media hoja', hint: '2 por hoja A4', w: 794, h: 561, paper: true, page: 'A4 portrait', copies: 2 },
    story: { label: 'Historia', hint: 'WhatsApp, Instagram 9:16', w: 540, h: 960, paper: false, copies: 1 },
    square: { label: 'Cuadrado', hint: 'Feed, Facebook 1:1', w: 540, h: 540, paper: false, copies: 1 },
}

export const TEMPLATES: Record<TemplateId, { label: string; hint: string; head: string; headText: string; accent: string }> = {
    alerta: { label: 'Alerta', hint: 'Amarillo de alto contraste', head: '#FFD600', headText: '#111111', accent: '#0f766e' },
    marca: { label: 'Marca', hint: 'Teal de la web', head: '#0f766e', headText: '#ffffff', accent: '#c2410c' },
    foto: { label: 'Foto completa', hint: 'La foto manda', head: '#c2410c', headText: '#ffffff', accent: '#FFD600' },
    urgente: { label: 'Urgente', hint: 'Rojo, para llamar la atención', head: '#b81e1e', headText: '#ffffff', accent: '#FFD600' },
    encontrado: { label: 'Encontrado', hint: 'Verde, busca a su dueño', head: '#1d724a', headText: '#ffffff', accent: '#FFD600' },
}

export const HEADLINES = ['SE BUSCA', 'PERDIDO', 'AYUDA URGENTE', 'ENCONTRADO', 'ENCONTRÉ A ESTA MASCOTA']

/** Cartel editable. Cadena vacía = ese bloque no se dibuja. */
export type PosterState = {
    template: TemplateId
    format: FormatId
    headline: string
    name: string
    photo: string
    details: string
    place: string
    reference: string
    phone: string
    whatsapp: string
    social: string
    reward: string
    note: string
    qr: boolean
    tabs: boolean
}

export type PetForPoster = {
    name: string | null
    type: string
    breed: string | null
    gender: string | null
    size: string | null
    colors: string[] | null
    markings: string | null
    status: string
    last_seen_district: string | null
    last_seen_department: string | null
    last_seen_address: string | null
    image_urls: string[] | null
}
export type ContactForPoster = { phone?: string | null; whatsapp?: string | null; instagram?: string | null }

/** "987654321" → "987 654 321". Lo demás se deja como lo escribió la persona. */
export function formatPhone(raw: string | null | undefined): string {
    const t = (raw ?? '').trim()
    const d = t.replace(/\D/g, '').replace(/^(0051|51)(?=9\d{8}$)/, '')
    return /^9\d{8}$/.test(d) ? d.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : t
}

const SIZES: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' }
const KINDS: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Mascota' }

export function templateForStatus(status: string): TemplateId {
    return status === 'found' ? 'encontrado' : 'alerta'
}

/** Cartel inicial de un reporte. El contacto ya viene filtrado por privacidad desde el servidor. */
export function defaultsFromPet(pet: PetForPoster, contact: ContactForPoster): PosterState {
    const found = pet.status === 'found'
    const kind = KINDS[pet.type] ?? 'Mascota'
    return {
        template: templateForStatus(pet.status),
        format: 'a4',
        headline: found ? 'ENCONTRADO' : 'SE BUSCA',
        name: pet.name || kind,
        photo: pet.image_urls?.[0] ?? '',
        details: [kind, pet.breed, ...(pet.colors ?? []), pet.size ? SIZES[pet.size] ?? pet.size : null].filter(Boolean).join(' · '),
        place: [pet.last_seen_district, pet.last_seen_department].filter(Boolean).join(', '),
        reference: pet.last_seen_address ?? '',
        phone: formatPhone(contact.phone),
        whatsapp: formatPhone(contact.whatsapp),
        social: contact.instagram ? '@' + contact.instagram.replace(/^@/, '') : '',
        reward: '',
        note: pet.markings ?? '',
        qr: true,
        tabs: false,
    }
}
