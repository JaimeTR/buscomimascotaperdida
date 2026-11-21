import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendReunionReminderEmail } from '@/lib/email'
import { REMIND_AFTER_DAYS, REMIND_EVERY_DAYS } from '@/lib/reunion'

const DAY = 86_400_000

// Tarea programada (1 vez al día): pregunta "¿ya apareció?" a los dueños con casos activos de 7+ días.
// Protegida con CRON_SECRET: curl -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/cron/remind-owners
export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const now = Date.now()
    const { data: pets, error } = await admin
        .from('pets')
        .select('id, name, owner_id, profiles(email)')
        .in('status', ['lost', 'found', 'in_contact'])
        .eq('is_hidden', false)
        .lt('created_at', new Date(now - REMIND_AFTER_DAYS * DAY).toISOString())
        .or(`reminded_at.is.null,reminded_at.lt.${new Date(now - REMIND_EVERY_DAYS * DAY).toISOString()}`)
        .limit(50)
    if (error) return NextResponse.json({ error: 'Error al consultar' }, { status: 500 })

    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://buscomimascotaperdida.com'
    let sent = 0
    for (const pet of pets ?? []) {
        const profile = pet.profiles as unknown as { email: string | null } | null
        if (!profile?.email) continue
        try {
            await sendReunionReminderEmail(profile.email, pet.name || 'tu mascota', `${base}/panel/reportes`)
            await admin.from('pets').update({ reminded_at: new Date().toISOString() }).eq('id', pet.id)
            sent++
        } catch {
            console.error('reunion reminder failed') // se reintenta en la próxima corrida
        }
    }
    return NextResponse.json({ checked: pets?.length ?? 0, sent })
}
