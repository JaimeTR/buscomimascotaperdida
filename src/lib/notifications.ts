import { Resend } from 'resend'
import { render } from '@react-email/render'
import { PetAlertEmail } from '@/emails/pet-alert-template'
import { assertServerEnv } from '@/lib/env'
import { getSafeErrorCode } from '@/lib/safe-error'
import { createAdminClient } from '@/utils/supabase/admin'

export type NotifiablePet = {
    id: string
    owner_id: string
    name: string | null
    type: string
    breed: string | null
    last_seen_district: string | null
    last_seen_lat: number | null
    last_seen_lng: number | null
    image_urls: string[] | null
    notified_at: string | null
}

type Target = { id: string; full_name: string | null; email: string; distance_km: number }

/**
 * Avisa por correo a los usuarios cuyo radio de alerta cubre el lugar del reporte.
 * El llamador debe haber verificado que el usuario es el dueño del reporte.
 */
export async function notifyNearbyUsers(pet: NotifiablePet) {
    try {
        const { resendApiKey, appUrl } = assertServerEnv()
        if (!resendApiKey) return { error: 'Email service not configured' }
        if (pet.last_seen_lat == null || pet.last_seen_lng == null) return { success: true, notified: 0 }

        const admin = createAdminClient()

        // Reclamar el envío primero: evita duplicados si la ruta se llama dos veces.
        const { data: claimed } = await admin
            .from('pets')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', pet.id)
            .is('notified_at', null)
            .select('id')
        if (!claimed?.length) return { success: true, notified: 0 }

        const { data, error } = await admin.rpc('notification_targets', {
            p_lat: pet.last_seen_lat,
            p_lng: pet.last_seen_lng,
            p_exclude: pet.owner_id,
        })
        const targets = (data ?? []) as Target[]
        if (error) {
            console.error('notification targets query failed', { code: getSafeErrorCode(error) })
            return { error: 'No se pudieron consultar los destinatarios' }
        }

        const resend = new Resend(resendApiKey)
        const reportUrl = `${appUrl || 'http://localhost:3000'}/mascotas/${pet.id}`
        let notified = 0

        for (const t of targets) {
            try {
                const html = await render(
                    PetAlertEmail({
                        reporterName: t.full_name || 'Vecino',
                        name: pet.name || 'Mascota',
                        type: pet.type,
                        breed: pet.breed || '',
                        lastSeenDistrict: pet.last_seen_district || '',
                        imageUrl: pet.image_urls?.[0],
                        reportUrl,
                    })
                )
                await resend.emails.send({
                    from: 'BuscoMiMascotaPerdida <notificaciones@buscomimascotaperdida.com>',
                    to: t.email,
                    subject: `Mascota perdida cerca de ti: ${pet.name || 'sin nombre'} en ${pet.last_seen_district || 'tu zona'}`,
                    html,
                })
                notified++
            } catch (e: unknown) {
                console.error('notification delivery failed', { code: getSafeErrorCode(e) })
            }
        }
        return { success: true, notified }
    } catch (error: unknown) {
        console.error('notifyNearbyUsers failed', { code: getSafeErrorCode(error) })
        return { error: 'No se pudieron enviar las notificaciones' }
    }
}
