import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getQuartiersByVille } from '@/lib/data/france'

/**
 * Sitemap index generator — workaround for Next.js 14.2 not auto-generating
 * the sitemap index at /sitemap.xml when using generateSitemaps().
 *
 * This route is rewritten from /sitemap.xml via next.config.js.
 * Keep in sync with generateSitemaps() in src/app/sitemap.ts.
 */
export async function GET() {
  // Compute the same sitemap IDs as generateSitemaps() in sitemap.ts
  let totalQuartierUrls = 0
  for (const v of villes) {
    totalQuartierUrls += (getQuartiersByVille(v.slug)?.length || 0) * services.length
  }
  const sqBatchCount = Math.ceil(totalQuartierUrls / 45000)

  const emergencySlugs = Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
  const tradeSlugs = getTradesSlugs()
  const serviceCityBatches = Math.ceil(services.length * villes.length / 45000)

  const ids: string[] = [
    'static',
    'service-cities',
    'cities',
    'geo',
    'quartiers',
    ...Array.from({ length: sqBatchCount }, (_, i) => `service-quartiers-${i}`),
    'devis-services',
    ...Array.from({ length: serviceCityBatches }, (_, i) => `devis-service-cities-${i}`),
    ...Array.from({ length: sqBatchCount }, (_, i) => `devis-quartiers-${i}`),
    ...Array.from({ length: Math.ceil(emergencySlugs.length * villes.length / 45000) }, (_, i) => `urgence-service-cities-${i}`),
    ...Array.from({ length: serviceCityBatches }, (_, i) => `tarifs-service-cities-${i}`),
    'avis-services',
    ...Array.from({ length: serviceCityBatches }, (_, i) => `avis-service-cities-${i}`),
    'problemes',
    ...Array.from({ length: Math.ceil(30 * villes.length / 45000) }, (_, i) => `problemes-cities-${i}`),
    ...Array.from({ length: Math.ceil(departements.length * tradeSlugs.length / 45000) }, (_, i) => `dept-services-${i}`),
    'region-services',
    'guides',
  ]

  // Provider sitemaps (DB-dependent, skip if unavailable)
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('noindex', false)

    if (!error && count && count > 0) {
      const batchCount = Math.ceil(count / 40_000)
      for (let i = 0; i < batchCount; i++) {
        ids.push(`providers-${i}`)
      }
    }
  } catch {
    // DB unavailable — omit provider sitemaps from index
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ids.map(id => `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>`),
    '</sitemapindex>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
