import { Resend } from 'resend'
import { render } from '@react-email/render'
import { PetAlertEmail } from '@/emails/pet-alert-template'
import { assertServerEnv } from '@/lib/env'
import { getSafeErrorCode } from '@/lib/safe-error'
import { createAdminClient } from '@/utils/supabase/admin'
import { matchScore } from '@/lib/matches'
import { sendPushToUsers } from '@/lib/push'

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
    status: string
    colors: string[] | null
    last_seen_date: string
}

type Target = { id: string; full_name: string | null; email: string; distance_km: number }

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Avisa a los dueños de reportes opuestos (perdido <-> encontrado) que parecen ser la misma mascota. */
async function notifyMatchOwners(pet: NotifiablePet, admin: ReturnType<typeof createAdminClient>, resendApiKey: string, appUrl?: string) {
    try {
        const { data: candidates } = await admin
            .from('pets')
            .select('id, owner_id, name, type, status, breed, colors, last_seen_district, last_seen_date')
            .eq('type', pet.type)
            .eq('status', pet.status === 'found' ? 'lost' : 'found')
            .eq('is_hidden', false)
            .not('owner_id', 'is', null)
            .neq('owner_id', pet.owner_id)
            .order('last_seen_date', { ascending: false })
            .limit(100)
        const top = (candidates ?? [])
            .map((c) => ({ c, score: matchScore(pet, c) }))
            .filter((m) => m.score >= 60) // un poco más estricto que en la ficha: esto sí envía correo
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
        if (!top.length) return 0

        const resend = new Resend(resendApiKey)
        const link = `${appUrl || 'http://localhost:3000'}/mascotas/${pet.id}`
        const verb = pet.status === 'found' ? 'encontrado' : 'perdido'
        let sent = 0
        for (const { c } of top) {
            const { data: owner } = await admin.from('profiles').select('email, full_name').eq('id', c.owner_id).maybeSingle()
            if (!owner?.email) continue
            try {
                await resend.emails.send({
                    from: 'BuscoMiMascotaPerdida <notificaciones@buscomimascotaperdida.com>',
                    to: owner.email,
                    subject: `Posible coincidencia para ${c.name || 'tu mascota'}`,
                    html: `<p>Hola ${esc(owner.full_name || '')},</p>` +
                        `<p>Se reportó un caso ${verb} que podría ser <strong>${esc(c.name || 'tu mascota')}</strong>` +
                        `${pet.last_seen_district ? ` en ${esc(pet.last_seen_district)}` : ''}.</p>` +
                        `<p><a href="${link}">Ver el reporte</a></p><p>Si no es tu mascota, puedes ignorar este mensaje.</p>`,
                })
                sent++
            } catch (e: unknown) {
                console.error('match notification failed', { code: getSafeErrorCode(e) })
            }
        }
        return sent
    } catch (error: unknown) {
        console.error('notifyMatchOwners failed', { code: getSafeErrorCode(error) })
        return 0
    }
}

/**
 * Avisa por correo a los usuarios cuyo radio de alerta cubre el lugar del reporte.
 * El llamador debe haber verificado que el usuario es el dueño del reporte.
 */
export async function notifyNearbyUsers(pet: NotifiablePet) {
    try {
        const { resendApiKey, appUrl } = assertServerEnv()
        if (!resendApiKey) return { error: 'Email service not configured' }
        const admin = createAdminClient()

        // Reclamar el envío primero: evita duplicados si la ruta se llama dos veces.
        const { data: claimed } = await admin
            .from('pets')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', pet.id)
            .is('notified_at', null)
            .select('id')
        if (!claimed?.length) return { success: true, notified: 0 }

        const matched = await notifyMatchOwners(pet, admin, resendApiKey, appUrl)
        if (pet.last_seen_lat == null || pet.last_seen_lng == null) return { success: true, notified: 0, matched }

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
        const where = pet.last_seen_district ? ` en ${pet.last_seen_district}` : ' cerca de ti'
        await sendPushToUsers(targets.map((t) => t.id), {
            title: pet.status === 'found' ? 'Mascota encontrada cerca' : 'Mascota perdida cerca',
            body: `${pet.name || 'Una mascota'}${where}. Toca para ver el reporte.`,
            url: `/mascotas/${pet.id}`,
        })
        return { success: true, notified, matched }
    } catch (error: unknown) {
        console.error('notifyNearbyUsers failed', { code: getSafeErrorCode(error) })
        return { error: 'No se pudieron enviar las notificaciones' }
    }
}
