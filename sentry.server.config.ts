// Sentry server-side configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance Monitoring — dynamic sampling: noisy crons low, rest 10% in prod
    tracesSampler: (ctx) => {
      if (ctx.parentSampled !== undefined) return ctx.parentSampled
      const name = typeof ctx.name === 'string' ? ctx.name : ''
      if (
        name.includes('/api/cron/') ||
        name.includes('/sitemap') ||
        name.includes('/monitoring')
      ) {
        return 0.01
      }
      return process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    },

    // Profiling — captures CPU/memory flamegraphs for slow endpoints
    profilesSampleRate: 0.1,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Server-specific integrations
    integrations: [Sentry.httpIntegration()],

    // Noise filter — expected errors that are not actionable
    ignoreErrors: ['NotFoundError', 'NEXT_NOT_FOUND', 'NEXT_REDIRECT', 'AbortError'],

    beforeSend(event) {
      if (event.exception?.values?.[0]?.type === 'NotFoundError') {
        return null
      }
      return event
    },
  })
}
