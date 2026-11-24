import 'server-only'
import { Resend } from 'resend'
import { assertServerEnv } from '@/lib/env'
import { getSafeErrorCode } from '@/lib/safe-error'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendPushToUsers } from '@/lib/push'
import { EMAIL_FROM } from '@/lib/email-from'

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Correo simple en español. Nunca lanza: un aviso fallido no debe romper la acción principal. */
export async function sendPlainEmail(to: string, subject: string, bodyHtml: string): Promise<boolean> {
    try {
        const { resendApiKey } = assertServerEnv()
        if (!resendApiKey || !to) return false
        const { error } = await new Resend(resendApiKey).emails.send({
            from: EMAIL_FROM,
            to,
            subject,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px">${bodyHtml}</div>`,
        })
        return !error
    } catch (e: unknown) {
        console.error('plain email failed', { code: getSafeErrorCode(e) })
        return false
    }
}

const appUrl = () => assertServerEnv().appUrl || 'http://localhost:3000'

/** Avisa al dueño (correo + push) de un avistamiento nuevo. Solo lo dispara quien lo reportó. */
export async function notifySightingOwner(sightingId: string, reporterId: string) {
    const admin = createAdminClient()
    const { data: s } = await admin.from('sightings')
        .select('id, pet_id, reporter_id, district, description, owner_notified_at').eq('id', sightingId).maybeSingle()
    if (!s || s.reporter_id !== reporterId) return { ok: false as const }
    // Reclamar primero: si la ruta se llama dos veces, solo una envía.
    const { data: claimed } = await admin.from('sightings')
        .update({ owner_notified_at: new Date().toISOString() }).eq('id', s.id).is('owner_notified_at', null).select('id')
    if (!claimed?.length) return { ok: true as const, sent: 0 }

    const { data: pet } = await admin.from('pets').select('id, name, owner_id').eq('id', s.pet_id).maybeSingle()
    if (!pet?.owner_id || pet.owner_id === reporterId) return { ok: true as const, sent: 0 }
    const { data: owner } = await admin.from('profiles').select('email, full_name').eq('id', pet.owner_id).maybeSingle()

    const link = `${appUrl()}/mascotas/${pet.id}`
    const name = pet.name || 'tu mascota'
    const where = s.district ? ` en ${esc(s.district)}` : ''
    let sent = 0
    if (owner?.email && await sendPlainEmail(owner.email, `Nuevo avistamiento de ${name}`,
        `<p>Hola ${esc(owner.full_name || '')},</p><p>Alguien reportó un avistamiento de <strong>${esc(name)}</strong>${where}.</p>` +
        (s.description ? `<blockquote>${esc(s.description.slice(0, 300))}</blockquote>` : '') +
        `<p><a href="${link}">Ver el avistamiento</a></p>`)) sent++
    sent += await sendPushToUsers([pet.owner_id], { title: `Avistamiento de ${name}`, body: `Alguien lo vio${s.district ? ` en ${s.district}` : ''}. Toca para ver los detalles.`, url: `/mascotas/${pet.id}` })
    return { ok: true as const, sent }
}

/** Correo al aportante cuando el equipo confirma su apoyo voluntario. */
export async function notifyBoostConfirmed(boostId: string) {
    const admin = createAdminClient()
    const { data: b } = await admin.from('pet_boosts').select('user_id, pet_id, amount_confirmed, ends_at').eq('id', boostId).maybeSingle()
    if (!b) return
    const [{ data: user }, { data: pet }] = await Promise.all([
        admin.from('profiles').select('email, full_name').eq('id', b.user_id).maybeSingle(),
        admin.from('pets').select('name').eq('id', b.pet_id).maybeSingle(),
    ])
    if (!user?.email) return
    const until = b.ends_at ? new Date(b.ends_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : ''
    await sendPlainEmail(user.email, '¡Gracias por tu apoyo!',
        `<p>Hola ${esc(user.full_name || '')},</p><p>Confirmamos tu apoyo de <strong>S/ ${Number(b.amount_confirmed ?? 0)}</strong>. ` +
        `El caso de <strong>${esc(pet?.name || 'tu mascota')}</strong> aparece destacado${until ? ` hasta el ${until}` : ''}.</p>` +
        `<p><a href="${appUrl()}/mascotas/${b.pet_id}">Ver el caso</a></p><p>Gracias por ayudar a que más mascotas vuelvan a casa.</p>`)
}

/** Aviso al equipo cuando alguien registra un aporte pendiente de verificar. Solo lo dispara el dueño del aporte. */
export async function notifyAdminBoost(boostId: string, userId: string) {
    const to = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
    if (!to) return false
    const admin = createAdminClient()
    const { data: claimed } = await admin.from('pet_boosts')
        .update({ admin_notified_at: new Date().toISOString() })
        .eq('id', boostId).eq('user_id', userId).is('admin_notified_at', null).select('amount_claimed')
    if (!claimed?.length) return false
    return sendPlainEmail(to, 'Nuevo aporte por verificar',
        `<p>Hay un aporte de <strong>S/ ${Number(claimed[0].amount_claimed)}</strong> pendiente de verificar.</p><p><a href="${appUrl()}/admin/impulsos">Abrir impulsos</a></p>`)
}

/** Aviso al equipo cuando llega un mensaje por el formulario de contacto. */
export async function notifyAdminContact(kind: string, name: string) {
    const to = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
    if (!to) return
    await sendPlainEmail(to, `Nuevo mensaje (${kind})`, `<p>${esc(name)} envió un mensaje de tipo <strong>${esc(kind)}</strong>.</p><p><a href="${appUrl()}/admin/mensajes">Abrir la bandeja</a></p>`)
}
