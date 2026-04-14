import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/seo/crawl-budget
 *
 * Returns crawl budget analytics from googlebot_logs:
 * - Pages crawled per day (last 14 days)
 * - Top crawled pages (last 30 days)
 * - Crawl frequency by URL section
 * - Crawl distribution by hour of day
 */
export async function GET() {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const supabase = createAdminClient()
  const d30 = new Date(Date.now() - 30 * 86400000).toISOString()
  const d7 = new Date(Date.now() - 7 * 86400000).toISOString()

  // Fetch raw data in parallel
  const [recentLogs, last7dLogs] = await Promise.all([
    // Last 30 days for top pages
    supabase.from('googlebot_logs').select('url, created_at').gte('created_at', d30).limit(50000),

    // Last 7 days for frequency analysis
    supabase.from('googlebot_logs').select('url, created_at').gte('created_at', d7).limit(20000),
  ])

  // ── Pages per day (last 30 days) ─────────────────────────────────────────
  const crawlsByDay = new Map<string, number>()
  for (const row of recentLogs.data || []) {
    const day = row.created_at?.split('T')[0]
    if (day) {
      crawlsByDay.set(day, (crawlsByDay.get(day) || 0) + 1)
    }
  }
  const pagesPerDay = Array.from(crawlsByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ── Top 50 most crawled pages ────────────────────────────────────────────
  const pageCounts = new Map<string, number>()
  for (const row of recentLogs.data || []) {
    pageCounts.set(row.url, (pageCounts.get(row.url) || 0) + 1)
  }
  const topCrawled = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([url, count]) => ({ url, count }))

  // ── Crawl frequency by section ───────────────────────────────────────────
  const sectionCounts = new Map<string, number>()
  for (const row of recentLogs.data || []) {
    let section = '/'
    try {
      const path = new URL(row.url).pathname
      const parts = path.split('/').filter(Boolean)
      section = parts.length > 0 ? `/${parts[0]}` : '/'
    } catch {
      // Keep default section
    }
    sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1)
  }
  const bySection = Array.from(sectionCounts.entries())
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count)

  // ── Crawl distribution by hour (last 7 days) ────────────────────────────
  const hourCounts = new Map<number, number>()
  for (const row of last7dLogs.data || []) {
    if (row.created_at) {
      const hour = new Date(row.created_at).getUTCHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    }
  }
  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: hourCounts.get(h) || 0,
  }))

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalCrawls30d = recentLogs.data?.length || 0
  const totalCrawls7d = last7dLogs.data?.length || 0
  const avgPerDay30d = pagesPerDay.length > 0 ? Math.round(totalCrawls30d / pagesPerDay.length) : 0
  const uniquePages30d = pageCounts.size

  return NextResponse.json({
    summary: {
      total_crawls_30d: totalCrawls30d,
      total_crawls_7d: totalCrawls7d,
      avg_crawls_per_day: avgPerDay30d,
      unique_pages_crawled_30d: uniquePages30d,
    },
    pages_per_day: pagesPerDay,
    top_crawled: topCrawled,
    by_section: bySection,
    by_hour: byHour,
    timestamp: new Date().toISOString(),
  })
}
