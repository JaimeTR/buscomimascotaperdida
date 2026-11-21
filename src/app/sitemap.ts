import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/utils/supabase/public'

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://buscomimascotaperdida.com'
const pages = ['', '/mascotas', '/reportar', '/cartel', '/aliados', '/anuncios', '/promocionar', '/contacto']

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data } = await createPublicClient().from('pets').select('id, created_at').eq('is_hidden', false).limit(5000)
    return [
        ...pages.map((p) => ({ url: base + p })),
        ...(data ?? []).map((p) => ({ url: `${base}/mascotas/${p.id}`, lastModified: p.created_at })),
    ]
}
