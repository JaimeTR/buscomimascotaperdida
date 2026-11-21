import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { notifyNearbyUsers, type NotifiablePet } from '@/lib/notifications'
import { createClient } from '@/utils/supabase/server'
import {
    getSafeErrorCode,
    invalidPayloadResponse,
    methodNotAllowedResponse,
    parseJsonBody,
} from '@/lib/safe-error'

const bodySchema = z.object({ petId: z.string().uuid() }).strict()

// El cliente solo envía el id: nombre, ubicación y fotos se leen de la base, y solo el dueño puede disparar el aviso.
export async function POST(request: NextRequest) {
    try {
        const parsed = await parseJsonBody(request)
        const body = parsed.ok ? bodySchema.safeParse(parsed.body) : null
        if (!body?.success) return invalidPayloadResponse()

        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { data: pet } = await supabase
            .from('pets')
            .select('id, owner_id, name, type, breed, last_seen_district, last_seen_lat, last_seen_lng, image_urls, notified_at, status, colors, last_seen_date')
            .eq('id', body.data.petId)
            .eq('owner_id', user.id)
            .maybeSingle<NotifiablePet>()
        if (!pet) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

        const result = await notifyNearbyUsers(pet)
        if (result.error) {
            return NextResponse.json({ error: 'No se pudieron enviar las notificaciones' }, { status: 500 })
        }
        return NextResponse.json({ success: true, notified: result.notified })
    } catch (error: unknown) {
        console.error('notify-nearby-users API error', { code: getSafeErrorCode(error) })
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
export const OPTIONS = methodNotAllowedResponse
