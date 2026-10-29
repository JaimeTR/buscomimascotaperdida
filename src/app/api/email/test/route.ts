import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendPetAlertEmail, sendSightingNotification } from '@/lib/email'
import { assertServerEnv } from '@/lib/env'
import { getSafeErrorCode, methodNotAllowedResponse } from '@/lib/safe-error'

/**
 * API Route para probar el envío de emails
 * Solo disponible en desarrollo
 * 
 * Ejemplos:
 * POST /api/email/test?type=welcome
 * POST /api/email/test?type=alert
 * POST /api/email/test?type=sighting
 */
export async function POST(request: NextRequest) {
    try {
        const { emailTestToken } = assertServerEnv()
        const providedToken = request.headers.get('x-email-test-token')

        if (process.env.NODE_ENV === 'production' || !emailTestToken || providedToken !== emailTestToken) {
            return NextResponse.json(
                { error: 'Acceso no autorizado' },
                { status: 403 }
            )
        }

        const params = new URL(request.url).searchParams
        const type = params.get('type')
        const email = params.get('email')

        if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !type ||
            !['welcome', 'alert', 'sighting'].includes(type)
        ) {
            return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
        }

        let result

        switch (type) {
            case 'welcome':
                result = await sendWelcomeEmail(email, 'Test User')
                break

            case 'alert':
                result = await sendPetAlertEmail(email, {
                    name: 'Rocky',
                    type: 'dog',
                    breed: 'Labrador',
                    lastSeenDistrict: 'San Isidro',
                    reportUrl: 'http://localhost:3000/pets/123',
                    reporterName: 'Juan Pérez'
                })
                break

            case 'sighting':
                result = await sendSightingNotification(email, {
                    petName: 'Luna',
                    sightingDistrict: 'Miraflores',
                    sightingDate: new Date().toLocaleDateString('es-PE'),
                    sightingUrl: 'http://localhost:3000/sightings/456',
                    reporterName: 'María García'
                })
                break

        }

        return NextResponse.json({
            success: true,
            type,
            result: Boolean(result),
        })

    } catch (error: unknown) {
        console.error('test email API error', { code: getSafeErrorCode(error) })
        return NextResponse.json(
            { error: 'No se pudo enviar el correo de prueba' },
            { status: 500 }
        )
    }
}

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse
export const DELETE = methodNotAllowedResponse
