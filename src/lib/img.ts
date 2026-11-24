// next/image solo optimiza orígenes permitidos (ver images.remotePatterns en next.config.ts).
// Las fotos de fuentes externas (casos importados) se sirven tal cual para no romperlas.
export const canOptimize = (url: string) => url.startsWith("/") || /^https:\/\/[a-z0-9-]+\.supabase\.co\//.test(url)
