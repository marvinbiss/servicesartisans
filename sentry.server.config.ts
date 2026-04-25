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

    // Server-specific integrations.
    // captureConsoleIntegration was REMOVED 2026-04-25 : it forwarded every
    // `logger.error()` to Sentry and burned the entire 5K/mo Developer quota
    // (98% drop rate in April 2026). Real errors must be reported via
    // explicit `Sentry.captureException(err)` calls in the catch sites that
    // matter (cron handlers, payment, auth). Console logs stay in Vercel.
    integrations: [Sentry.httpIntegration()],

    // Noise filter — expected errors that are not actionable.
    // Postgres 42703 (column does not exist) is included until the schema
    // drift hotfix migration 474 has been applied + redeployed everywhere.
    ignoreErrors: [
      'NotFoundError',
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      'AbortError',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'fetch failed',
      'Rate limit exceeded',
      'PGRST',
    ],

    beforeSend(event) {
      const exc = event.exception?.values?.[0]
      if (exc?.type === 'NotFoundError') return null

      const msg = exc?.value || event.message || ''

      if (typeof msg === 'string') {
        if (msg.includes('column ') && msg.includes(' does not exist')) return null
        if (/\b42703\b/.test(msg)) return null
        if (msg.startsWith('[Cron') && msg.includes('phone_e164')) return null
      }

      return event
    },
  })
}
