import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { SITE_URL } from '@/lib/seo/config'
import { auditUrls, makePsiFetcher, persistLighthouseScores } from '@/lib/seo/lighthouse-monitor'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
// 20 PSI calls × ~10s ≈ 200s. maxDuration 300 + deadline guard 250s laisse
// la marge pour persist + heartbeat. vercel.json override en miroir.
export const maxDuration = 300

/**
 * URLs critiques SEO suivies quotidiennement (Top 10 templates).
 * Échantillon représentatif — 1 par template clé. Mobile + desktop = 20 audits.
 */
const CRITICAL_URLS = [
  '/',
  '/services',
  '/services/plombier/paris',
  '/rge/pompe-a-chaleur/paris',
  '/tarifs/plombier/paris',
  '/avis/plombier/paris',
  '/villes/paris',
  '/blog',
  '/devis',
  '/simulateur-aides-renovation',
]

// SLA-99.9 : cap dur sur le nombre d'URLs auditées par run + wall-clock guard
// (maxDuration 300 → marge 10s) + lease anti-double-run.
const MAX_URLS_PER_RUN = 50
const MAX_RUNTIME_MS = 290_000
const LEASE_NAME = 'cron_lighthouse_budget'
const LEASE_TTL_SECONDS = 30 * 60

/**
 * Daily cron — Bouclier 4 plan v2.
 * Audit Lighthouse via PSI API sur 10 URLs SEO-critiques en mobile + desktop.
 * Alerte Sentry si severity=critical sur n'importe quelle combo.
 */
export const GET = withCronCheckIn('cron-lighthouse-budget', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  return await Sentry.withMonitor(
    'cron-lighthouse-budget',
    async () => {
      const supabase = createAdminClient()
      const startedAt = Date.now()

      // SLA-99.9 : lease avec abort 5s.
      const leaseController = new AbortController()
      const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
      let acquired: boolean | null = null
      let leaseErr: { message: string } | null = null
      try {
        const leaseResult = await supabase
          .rpc('acquire_cron_lease', {
            p_name: LEASE_NAME,
            p_ttl_seconds: LEASE_TTL_SECONDS,
          })
          .abortSignal(leaseController.signal)
        acquired = leaseResult.data as boolean | null
        leaseErr = leaseResult.error
      } catch (err) {
        leaseErr = { message: err instanceof Error ? err.message : String(err) }
      } finally {
        clearTimeout(leaseTimer)
      }

      if (leaseErr) {
        logger.error('[lighthouse-budget] lease error', undefined, {
          lease: LEASE_NAME,
          error: leaseErr.message,
        })
        return NextResponse.json({ error: 'lease_error' }, { status: 500 })
      }
      if (acquired !== true) {
        logger.info('[lighthouse-budget] skipped (lease already held)', { lease: LEASE_NAME })
        return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
      }

      try {
        // Idempotency : si toutes les URLs × strategies sont déjà snapshotées
        // aujourd'hui, on saute pour ne pas brûler du quota PSI sur un re-run
        // (cron retry ou attaquant avec le secret).
        const today = new Date().toISOString().slice(0, 10)
        const expectedCount = CRITICAL_URLS.length * 2 // mobile + desktop
        const { count: existingCount } = await supabase
          .from('lighthouse_scores')
          .select('id', { count: 'exact', head: true })
          .eq('snapshot_date', today)
        if ((existingCount ?? 0) >= expectedCount) {
          await pingHeartbeat('lighthouse-budget')
          return NextResponse.json({
            ok: true,
            skipped: true,
            reason: 'already_run_today',
            existing_count: existingCount,
            timestamp: new Date().toISOString(),
          })
        }

        const fetcher = makePsiFetcher(process.env.PAGESPEED_INSIGHTS_API_KEY)
        const fullUrls = CRITICAL_URLS.map((p) => `${SITE_URL}${p}`).slice(0, MAX_URLS_PER_RUN)
        // Deadline 250s laisse 50s pour persist + heartbeat sous maxDuration=300.
        // Aligné sur le wall-clock guard MAX_RUNTIME_MS via startedAt.
        const deadline = Math.min(Date.now() + 250_000, startedAt + MAX_RUNTIME_MS)
        const scores = await auditUrls(fullUrls, fetcher, ['mobile', 'desktop'], deadline)
        const persistResult = await persistLighthouseScores(supabase, scores)
        if (!persistResult.ok) {
          logger.warn('[lighthouse-budget] persist failed (non-blocking)', {
            kind: 'lighthouse_persist_error',
          })
        }

        let criticals = 0
        for (const score of scores) {
          const logBody = {
            kind: 'lighthouse_score',
            url: score.url,
            strategy: score.strategy,
            performance_score: score.performanceScore,
            lcp_ms: score.lcpMs,
            cls: score.cls,
            severity: score.severity,
          }
          if (score.severity === 'critical') {
            criticals += 1
            logger.error(
              `[lighthouse-budget] CRITICAL ${score.strategy} ${score.url} perf=${score.performanceScore} LCP=${score.lcpMs}ms CLS=${score.cls}`,
              undefined,
              logBody
            )
            Sentry.captureMessage(
              `Lighthouse critical ${score.strategy}: ${score.url} (perf=${score.performanceScore})`,
              { level: 'error', extra: logBody }
            )
          } else if (score.severity === 'warn') {
            logger.warn(
              `[lighthouse-budget] WARN ${score.strategy} ${score.url} perf=${score.performanceScore}`,
              logBody
            )
          }
        }

        await pingHeartbeat('lighthouse-budget')
        return NextResponse.json({
          ok: true,
          upserted: persistResult.upserted,
          audited: scores.length,
          criticals,
          timestamp: new Date().toISOString(),
        })
      } finally {
        // SLA-99.9 : release best-effort.
        try {
          await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
        } catch {
          // swallowed : TTL acts as safety net
        }
      }
    },
    {
      schedule: { type: 'crontab', value: '45 6 * * *' },
    }
  )
})
