// Sentry server-side configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring — dynamic sampling.
    // Crons = 100% : leurs échecs doivent être visibles (P0 pipeline).
    // Sitemaps/monitoring = 1% : bruit élevé, échantillon suffisant.
    // Reste = 10% prod, 100% dev.
    tracesSampler: (ctx) => {
      if (ctx.parentSampled !== undefined) return ctx.parentSampled
      const name = typeof ctx.name === 'string' ? ctx.name : ''
      if (name.includes('/api/cron/')) return 1.0
      if (name.includes('/sitemap') || name.includes('/monitoring')) {
        return 0.01
      }
      return process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    },

    // Profiling — captures CPU/memory flamegraphs for slow endpoints
    profilesSampleRate: 0.1,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Server-specific integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
    ],

    // Noise filter — expected errors that are not actionable
    ignoreErrors: [
      'NotFoundError',
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      'AbortError',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'fetch failed',
    ],

    beforeSend(event) {
      if (event.exception?.values?.[0]?.type === 'NotFoundError') {
        return null
      }
      return event
    },
  })
}
