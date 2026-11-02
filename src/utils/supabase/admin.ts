import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con service_role: salta RLS. Solo para código de servidor que ya autorizó al usuario.
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
