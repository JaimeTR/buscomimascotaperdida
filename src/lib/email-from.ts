// Remitente de todos los correos. Mientras el dominio no esté verificado en Resend, el remitente de prueba
// (onboarding@resend.dev) solo entrega al correo de la cuenta de Resend. Al verificar el dominio, define en Vercel:
// EMAIL_FROM="BuscoMiMascota <notificaciones@buscomimascotaperdida.com>"
export const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || 'BuscoMiMascota <onboarding@resend.dev>'
