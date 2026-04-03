import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/seo/striking-distance
 *
 * Returns pages ranking position 4-10 with high impressions.
 * These are "striking distance" opportunities: a small ranking improvement
 * would yield significant traffic gains.
 *
 * Uses the seo_striking_distance SQL view (migration 364).
 */
export async function GET() {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('seo_striking_distance')
    .select('page_path, query, avg_position, total_impressions, total_clicks, ctr_percent')
    .order('total_impressions', { ascending: false })
    .limit(200)

  if (error) {
    // View might not exist yet — fallback to direct query
    if (error.message?.includes('relation') || error.code === '42P01') {
      const cutoff = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('gsc_daily_metrics')
        .select('page_path, query, position, impressions, clicks')
        .gte('date', cutoff)
        .gte('position', 4)
        .lte('position', 10)
        .gt('impressions', 0)
        .order('impressions', { ascending: false })
        .limit(2000)

      if (fallbackError) {
        return NextResponse.json(
          { error: 'Erreur lors de la requete gsc_daily_metrics', details: fallbackError.message },
          { status: 500 }
        )
      }

      // Aggregate manually
      const grouped = new Map<string, { impressions: number; clicks: number; positions: number[]; count: number }>()
      for (const row of fallbackData || []) {
        const key = `${row.page_path}|||${row.query}`
        const existing = grouped.get(key) || { impressions: 0, clicks: 0, positions: [], count: 0 }
        existing.impressions += row.impressions || 0
        existing.clicks += row.clicks || 0
        existing.positions.push(Number(row.position))
        existing.count++
        grouped.set(key, existing)
      }

      const results = Array.from(grouped.entries())
        .map(([key, val]) => {
          const [page_path, query] = key.split('|||')
          const avgPos = val.positions.reduce((a, b) => a + b, 0) / val.positions.length
          return {
            page_path,
            query,
            avg_position: Math.round(avgPos * 100) / 100,
            total_impressions: val.impressions,
            total_clicks: val.clicks,
            ctr_percent: val.impressions > 0
              ? Math.round((val.clicks / val.impressions) * 10000) / 100
              : 0,
          }
        })
        .filter((r) => r.avg_position >= 4 && r.avg_position <= 10 && r.total_impressions > 20)
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
      { error: 'Erreur lors de la requete seo_striking_distance', details: error.message },
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
