// Sentry client-side configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring — dynamic sampling: errors always, noisy routes low, rest 10% in prod
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

    // Session Replay — lazy-loaded to save ~70KB from initial bundle.
    // Budget cap : 0.5% en prod par défaut pour éviter l'explosion facturation
    // si un incident devient viral. Override via NEXT_PUBLIC_SENTRY_REPLAY_RATE
    // (par exemple `0.1` pendant une session de debug) sans redeploy.
    replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_RATE ?? 0.005),
    replaysOnErrorSampleRate: 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Noise filter — common browser errors that are not actionable
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Failed to fetch',
      'NetworkError when attempting to fetch resource',
      'Load failed',
      'AbortError',
      'cancelled',
      'The operation was aborted',
      'ChunkLoadError',
      'Loading chunk',
      'SecurityError',
    ],

    // Drop anything originating from browser extensions
    denyUrls: [
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-extension:\/\//i,
      /^safari-web-extension:\/\//i,
    ],

    beforeSend(event) {
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
          frame.filename?.includes('extension')
        )
      ) {
        return null
      }
      return event
    },
  })
}
