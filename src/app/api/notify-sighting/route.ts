import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { notifySightingOwner } from '@/lib/owner-alerts'
import { createClient } from '@/utils/supabase/server'
import { getSafeErrorCode, invalidPayloadResponse, methodNotAllowedResponse, parseJsonBody } from '@/lib/safe-error'

const bodySchema = z.object({ sightingId: z.string().uuid() }).strict()

// Solo quien reportó el avistamiento puede dispararlo; el contenido del aviso sale de la base.
export async function POST(request: NextRequest) {
    try {
        const parsed = await parseJsonBody(request)
        const body = parsed.ok ? bodySchema.safeParse(parsed.body) : null
        if (!body?.success) return invalidPayloadResponse()
        const { data: { user } } = await (await createClient()).auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const r = await notifySightingOwner(body.data.sightingId, user.id)
        return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : 403 })
    } catch (error: unknown) {
        console.error('notify-sighting API error', { code: getSafeErrorCode(error) })
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
