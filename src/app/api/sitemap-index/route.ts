import { NextResponse } from 'next/server'
import { getSitemapIndexUrls } from '@/lib/seo/sitemap-manifest'

/**
 * Sitemap index generator — workaround for Next.js 14.2 not auto-generating
 * the sitemap index at /sitemap.xml when using generateSitemaps().
 *
 * This route is rewritten from /sitemap.xml via next.config.js.
 * Single source of truth: `@/lib/seo/sitemap-manifest`
 */
export async function GET() {
  // Fetch active provider count for dynamic sitemaps
  let activeProvidersCount = 0
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('noindex', false)

    if (!error && count && count > 0) {
      activeProvidersCount = count
    }
  } catch {
    // DB unavailable — omit provider sitemaps from index
  }

  const urls = getSitemapIndexUrls({ activeProvidersCount })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(loc => `  <sitemap><loc>${loc}</loc></sitemap>`),
    '</sitemapindex>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
