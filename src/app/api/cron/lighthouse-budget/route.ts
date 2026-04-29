import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { SITE_URL } from '@/lib/seo/config'
import { auditUrls, makePsiFetcher, persistLighthouseScores } from '@/lib/seo/lighthouse-monitor'

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

/**
 * Daily cron — Bouclier 4 plan v2.
 * Audit Lighthouse via PSI API sur 10 URLs SEO-critiques en mobile + desktop.
 * Alerte Sentry si severity=critical sur n'importe quelle combo.
 */
export async function GET(request: Request) {
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
      const fullUrls = CRITICAL_URLS.map((p) => `${SITE_URL}${p}`)
      // Deadline 250s laisse 50s pour persist + heartbeat sous maxDuration=300.
      const deadline = Date.now() + 250_000
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
    },
    {
      schedule: { type: 'crontab', value: '45 6 * * *' },
    }
  )
}
