import { NextResponse } from 'next/server'

export async function parseJsonBody(
    request: Request
): Promise<{ ok: true; body: unknown } | { ok: false }> {
    try {
        const body = await request.json()
        return { ok: true, body }
    } catch {
        return { ok: false }
    }
}

export function invalidPayloadResponse() {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
}

export function methodNotAllowedResponse() {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
}

export function getSafeErrorMessage(
    error: unknown,
    fallback = 'Unexpected server error'
): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message
    }

    if (typeof error === 'string' && error.trim()) {
        return error
    }

    return fallback
}

export function getSafeErrorCode(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return 'unknown'
    }

    const code = (error as { code?: unknown }).code
    return typeof code === 'string' && code.trim() ? code.slice(0, 64) : 'unknown'
}
