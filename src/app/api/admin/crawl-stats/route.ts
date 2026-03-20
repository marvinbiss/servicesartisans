import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const supabase = createAdminClient()

  // Run all queries in parallel
  const [topPages, crawlRate, pageTypes, recentCrawls] = await Promise.all([
    // Top 100 most crawled pages (last 30 days)
    supabase
      .from('googlebot_logs')
      .select('url')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .limit(10000),

    // Crawl rate per day (last 14 days)
    supabase.rpc('googlebot_crawl_rate_by_day'),

    // Distribution by page type
    supabase.rpc('googlebot_page_type_distribution'),

    // Latest 50 crawls
    supabase
      .from('googlebot_logs')
      .select('url, user_agent, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  // Aggregate top pages in JS (simpler than a SQL function)
  const pageCounts = new Map<string, number>()
  for (const row of topPages.data || []) {
    pageCounts.set(row.url, (pageCounts.get(row.url) || 0) + 1)
  }
  const topPagesResult = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([url, count]) => ({ url, count }))

  return NextResponse.json({
    topPages: topPagesResult,
    crawlRate: crawlRate.data || [],
    pageTypes: pageTypes.data || [],
    recentCrawls: recentCrawls.data || [],
    totalCrawls30d: topPages.data?.length || 0,
  })
}
