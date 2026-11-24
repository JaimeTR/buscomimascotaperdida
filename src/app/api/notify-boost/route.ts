import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { notifyAdminBoost } from '@/lib/owner-alerts'
import { createClient } from '@/utils/supabase/server'
import { getSafeErrorCode, invalidPayloadResponse, methodNotAllowedResponse, parseJsonBody } from '@/lib/safe-error'

const bodySchema = z.object({ boostId: z.string().uuid() }).strict()

// Solo quien registró el aporte puede dispararlo; el contenido del aviso sale de la base.
export async function POST(request: NextRequest) {
    try {
        const parsed = await parseJsonBody(request)
        const body = parsed.ok ? bodySchema.safeParse(parsed.body) : null
        if (!body?.success) return invalidPayloadResponse()
        const { data: { user } } = await (await createClient()).auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        await notifyAdminBoost(body.data.boostId, user.id)
        return NextResponse.json({ ok: true })
    } catch (error: unknown) {
        console.error('notify-boost API error', { code: getSafeErrorCode(error) })
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
