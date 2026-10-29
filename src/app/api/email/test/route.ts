import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendPetAlertEmail, sendSightingNotification } from '@/lib/email'

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
        // Solo permitir en desarrollo
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'Not available in production' },
                { status: 403 }
            )
        }

        const searchParams = request.url.split('?')[1]
        const params = new URLSearchParams(searchParams)
        const type = params.get('type') || 'welcome'
        const email = params.get('email') || 'test@example.com'

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

            default:
                return NextResponse.json(
                    { error: 'Invalid type. Use: welcome, alert, or sighting' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            type,
            email,
            result
        })

    } catch (error: any) {
        console.error('Test email error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send test email' },
            { status: 500 }
        )
    }
}
