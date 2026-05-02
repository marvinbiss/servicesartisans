// Sentry client-side configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Active Sentry sur production ET preview Vercel (cohérent avec server config).
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV
const SENTRY_ENABLED =
  VERCEL_ENV === 'production' ||
  VERCEL_ENV === 'preview' ||
  (!VERCEL_ENV && process.env.NODE_ENV === 'production')

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: VERCEL_ENV || process.env.NODE_ENV,
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

    enabled: SENTRY_ENABLED,

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
      // Audit Sentry 2026-05-02 — bruits externes confirmés sur 24h prod :
      // - "@context.toLowerCase" : extensions Safari (Reader / SchemaParser)
      //   parsent les JSON-LD de la page et crashent quand `@context` est
      //   un objet/undefined plutôt qu'une string. Hors SA. ~14 events/24h.
      // - "invalid group specifier name" : regex `(?<name>...)` named groups
      //   non supportés par Safari < 16.4 dans une lib tierce embed
      //   (probablement leaflet ou un script analytics). ~15 events/24h.
      'evaluating \'r["@context"].toLowerCase\'',
      "Cannot read properties of undefined (reading '@context')",
      'Invalid regular expression: invalid group specifier name',
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
