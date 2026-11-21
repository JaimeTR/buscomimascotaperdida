import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'

const memory = new Map<string, { count: number; reset: number }>()

/**
 * true = puede pasar. Con SUPABASE_SERVICE_ROLE_KEY usa la base (compartida entre instancias);
 * sin ella cae a memoria local (válido en desarrollo y en un solo servidor).
 */
export async function allowRequest(key: string, max: number, windowSeconds: number): Promise<boolean> {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
            const { data, error } = await createAdminClient().rpc('chat_rate_hit', { p_key: key, p_max: max, p_window_seconds: windowSeconds })
            if (!error && typeof data === 'boolean') return data
        } catch { /* si la base falla, no dejamos el chat sin límite: se usa el de memoria */ }
    }
    const now = Date.now()
    const rec = memory.get(key)
    if (!rec || now > rec.reset) {
        if (memory.size > 5000) memory.clear() // ponytail: tope de memoria; la base es el límite real en producción
        memory.set(key, { count: 1, reset: now + windowSeconds * 1000 })
        return true
    }
    return ++rec.count <= max
}
