import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/seo/ctr-crisis
 *
 * Returns pages with >50 impressions and <2% CTR in the last 28 days.
 * These pages rank well but fail to attract clicks — meta titles/descriptions
 * likely need optimization.
 *
 * Uses the seo_ctr_crisis SQL view (migration 364).
 */
export async function GET() {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('seo_ctr_crisis')
    .select('page_path, total_impressions, total_clicks, ctr_percent, avg_position')
    .order('total_impressions', { ascending: false })
    .limit(200)

  if (error) {
    // View might not exist — fallback to direct query
    if (error.message?.includes('relation') || error.code === '42P01') {
      const cutoff = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]

      const { data: rawData, error: rawError } = await supabase
        .from('gsc_daily_metrics')
        .select('page_path, impressions, clicks, position')
        .gte('date', cutoff)
        .order('impressions', { ascending: false })
        .limit(10000)

      if (rawError) {
        return NextResponse.json(
          { error: 'Erreur lors de la requete gsc_daily_metrics', details: rawError.message },
          { status: 500 }
        )
      }

      // Aggregate by page
      const grouped = new Map<
        string,
        { impressions: number; clicks: number; positions: number[]; count: number }
      >()
      for (const row of rawData || []) {
        const existing = grouped.get(row.page_path) || {
          impressions: 0,
          clicks: 0,
          positions: [],
          count: 0,
        }
        existing.impressions += row.impressions || 0
        existing.clicks += row.clicks || 0
        existing.positions.push(Number(row.position))
        existing.count++
        grouped.set(row.page_path, existing)
      }

      const results = Array.from(grouped.entries())
        .map(([page_path, val]) => {
          const avgPos = val.positions.reduce((a, b) => a + b, 0) / val.positions.length
          const ctr = val.impressions > 0 ? val.clicks / val.impressions : 0
          return {
            page_path,
            total_impressions: val.impressions,
            total_clicks: val.clicks,
            ctr_percent: Math.round(ctr * 10000) / 100,
            avg_position: Math.round(avgPos * 100) / 100,
          }
        })
        .filter((r) => r.total_impressions > 50 && r.ctr_percent < 2)
        .sort((a, b) => b.total_impressions - a.total_impressions)
        .slice(0, 200)

      return NextResponse.json({
        data: results,
        count: results.length,
        source: 'fallback_query',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la requete seo_ctr_crisis', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data: data || [],
    count: data?.length || 0,
    source: 'view',
    timestamp: new Date().toISOString(),
  })
}
