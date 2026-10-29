import React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { assertServerEnv } from '@/lib/env'
import { getSafeErrorCode } from '@/lib/safe-error'

// Configuración
const FROM_EMAIL = 'BuscoMiMascota <onboarding@resend.dev>' // Cambiar a tu dominio verificado

export interface SendEmailOptions {
    to: string | string[]
    subject: string
    react: React.ReactElement
}

/**
 * Enviar email usando Resend
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
    try {
        const { resendApiKey } = assertServerEnv()
        // Validar que Resend esté configurado
        if (!resendApiKey) {
            console.error('email provider is not configured')
            throw new Error('Email service not configured')
        }
        const resend = new Resend(resendApiKey)

        // Renderizar el template a HTML
        const html = await render(react)

        // Enviar email
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        })

        if (error) {
            console.error('email provider request failed', { code: getSafeErrorCode(error) })
            throw error
        }

        return { success: true, id: data?.id }

    } catch (error: unknown) {
        console.error('email service error', { code: getSafeErrorCode(error) })
        throw error
    }
}

/**
 * Email de bienvenida
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
    const { WelcomeEmail } = await import('@/emails/welcome-template')

    return sendEmail({
        to,
        subject: '¡Bienvenido a BuscoMiMascotaPerdida! 🐾',
        react: WelcomeEmail({ firstName }),
    })
}

/**
 * Email de alerta de mascota perdida
 */
export async function sendPetAlertEmail(
    to: string | string[],
    petData: {
        name: string
        type: string
        breed: string
        lastSeenDistrict: string
        imageUrl?: string
        reportUrl: string
        reporterName: string
    }
) {
    const { PetAlertEmail } = await import('@/emails/pet-alert-template')

    return sendEmail({
        to,
        subject: `🚨 Mascota ${petData.type === 'dog' ? 'Perro' : 'Gato'} perdida cerca - ${petData.name}`,
        react: PetAlertEmail(petData),
    })
}

/**
 * Email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
    to: string,
    resetToken: string,
    firstName: string
) {
    const appUrl = assertServerEnv().appUrl || 'http://localhost:3000'
    const resetUrl = `${appUrl}/update-password?token=${resetToken}`

    const PasswordResetTemplate = (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#3b82f6' }}>Restablecer Contraseña</h1>
            <p>Hola {firstName},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>
                <a
                    href={resetUrl}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        display: 'inline-block'
                    }}
                >
                    Restablecer Contraseña
                </a>
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
                Si no solicitaste esto, puedes ignorar este correo de forma segura.
                <br />
                Este enlace expira en 1 hora.
            </p>
        </div>
    )

    return sendEmail({
        to,
        subject: 'Restablecer tu contraseña - BuscoMiMascotaPerdida',
        react: PasswordResetTemplate,
    })
}

/**
 * Email de notificación de avistamiento
 */
export async function sendSightingNotification(
    to: string,
    data: {
        petName: string
        sightingDistrict: string
        sightingDate: string
        sightingUrl: string
        reporterName: string
    }
) {
    const SightingTemplate = (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#10b981' }}>👀 ¡Nuevo Avistamiento!</h1>
            <p>Buenas noticias, alguien reportó haber visto a <strong>{data.petName}</strong>.</p>
            <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '20px',
                margin: '20px 0'
            }}>
                <p style={{ margin: '0 0 10px 0' }}>
                    📍 <strong>Ubicación: </strong> {data.sightingDistrict}
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                    📅 <strong>Fecha: </strong> {data.sightingDate}
                </p>
                <p style={{ margin: '0' }}>
                    👤 <strong>Reportado por: </strong> {data.reporterName}
                </p>
            </div>
            <p>
                <a
                    href={data.sightingUrl}
                    style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        display: 'inline-block'
                    }}
                >
                    Ver Detalles del Avistamiento
                </a>
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
                Te recomendamos contactar al reportante lo antes posible.
            </p>
        </div>
    )

    return sendEmail({
        to,
        subject: `👀 Avistaron a ${data.petName} en ${data.sightingDistrict}`,
        react: SightingTemplate,
    })
}
