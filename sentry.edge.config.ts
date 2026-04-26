// Sentry Edge runtime configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

const VERCEL_ENV = process.env.VERCEL_ENV
const SENTRY_ENABLED =
  VERCEL_ENV === 'production' ||
  VERCEL_ENV === 'preview' ||
  (!VERCEL_ENV && process.env.NODE_ENV === 'production')

// Hotfix expiry — schema-drift filter doit s'auto-désactiver après le 5 mai 2026
// pour ne plus masquer de vrais bugs `column does not exist` (CVE potentiel :
// SQL injection probing rendu silencieux par un filtre trop large).
// Audit 2026-04-25 (agent #7 HIGH) — filtre dupliqué sur l'edge runtime
// pour ne pas burner le quota si une erreur edge match `column does not exist`.
const SCHEMA_DRIFT_FILTER_EXPIRY = Date.UTC(2026, 4, 5) // 2026-05-05 00:00 UTC

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: VERCEL_ENV || process.env.NODE_ENV,
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
      return VERCEL_ENV === 'production' ? 0.1 : 1.0
    },

    enabled: SENTRY_ENABLED,

    // Audit 2026-04-26 — 'fetch failed' retiré (cf. sentry.server.config.ts).
    // L'edge runtime exécute le middleware ; un 'fetch failed' silencieux
    // peut masquer une panne du rate-limiter Upstash ou d'un upstream.
    ignoreErrors: ['NotFoundError', 'NEXT_NOT_FOUND', 'NEXT_REDIRECT', 'AbortError'],

    beforeSend(event) {
      const exc = event.exception?.values?.[0]
      if (exc?.type === 'NotFoundError') return null

      const msg = typeof exc?.value === 'string' ? exc.value : ''
      const eventMsg = typeof event.message === 'string' ? event.message : ''
      const haystack = msg || eventMsg

      if (haystack && Date.now() < SCHEMA_DRIFT_FILTER_EXPIRY) {
        const isUndefinedColumn =
          haystack.includes('column ') && haystack.includes(' does not exist')
        const is42703 = /\b42703\b/.test(haystack)
        if (isUndefinedColumn || is42703) {
          event.tags = { ...(event.tags ?? {}), schema_drift_hotfix: 'true', runtime: 'edge' }
          return null
        }
      }

      return event
    },
  })
}
