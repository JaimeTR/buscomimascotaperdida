import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/utils/supabase/public'
import { SPECIES, slugify } from '@/lib/seo-zones'

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://buscomimascotaperdida.com'
const pages: [string, number][] = [
    ['', 1], ['/mascotas', 0.9], ['/reportar', 0.8], ['/cartel', 0.6], ['/aliados', 0.5],
    ['/guias', 0.7], ['/transparencia', 0.4], ['/casos-de-exito', 0.6], ['/anuncios', 0.4], ['/contacto', 0.5], ['/privacidad', 0.2], ['/terminos', 0.2], ['/cookies', 0.2], ['/libro-de-reclamaciones', 0.2],
    ...Object.keys(SPECIES).map((s): [string, number] => [`/mascotas/especie/${s}`, 0.6]),
]

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const db = createPublicClient()
    // Los casos reencontrados viven en /casos-de-exito, no se repiten como casos activos.
    const { data } = await db.from('pets').select('id, created_at, last_seen_district').eq('is_hidden', false).neq('status', 'reunited').order('created_at', { ascending: false }).limit(5000)
    const { data: partners } = await db.from('partners').select('id').eq('is_active', true).limit(500)
    const { data: stories } = await db.from('pets').select('id, reunited_at').eq('status', 'reunited').eq('reunion_public', true).eq('is_hidden', false).limit(1000)
    // Solo distritos que tienen casos: una página vacía no aporta nada al buscador.
    const districts = Array.from(new Set((data ?? []).map((p) => p.last_seen_district).filter(Boolean) as string[]))
    return [
        ...pages.map(([p, priority]) => ({ url: base + p, priority })),
        ...districts.map((d) => ({ url: `${base}/mascotas/distrito/${slugify(d)}`, priority: 0.6 })),
        ...(data ?? []).map((p) => ({ url: `${base}/mascotas/${p.id}`, lastModified: p.created_at, priority: 0.7 })),
        ...(partners ?? []).map((p) => ({ url: `${base}/aliados/${p.id}`, priority: 0.5 })),
        ...(stories ?? []).map((p) => ({ url: `${base}/casos-de-exito/${p.id}`, lastModified: p.reunited_at ?? undefined, priority: 0.6 })),
    ]
}
