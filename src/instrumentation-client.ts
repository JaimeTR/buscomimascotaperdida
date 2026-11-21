import * as Sentry from '@sentry/nextjs'

// Monitoreo de errores del navegador. Sin NEXT_PUBLIC_SENTRY_DSN no hace nada.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) Sentry.init({ dsn, tracesSampleRate: 0 })

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
