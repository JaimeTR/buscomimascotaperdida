import 'server-only'
import * as webpush from 'web-push'
import { createAdminClient } from '@/utils/supabase/admin'
import { getSafeErrorCode } from '@/lib/safe-error'

export type PushPayload = { title: string; body: string; url: string }

/** Envía una notificación push a todos los dispositivos de estos usuarios. Devuelve cuántos recibieron. */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<number> {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
    const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
    if (!publicKey || !privateKey || !userIds.length) return 0 // push es opcional: sin claves, no hace nada
    webpush.setVapidDetails(process.env.VAPID_SUBJECT?.trim() || 'mailto:contacto@buscomimascotaperdida.com', publicKey, privateKey)

    const admin = createAdminClient()
    const { data: subs } = await admin.from('push_subscriptions').select('endpoint, p256dh, auth').in('user_id', userIds)
    let sent = 0
    for (const s of subs ?? []) {
        try {
            await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload))
            sent++
        } catch (e: unknown) {
            const status = (e as { statusCode?: number }).statusCode
            if (status === 404 || status === 410) await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint) // suscripción caducada
            else console.error('push delivery failed', { code: getSafeErrorCode(e) })
        }
    }
    return sent
}
