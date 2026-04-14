import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/seo/overview
 *
 * Returns SEO dashboard overview:
 * - Total clicks/impressions last 7d and 28d
 * - Trending pages (biggest click gains week-over-week)
 * - Alerts (pages not indexed, major click drops)
 */
export async function GET() {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const supabase = createAdminClient()
  const now = new Date()
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]
  const d14 = new Date(now.getTime() - 14 * 86400000).toISOString().split('T')[0]
  const d28 = new Date(now.getTime() - 28 * 86400000).toISOString().split('T')[0]

  // Run all queries in parallel — include page_path everywhere to avoid double-fetch
  const [metrics28d, metricsPrev7d, lifecycleAlerts] = await Promise.all([
    // Last 28 days (includes the last 7d subset)
    supabase
      .from('gsc_daily_metrics')
      .select('page_path, date, clicks, impressions')
      .gte('date', d28),

    // Previous 7 days (days -14 to -7) for trend comparison
    supabase.from('gsc_daily_metrics').select('page_path, clicks').gte('date', d14).lt('date', d7),

    // Pages crawled but never indexed (lifecycle alerts)
    supabase
      .from('seo_page_lifecycle')
      .select('page_path, first_crawled_at, first_indexed_at')
      .not('first_crawled_at', 'is', null)
      .is('first_indexed_at', null)
      .order('first_crawled_at', { ascending: true })
      .limit(20),
  ])

  // ── Aggregate totals ──────────────────────────────────────────────────
  const total7d = { clicks: 0, impressions: 0 }
  const total28d = { clicks: 0, impressions: 0 }
  const current7dByPage = new Map<string, number>()

  for (const row of metrics28d.data || []) {
    total28d.clicks += row.clicks || 0
    total28d.impressions += row.impressions || 0

    // Check if row is within last 7 days
    if (row.date >= d7) {
      total7d.clicks += row.clicks || 0
      total7d.impressions += row.impressions || 0
      current7dByPage.set(
        row.page_path,
        (current7dByPage.get(row.page_path) || 0) + (row.clicks || 0)
      )
    }
  }

  // CTR calculations
  const ctr7d = total7d.impressions > 0 ? total7d.clicks / total7d.impressions : 0
  const ctr28d = total28d.impressions > 0 ? total28d.clicks / total28d.impressions : 0

  // ── Trending pages (current 7d vs previous 7d) ────────────────────────
  const prev7dByPage = new Map<string, number>()
  for (const row of metricsPrev7d.data || []) {
    prev7dByPage.set(row.page_path, (prev7dByPage.get(row.page_path) || 0) + (row.clicks || 0))
  }

  const trendingPages: Array<{
    page_path: string
    clicks_7d: number
    clicks_prev_7d: number
    change: number
  }> = []

  for (const [page, currentClicks] of Array.from(current7dByPage.entries())) {
    const prevClicks = prev7dByPage.get(page) || 0
    trendingPages.push({
      page_path: page,
      clicks_7d: currentClicks,
      clicks_prev_7d: prevClicks,
      change: currentClicks - prevClicks,
    })
  }
  trendingPages.sort((a, b) => b.change - a.change)

  // ── Alerts ────────────────────────────────────────────────────────────
  const alerts: Array<{ type: string; message: string; page_path?: string }> = []

  // Alert: pages crawled but never indexed after 14+ days
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString()
  for (const page of lifecycleAlerts.data || []) {
    if (page.first_crawled_at && page.first_crawled_at < fourteenDaysAgo) {
      const daysSinceCrawl = Math.floor(
        (now.getTime() - new Date(page.first_crawled_at).getTime()) / 86400000
      )
      alerts.push({
        type: 'not_indexed',
        message: `Page crawlee depuis ${daysSinceCrawl}j mais jamais indexee`,
        page_path: page.page_path,
      })
    }
  }

  // Alert: biggest losers (pages losing >50% clicks week-over-week)
  const losers = trendingPages
    .filter((p) => p.clicks_prev_7d >= 5 && p.change < -p.clicks_prev_7d * 0.5)
    .slice(0, 5)

  for (const page of losers) {
    const pctDrop = Math.round((Math.abs(page.change) / page.clicks_prev_7d) * 100)
    alerts.push({
      type: 'click_drop',
      message: `Perte de ${Math.abs(page.change)} clics (-${pctDrop}%)`,
      page_path: page.page_path,
    })
  }

  return NextResponse.json({
    period_7d: {
      clicks: total7d.clicks,
      impressions: total7d.impressions,
      ctr: Math.round(ctr7d * 10000) / 100,
    },
    period_28d: {
      clicks: total28d.clicks,
      impressions: total28d.impressions,
      ctr: Math.round(ctr28d * 10000) / 100,
    },
    trending_pages: trendingPages.slice(0, 20),
    alerts: alerts.slice(0, 20),
    timestamp: new Date().toISOString(),
  })
}
