import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { runWeeklyAnalysis } from '@/lib/seo/crawl-analysis'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60

/**
 * Cron hebdomadaire : Analyse des logs Googlebot.
 *
 * - Calcule les tendances de crawl sur 7 jours
 * - Identifie les pages prioritaires pour Google
 * - Détecte les pages ignorées (sitemap vs logs)
 * - Distribution par type de page, user-agent, code de réponse, heure
 * - Purge les logs > 30 jours
 * - Stocke le résumé dans googlebot_analysis
 *
 * Schedule recommandé : chaque lundi à 06:00 UTC
 */
export async function GET(request: Request) {
  // ── Auth (même pattern que les autres crons) ────────────────────────
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── Vérification que la table existe et n'est pas vide ────────────
    const supabase = createAdminClient()
    const { count, error: countError } = await supabase
      .from('googlebot_logs')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      // La table n'existe probablement pas
      logger.warn('googlebot-analysis: table googlebot_logs inaccessible', {
        action: 'googlebot-analysis-skip',
        error: countError.message,
      })
      return NextResponse.json({
        status: 'skipped',
        reason: 'googlebot_logs table inaccessible',
        error: countError.message,
      })
    }

    if (count === 0) {
      logger.warn('googlebot-analysis: aucun log Googlebot en base', {
        action: 'googlebot-analysis-skip',
      })
      return NextResponse.json({
        status: 'skipped',
        reason: 'no googlebot logs found',
      })
    }

    // ── Analyse complète ──────────────────────────────────────────────
    const report = await runWeeklyAnalysis()

    // ── Stockage du rapport dans googlebot_analysis ───────────────────
    const { error: insertError } = await supabase
      .from('googlebot_analysis')
      .insert({
        period_start: report.period_start,
        period_end: report.period_end,
        total_crawls: report.total_crawls,
        crawls_per_day: report.crawls_per_day,
        top_pages: report.top_pages,
        never_crawled_sample: report.never_crawled_sample,
        page_type_distribution: report.page_type_distribution,
        user_agent_distribution: report.user_agent_distribution,
        status_code_distribution: report.status_code_distribution,
        hourly_distribution: report.hourly_distribution,
        logs_purged: report.logs_purged,
      })

    if (insertError) {
      // La table googlebot_analysis n'existe peut-être pas encore.
      // On log le warning mais on retourne quand même le rapport.
      logger.warn('googlebot-analysis: impossible de stocker le rapport', {
        action: 'googlebot-analysis-store-fail',
        error: insertError.message,
      })
    }

    // ── Log structuré du rapport ──────────────────────────────────────
    const avgCrawlsPerDay = report.crawls_per_day.length > 0
      ? Math.round(report.total_crawls / report.crawls_per_day.length)
      : 0

    const peakHour = report.hourly_distribution.reduce(
      (max, h) => (h.count > max.count ? h : max),
      { hour: 0, count: 0 }
    )

    const topPageType = report.page_type_distribution[0]

    logger.warn('googlebot-analysis: rapport hebdomadaire', {
      action: 'googlebot-analysis-report',
      total_crawls: report.total_crawls,
      avg_per_day: avgCrawlsPerDay,
      days_with_data: report.crawls_per_day.length,
      top_page: report.top_pages[0]?.url ?? 'none',
      top_page_count: report.top_pages[0]?.count ?? 0,
      top_page_type: topPageType?.page_type ?? 'none',
      top_page_type_count: topPageType?.count ?? 0,
      peak_hour_utc: peakHour.hour,
      peak_hour_crawls: peakHour.count,
      never_crawled_count: report.never_crawled_sample.length,
      logs_purged: report.logs_purged,
      stored: !insertError,
    })

    return NextResponse.json({
      status: 'success',
      summary: {
        total_crawls: report.total_crawls,
        avg_crawls_per_day: avgCrawlsPerDay,
        days_with_data: report.crawls_per_day.length,
        top_page: report.top_pages[0] ?? null,
        peak_hour_utc: peakHour.hour,
        never_crawled_count: report.never_crawled_sample.length,
        logs_purged: report.logs_purged,
        stored: !insertError,
      },
      report,
    })
  } catch (err) {
    logger.error('googlebot-analysis: erreur inattendue', err, {
      action: 'googlebot-analysis-error',
    })
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
