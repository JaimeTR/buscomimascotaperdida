import { NextRequest, NextResponse } from 'next/server'
import { notifyNearbyUsers } from '@/lib/notifications'
import { createClient } from '@/utils/supabase/server'
import {
    getSafeErrorCode,
    invalidPayloadResponse,
    methodNotAllowedResponse,
    parseJsonBody,
} from '@/lib/safe-error'

export async function POST(request: NextRequest) {
    try {
        const parsedBody = await parseJsonBody(request)
        if (!parsedBody.ok) {
            return invalidPayloadResponse()
        }

        const body: unknown = parsedBody.body
        if (typeof body !== 'object' || body === null) {
            return invalidPayloadResponse()
        }

        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const {
            petId,
            petName,
            petType,
            petBreed,
            petDescription,
            lastSeenAddress,
            lastSeenDistrict,
            lastSeenLat,
            lastSeenLng,
            petImageUrl
        } = body as Record<string, unknown>

        const optionalString = (value: unknown): string | undefined =>
            typeof value === 'string' ? value : undefined

        if (
            typeof petId !== 'string' ||
            typeof petName !== 'string' ||
            typeof petType !== 'string' ||
            typeof lastSeenDistrict !== 'string' ||
            typeof lastSeenLat !== 'number' ||
            typeof lastSeenLng !== 'number' ||
            !Number.isFinite(lastSeenLat) ||
            !Number.isFinite(lastSeenLng) ||
            lastSeenLat < -90 ||
            lastSeenLat > 90 ||
            lastSeenLng < -180 ||
            lastSeenLng > 180 ||
            !petId.trim() ||
            !petName.trim() ||
            !petType.trim() ||
            !lastSeenDistrict.trim()
        ) {
            return invalidPayloadResponse()
        }

        const result = await notifyNearbyUsers({
            petId,
            petName,
            petType,
            petBreed: optionalString(petBreed),
            petDescription: optionalString(petDescription),
            lastSeenAddress: optionalString(lastSeenAddress) || '',
            lastSeenDistrict,
            lastSeenLat,
            lastSeenLng,
            petImageUrl: optionalString(petImageUrl)
        })

        if (result.error) {
            return NextResponse.json(
                { error: 'No se pudieron enviar las notificaciones' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            notified: result.notified
        })

    } catch (error: unknown) {
        console.error('notify-nearby-users API error', { code: getSafeErrorCode(error) })
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
export const OPTIONS = methodNotAllowedResponse
