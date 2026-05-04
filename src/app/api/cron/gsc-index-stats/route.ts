import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import {
  getIndexationStats,
  getSearchPerformance,
  type GSCIndexationStats,
  type GSCSearchPerformance,
} from '@/lib/seo/gsc-client'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

/** Seuil critique : en dessous, alerte systémique */
const INDEXATION_RATIO_THRESHOLD = 0.6

/**
 * Cron job: Pull les stats d'indexation depuis Google Search Console.
 * Runs daily pour monitorer le ratio d'indexation et détecter les régressions.
 *
 * Métriques collectées :
 * - Pages indexées vs soumises (via Sitemaps API)
 * - Ratio d'indexation (alerte si < 60%)
 * - Performance de recherche (clicks, impressions, CTR, position)
 * - Sitemaps en erreur
 *
 * Les résultats sont stockés dans la table `seo_metrics` si elle existe,
 * sinon loggés en structured logging (visibles dans Vercel Logs).
 */
export const GET = withCronCheckIn('cron-gsc-index-stats', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // ── Vérifier que les credentials GSC sont configurées ─────────────────
  const hasCredentials = !!(process.env.GSC_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  if (!hasCredentials) {
    logger.warn(
      'GSC index stats cron: No GSC credentials configured (GSC_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_KEY). Skipping.',
      {
        action: 'gsc-index-stats-skip',
      }
    )
    return NextResponse.json({
      skipped: true,
      reason: 'GSC credentials not configured',
      timestamp: new Date().toISOString(),
    })
  }

  let indexationStats: GSCIndexationStats | null = null
  let searchPerformance: GSCSearchPerformance | null = null
  let alert = false

  // ── 1. Récupérer les stats d'indexation ──────────────────────────────
  try {
    indexationStats = await getIndexationStats()

    if (indexationStats.indexationRatio < INDEXATION_RATIO_THRESHOLD) {
      alert = true
      console.error(
        `[gsc-index-stats] ALERT: Indexation ratio ${(indexationStats.indexationRatio * 100).toFixed(1)}% is below ${INDEXATION_RATIO_THRESHOLD * 100}% threshold!`,
        {
          submitted: indexationStats.submittedPages,
          indexed: indexationStats.indexedPages,
          ratio: indexationStats.indexationRatio,
          sitemapErrors: indexationStats.sitemapErrors.length,
        }
      )
    }

    if (indexationStats.sitemapErrors.length > 0) {
      console.error(
        '[gsc-index-stats] Sitemaps with errors:',
        indexationStats.sitemapErrors.map((s) => s.path)
      )
    }

    logger.warn('GSC index stats collected', {
      action: 'gsc-index-stats',
      submitted: String(indexationStats.submittedPages),
      indexed: String(indexationStats.indexedPages),
      ratio: String((indexationStats.indexationRatio * 100).toFixed(1)),
      sitemapErrors: String(indexationStats.sitemapErrors.length),
      sitemapCount: String(indexationStats.sitemaps.length),
    })
  } catch (err) {
    logger.error('GSC index stats: failed to fetch indexation stats', err, {
      action: 'gsc-index-stats-error',
    })
  }

  // ── 2. Récupérer les performances de recherche ────────────────────────
  try {
    searchPerformance = await getSearchPerformance(28)

    logger.warn('GSC search performance collected', {
      action: 'gsc-search-performance',
      clicks: String(searchPerformance.clicks),
      impressions: String(searchPerformance.impressions),
      ctr: String((searchPerformance.ctr * 100).toFixed(2)),
      position: String(searchPerformance.position.toFixed(1)),
    })
  } catch (err) {
    logger.error('GSC index stats: failed to fetch search performance', err, {
      action: 'gsc-search-performance-error',
    })
  }

  // ── 3. Stocker dans seo_metrics si la table existe ────────────────────
  let stored = false
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const metricsRow = {
      metric_type: 'gsc_indexation',
      data: {
        indexation: indexationStats
          ? {
              submitted: indexationStats.submittedPages,
              indexed: indexationStats.indexedPages,
              ratio: indexationStats.indexationRatio,
              sitemapErrors: indexationStats.sitemapErrors.length,
              sitemapCount: indexationStats.sitemaps.length,
            }
          : null,
        performance: searchPerformance
          ? {
              clicks: searchPerformance.clicks,
              impressions: searchPerformance.impressions,
              ctr: searchPerformance.ctr,
              position: searchPerformance.position,
              days: searchPerformance.days,
            }
          : null,
        alert,
      },
      collected_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('seo_metrics').insert(metricsRow)

    if (error) {
      // Table n'existe probablement pas — pas critique, on logge et continue
      logger.warn('GSC index stats: could not store in seo_metrics (table may not exist)', {
        action: 'gsc-index-stats-store-skip',
        error: error.message,
      })
    } else {
      stored = true
      logger.warn('GSC index stats: stored in seo_metrics', {
        action: 'gsc-index-stats-stored',
      })
    }
  } catch (err) {
    // Supabase indisponible — pas bloquant
    logger.warn('GSC index stats: Supabase unavailable, results logged only', {
      action: 'gsc-index-stats-no-db',
      error: err instanceof Error ? err.message : 'unknown',
    })
  }

  // ── Réponse ──────────────────────────────────────────────────────────
  return NextResponse.json({
    alert,
    stored,
    indexation: indexationStats
      ? {
          submitted: indexationStats.submittedPages,
          indexed: indexationStats.indexedPages,
          ratio: `${(indexationStats.indexationRatio * 100).toFixed(1)}%`,
          belowThreshold: indexationStats.indexationRatio < INDEXATION_RATIO_THRESHOLD,
          sitemapErrors: indexationStats.sitemapErrors.length,
          sitemapCount: indexationStats.sitemaps.length,
        }
      : null,
    performance: searchPerformance
      ? {
          clicks: searchPerformance.clicks,
          impressions: searchPerformance.impressions,
          ctr: `${(searchPerformance.ctr * 100).toFixed(2)}%`,
          position: searchPerformance.position.toFixed(1),
          days: searchPerformance.days,
        }
      : null,
    timestamp: new Date().toISOString(),
  })
})
