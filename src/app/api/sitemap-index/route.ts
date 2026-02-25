import { NextResponse } from 'next/server'
import { getSitemapIndexUrls, escapeXmlLoc, PROVIDER_BATCH_SIZE } from '@/lib/seo/sitemap-manifest'
import { logger } from '@/lib/logger'

const sitemapLog = logger.child({ component: 'sitemap-index' })

/**
 * Sitemap index generator — workaround for Next.js 14.2 not auto-generating
 * the sitemap index at /sitemap.xml when using generateSitemaps().
 *
 * This route is rewritten from /sitemap.xml via next.config.js.
 * Single source of truth: `@/lib/seo/sitemap-manifest`
 *
 * Provider batch count strategy (in order):
 *   1. Read batch_count from active snapshot in sitemap_snapshots (fast, accurate)
 *   2. Read MAX(batch_id) from provider_sitemap_urls (pre-computed table fallback)
 *   3. COUNT(*) on providers table (legacy fallback)
 */
export async function GET() {
  const startMs = Date.now()

  // Determine provider batch count for dynamic sitemaps.
  let activeProvidersCount = 0
  let source = 'none'
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Strategy 1: get batch count from active snapshot metadata (fastest, most accurate)
    const { data: snapshotData, error: snapshotError } = await supabase
      .from('sitemap_snapshots')
      .select('snapshot_id, batch_count, max_batch_id')
      .eq('status', 'active')
      .limit(1)

    if (!snapshotError && snapshotData && snapshotData.length > 0 && snapshotData[0].batch_count) {
      activeProvidersCount = snapshotData[0].batch_count * PROVIDER_BATCH_SIZE
      source = 'precomputed'
    } else {
      // Strategy 2: read MAX(batch_id) from provider_sitemap_urls table
      const { data: batchData, error: batchError } = await supabase
        .from('provider_sitemap_urls')
        .select('batch_id')
        .order('batch_id', { ascending: false })
        .limit(1)

      if (!batchError && batchData && batchData.length > 0) {
        const maxBatchId = batchData[0].batch_id
        activeProvidersCount = (maxBatchId + 1) * PROVIDER_BATCH_SIZE
        source = 'precomputed'
      } else {
        // Strategy 3: count providers directly (legacy behavior)
        const { count, error } = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('noindex', false)

        if (error) {
          sitemapLog.error('sitemap-index: Supabase query error, omitting provider sitemaps', {
            code: error.code,
            message: error.message,
            details: error.details,
          })
        } else if (count && count > 0) {
          activeProvidersCount = count
          source = 'providers-count'
        }
      }
    }
  } catch (err) {
    sitemapLog.error('sitemap-index: DB query failed (thrown), omitting provider sitemaps', err)
  }

  const urls = getSitemapIndexUrls({ activeProvidersCount })
  const durationMs = Date.now() - startMs

  sitemapLog.info('sitemap-index generated', {
    activeProvidersCount: String(activeProvidersCount),
    totalSitemaps: String(urls.length),
    durationMs: String(durationMs),
    source,
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(loc => `  <sitemap><loc>${escapeXmlLoc(loc)}</loc></sitemap>`),
    '</sitemapindex>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
