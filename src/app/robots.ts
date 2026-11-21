import type { MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://buscomimascotaperdida.com'

export default function robots(): MetadataRoute.Robots {
    return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/api', '/auth'] }, sitemap: `${base}/sitemap.xml` }
}
