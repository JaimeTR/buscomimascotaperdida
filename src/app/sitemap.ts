import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/utils/supabase/public'

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://buscomimascotaperdida.com'
const pages: [string, number][] = [
    ['', 1], ['/mascotas', 0.9], ['/reportar', 0.8], ['/cartel', 0.6], ['/aliados', 0.5],
    ['/anuncios', 0.4], ['/promocionar', 0.4], ['/contacto', 0.5], ['/privacidad', 0.2], ['/terminos', 0.2], ['/cookies', 0.2], ['/libro-de-reclamaciones', 0.2],
]

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data } = await createPublicClient().from('pets').select('id, created_at').eq('is_hidden', false).order('created_at', { ascending: false }).limit(5000)
    return [
        ...pages.map(([p, priority]) => ({ url: base + p, priority })),
        ...(data ?? []).map((p) => ({ url: `${base}/mascotas/${p.id}`, lastModified: p.created_at, priority: 0.7 })),
    ]
}
