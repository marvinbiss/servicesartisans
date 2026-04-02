import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * GET /api/cron/seo-monitor
 * Dashboard endpoint: aggregated SEO metrics from seo_page_scores.
 * Protected by CRON_SECRET (not publicly exposed).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  try {
    const supabase = createAdminClient()

    // Run all queries in parallel for performance
    // Fetch top pages and worst orphans
    const [topPagesResult, worstOrphansResult] = await Promise.all([
      // Top 20 pages by link_score
      supabase
        .from('seo_page_scores')
        .select('page_path, page_type, link_score, internal_links_in, internal_links_out')
        .order('link_score', { ascending: false })
        .limit(20),

      // Worst 20 orphans (critical: is_orphan + lowest link_score)
      supabase
        .from('seo_page_scores')
        .select('page_path, page_type, link_score, internal_links_in, internal_links_out, is_indexed')
        .eq('is_orphan', true)
        .order('internal_links_in', { ascending: true })
        .order('link_score', { ascending: true })
        .limit(20),
    ])

    // --- Build overview via direct queries (more reliable than rpc) ---
    const [totalRes, orphanCriticalRes, orphanWeakRes, avgScoreRes, lastRunsRes] = await Promise.all([
      supabase
        .from('seo_page_scores')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('seo_page_scores')
        .select('id', { count: 'exact', head: true })
        .eq('is_orphan', true)
        .eq('internal_links_in', 0),
      supabase
        .from('seo_page_scores')
        .select('id', { count: 'exact', head: true })
        .eq('is_orphan', true)
        .gt('internal_links_in', 0),
      supabase
        .from('seo_page_scores')
        .select('link_score')
        .not('link_score', 'is', null)
        .limit(5000),
      supabase
        .from('seo_page_scores')
        .select('updated_at, source_run_id')
        .order('updated_at', { ascending: false })
        .limit(100),
    ])

    // Compute average from fetched scores
    const scores = avgScoreRes.data ?? []
    const avgLinkScore = scores.length > 0
      ? Math.round((scores.reduce((sum, r) => sum + Number(r.link_score), 0) / scores.length) * 100) / 100
      : 0

    // Find last run timestamps from source_run_id
    const runs = lastRunsRes.data ?? []
    const lastLinkScoreRun = runs.find(r => r.source_run_id?.includes('link-scores'))?.updated_at ?? null
    const lastOrphanCheckRun = runs.find(r => r.source_run_id?.includes('orphan'))?.updated_at ?? null

    const overview = {
      total_pages: totalRes.count ?? 0,
      orphan_critical: orphanCriticalRes.count ?? 0,
      orphan_weak: orphanWeakRes.count ?? 0,
      avg_link_score: avgLinkScore,
      last_link_score_run: lastLinkScoreRun,
      last_orphan_check_run: lastOrphanCheckRun,
    }

    // --- Build by_type aggregation ---
    const pageTypes = ['services', 'tarifs', 'devis', 'avis', 'urgence', 'blog', 'hub']
    const byTypeQueries = pageTypes.map(async (type) => {
      const [countRes, orphanCountRes, scoresRes] = await Promise.all([
        supabase
          .from('seo_page_scores')
          .select('id', { count: 'exact', head: true })
          .eq('page_type', type),
        supabase
          .from('seo_page_scores')
          .select('id', { count: 'exact', head: true })
          .eq('page_type', type)
          .eq('is_orphan', true),
        supabase
          .from('seo_page_scores')
          .select('link_score')
          .eq('page_type', type)
          .not('link_score', 'is', null)
          .limit(5000),
      ])
      const typeScores = scoresRes.data ?? []
      const avgScore = typeScores.length > 0
        ? Math.round((typeScores.reduce((s, r) => s + Number(r.link_score), 0) / typeScores.length) * 100) / 100
        : 0

      return {
        type,
        count: countRes.count ?? 0,
        avg_score: avgScore,
        orphans: orphanCountRes.count ?? 0,
      }
    })

    const byTypeResults = await Promise.all(byTypeQueries)
    const by_type: Record<string, { count: number; avg_score: number; orphans: number }> = {}
    for (const item of byTypeResults) {
      if (item.count > 0) {
        by_type[item.type] = { count: item.count, avg_score: item.avg_score, orphans: item.orphans }
      }
    }

    // --- Top pages & worst orphans (already fetched) ---
    const top_pages = (topPagesResult.data ?? []).map(p => ({
      path: p.page_path,
      type: p.page_type,
      score: Number(p.link_score),
      links_in: p.internal_links_in,
      links_out: p.internal_links_out,
    }))

    const worst_orphans = (worstOrphansResult.data ?? []).map(p => ({
      path: p.page_path,
      type: p.page_type,
      score: Number(p.link_score),
      links_in: p.internal_links_in,
      links_out: p.internal_links_out,
      is_indexed: p.is_indexed,
    }))

    // --- Trends: compare orphan count now vs 7 days ago ---
    const [orphansNowRes, orphans7dRes] = await Promise.all([
      supabase
        .from('seo_page_scores')
        .select('id', { count: 'exact', head: true })
        .eq('is_orphan', true),
      supabase
        .from('seo_page_scores')
        .select('id', { count: 'exact', head: true })
        .eq('is_orphan', true)
        .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    const orphans_now = orphansNowRes.count ?? 0
    // Pages orphelines qui n'ont pas ete mises a jour depuis 7j = orphelins "anciens"
    // Pour un vrai delta, il faudrait un snapshot historique. Estimation: anciennes orphelines
    const orphans_7d_ago = orphans7dRes.count ?? 0

    const trends = {
      orphans_7d_ago: orphans_7d_ago > 0 ? orphans_7d_ago : orphans_now,
      orphans_now,
      delta: orphans_now - (orphans_7d_ago > 0 ? orphans_7d_ago : orphans_now),
    }

    const elapsed = Date.now() - start

    logger.info('[seo-monitor] Dashboard generated', {
      action: 'seo-monitor',
      totalPages: overview.total_pages,
      orphanCritical: overview.orphan_critical,
      elapsed: `${elapsed}ms`,
    } as Record<string, unknown>)

    return NextResponse.json({
      overview,
      by_type,
      top_pages,
      worst_orphans,
      trends,
      generated_at: new Date().toISOString(),
      elapsed_ms: elapsed,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('[seo-monitor] Failed', err, { action: 'seo-monitor' })

    return NextResponse.json(
      { error: 'SEO monitor failed', message },
      { status: 500 },
    )
  }
}
