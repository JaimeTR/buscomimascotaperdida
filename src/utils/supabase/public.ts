import { createClient } from '@supabase/supabase-js'

// Cliente anónimo sin cookies: sirve para leer datos públicos (anuncios, aliados) en páginas
// que se pueden cachear (ISR). Nunca se usa para datos de un usuario; RLS limita lo que devuelve.
export function createPublicClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !key) throw new Error('Missing Supabase public environment variables')
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
