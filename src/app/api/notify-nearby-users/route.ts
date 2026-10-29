import { NextRequest, NextResponse } from 'next/server'
import { notifyNearbyUsers } from '@/lib/notifications'
import { createClient } from '@/utils/supabase/server'
import { getSafeErrorCode } from '@/lib/safe-error'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body: unknown = await request.json()
        if (typeof body !== 'object' || body === null) {
            return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
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
            return NextResponse.json(
                { error: 'Payload inválido' },
                { status: 400 }
            )
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

export function GET() {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
}
