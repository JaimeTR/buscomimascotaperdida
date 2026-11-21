import * as Sentry from '@sentry/nextjs'

// Monitoreo de errores del servidor. Sin SENTRY_DSN no hace nada.
export function register() {
    const dsn = process.env.SENTRY_DSN
    if (dsn && process.env.NEXT_RUNTIME === 'nodejs') {
        Sentry.init({ dsn, tracesSampleRate: 0 })
    }
}

export const onRequestError = Sentry.captureRequestError
