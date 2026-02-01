// Sentry server-side configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Server-specific integrations
    integrations: [
      Sentry.httpIntegration(),
    ],

    // Filter errors
    beforeSend(event) {
      // Filter out expected errors
      if (event.exception?.values?.[0]?.type === 'NotFoundError') {
        return null
      }
      return event
    },
  })
}
