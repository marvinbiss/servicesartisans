// Sentry server-side configuration
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

// Hotfix expiry — schema-drift filter doit s'auto-désactiver après le 5 mai 2026
// pour ne plus masquer de vrais bugs `column does not exist` (CVE potentiel :
// SQL injection probing rendu silencieux par un filtre trop large). Audit
// 2026-04-25 (10-agents) a flaggé ce risque comme HIGH.
const SCHEMA_DRIFT_FILTER_EXPIRY = Date.UTC(2026, 4, 5) // 2026-05-05 00:00 UTC

// Active Sentry sur production ET preview Vercel : avant ce changement,
// `NODE_ENV === 'production'` couvrait les deux mais désactivait `dev` —
// VERCEL_ENV donne le bon découpage et garde la visibilité sur les preview
// deploys (PR review). Audit 2026-04-25 BLOCKER B1.
const VERCEL_ENV = process.env.VERCEL_ENV
const SENTRY_ENABLED =
  VERCEL_ENV === 'production' ||
  VERCEL_ENV === 'preview' ||
  // Fallback non-Vercel (auto-hosted, runners CI, tests prod-like) :
  // l'ancienne logique restée pour ne pas régresser hors Vercel.
  (!VERCEL_ENV && process.env.NODE_ENV === 'production')

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: VERCEL_ENV || process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring — dynamic sampling.
    // Audit 2026-04-25 (agent #7 BLOCKER) : la version précédente faisait
    // 100% sampling sur tous les `/api/cron/*`. Avec ~30 crons (dont
    // `metrics-snapshot`, `redis-health`, `cee-dossier-transitions` qui
    // tournent toutes les minutes/heures), c'est >40K transactions/mois sur
    // le tier Developer (10K/mo séparé du quota events). Quota cramé en
    // silence. On échantillonne désormais à 0.2 sur les crons heartbeat-style
    // et 1.0 uniquement sur les crons business-critical.
    tracesSampler: (ctx) => {
      if (ctx.parentSampled !== undefined) return ctx.parentSampled
      const name = typeof ctx.name === 'string' ? ctx.name : ''

      // Crons business-critical : 100% — leurs échecs DOIVENT être visibles.
      const CRITICAL_CRONS = [
        '/api/cron/pipedrive-retry',
        '/api/cron/simulateur-pipedrive-retry',
        '/api/cron/rge-sync',
        '/api/cron/rgpd-anonymize',
        '/api/cron/process-gdpr-deletions',
        '/api/cron/lead-reassign',
        '/api/cron/send-review-invitations',
        '/api/cron/cee-dossier-transitions',
      ]
      if (CRITICAL_CRONS.some((p) => name.includes(p))) return 1.0

      // Autres crons : 0.2 (sample suffisant pour détecter une régression
      // sans burner le quota transactions).
      if (name.includes('/api/cron/')) return 0.2

      // Sitemaps + tunnel Sentry monitoring : très bruyant, 1% suffit.
      if (name.includes('/sitemap') || name.includes('/monitoring')) return 0.01

      return VERCEL_ENV === 'production' ? 0.1 : 1.0
    },

    // Profiling — captures CPU/memory flamegraphs for slow endpoints.
    // Réduit à 0.02 (vs 0.1) après audit 2026-04-25 — quota séparé limité
    // sur tier Developer.
    profilesSampleRate: 0.02,

    enabled: SENTRY_ENABLED,

    // Server-specific integrations.
    // captureConsoleIntegration was REMOVED 2026-04-25 : it forwarded every
    // `logger.error()` to Sentry and burned the entire 5K/mo Developer quota
    // (98% drop rate in April 2026). Real errors must be reported via
    // explicit `Sentry.captureException(err)` calls in the catch sites that
    // matter (cron handlers, payment, auth). Console logs stay in Vercel.
    integrations: [Sentry.httpIntegration()],

    // Noise filter — expected errors that are not actionable.
    // PGRST = PostgREST API errors (transient, retried by client SDK).
    //
    // Audit 2026-04-26 — incident GSC : ECONNREFUSED / ECONNRESET / ETIMEDOUT /
    // 'fetch failed' ont été retirés de cette liste. Les filtrer rendait Sentry
    // aveugle aux pannes réseau outbound (Supabase, Pipedrive, ADEME) ET aux
    // timeouts internes — donc à la classe d'erreur que Google Search Console
    // a flaggée pendant ~13h sans alerte. On accepte un peu plus de bruit
    // contre une vraie visibilité. Si volume devient ingérable, sampler dans
    // beforeSend plutôt que masquer.
    ignoreErrors: [
      'NotFoundError',
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      'AbortError',
      'Rate limit exceeded',
      'PGRST',
    ],

    beforeSend(event) {
      const exc = event.exception?.values?.[0]
      if (exc?.type === 'NotFoundError') return null

      const msg = typeof exc?.value === 'string' ? exc.value : ''
      const eventMsg = typeof event.message === 'string' ? event.message : ''
      const haystack = msg || eventMsg

      // Filtre schema-drift (migrations 474+) — auto-expire au 2026-05-05.
      // Tag `schema_drift_hotfix:true` ajouté avant drop pour pouvoir
      // monitorer la fréquence d'occurrence dans Sentry "Discarded events".
      if (haystack && Date.now() < SCHEMA_DRIFT_FILTER_EXPIRY) {
        const isUndefinedColumn =
          haystack.includes('column ') && haystack.includes(' does not exist')
        const is42703 = /\b42703\b/.test(haystack)
        const isPhoneCron = haystack.startsWith('[Cron') && haystack.includes('phone_e164')

        if (isUndefinedColumn || is42703 || isPhoneCron) {
          event.tags = { ...(event.tags ?? {}), schema_drift_hotfix: 'true' }
          return null
        }
      }

      return event
    },
  })
}
