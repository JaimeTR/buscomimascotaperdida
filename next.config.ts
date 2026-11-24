import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: { qualities: [75, 85, 90] },
  async redirects() {
    return [
      { source: '/promocionar', destination: '/anuncios', permanent: true },
      { source: '/login', destination: '/ingresar', permanent: true },
      { source: '/register', destination: '/registro', permanent: true },
      { source: '/forgot-password', destination: '/recuperar-contrasena', permanent: true },
      { source: '/update-password', destination: '/nueva-contrasena', permanent: true },
      { source: '/offline', destination: '/sin-conexion', permanent: true },
      { source: '/dashboard', destination: '/panel', permanent: true },
      { source: '/dashboard/reports', destination: '/panel/reportes', permanent: true },
      { source: '/dashboard/reports/:id/edit', destination: '/panel/reportes/:id/editar', permanent: true },
      { source: '/dashboard/messages', destination: '/panel/mensajes', permanent: true },
      { source: '/dashboard/settings', destination: '/panel/ajustes', permanent: true },
      {
        source: '/reporte',
        destination: '/reportar',
        permanent: true,
      },
      {
        source: '/reporte/:id',
        destination: '/mascotas/:id',
        permanent: true,
      },
    ]
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'self'",
          "form-action 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' data: https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          "worker-src 'self' blob:",
          "connect-src 'self' https://tiles.openfreemap.org https://nominatim.openstreetmap.org https://*.supabase.co wss://*.supabase.co https://api-inference.huggingface.co https://generativelanguage.googleapis.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
        ].join('; '),
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
      ...(process.env.NODE_ENV === 'production'
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
        : []),
    ]

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/:dir(img|brand|icons|screenshots|maplibre)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
