import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { allowRequest } from '@/lib/rate-limit'
import { createPublicClient } from '@/utils/supabase/public'
import { getSafeErrorCode, invalidPayloadResponse, methodNotAllowedResponse, parseJsonBody } from '@/lib/safe-error'

const bodySchema = z.object({ id: z.string().uuid(), kind: z.enum(['view', 'click']) }).strict()

// Cuenta una visita o un clic en la ficha de un aliado. Límite por IP para que no se infle a propósito.
export async function POST(request: NextRequest) {
    try {
        const parsed = await parseJsonBody(request)
        const body = parsed.ok ? bodySchema.safeParse(parsed.body) : null
        if (!body?.success) return invalidPayloadResponse()
        const ip = (request.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim()
        if (!(await allowRequest(`partner-hit:${ip}:${body.data.id}`, 20, 3600))) return NextResponse.json({ ok: true })
        await createPublicClient().rpc('partner_hit', { p_partner: body.data.id, p_kind: body.data.kind })
        return NextResponse.json({ ok: true })
    } catch (error: unknown) {
        console.error('partner-hit API error', { code: getSafeErrorCode(error) })
        return NextResponse.json({ ok: true }) // contar nunca debe romper la página
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
