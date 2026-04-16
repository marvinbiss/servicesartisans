// Sentry Edge runtime configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring — dynamic sampling: noisy routes low, rest 10% in prod
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

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',
  })
}
