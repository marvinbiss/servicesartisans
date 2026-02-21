import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getQuartiersByVille } from '@/lib/data/france'

// Must match the BATCH constant used in sitemap.ts
const BATCH_SIZE = 10_000
const PROVIDER_BATCH_SIZE = 5_000

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
  const sqBatchCount = Math.ceil(totalQuartierUrls / BATCH_SIZE)

  const emergencySlugs = Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
  const tradeSlugs = getTradesSlugs()
  const avisServiceSlugs = Object.keys(tradeContent)
  const serviceCityBatches = Math.ceil(services.length * villes.length / BATCH_SIZE)

  // Phase 1: service × top-300 cities only (conservative crawl budget for new domain).
  // Must match TOP_CITIES_PHASE1 in sitemap.ts.
  const TOP_CITIES_PHASE1 = 300
  const serviceCitiesBatchCount = Math.ceil(services.length * TOP_CITIES_PHASE1 / BATCH_SIZE)

  const ids: string[] = [
    'static',
    // service × city pages — batched to stay under BATCH_SIZE limit
    ...Array.from({ length: serviceCitiesBatchCount }, (_, i) => `service-cities-${i}`),
    'cities',
    'geo',
    'quartiers',
    ...Array.from({ length: sqBatchCount }, (_, i) => `service-quartiers-${i}`),
    'devis-services',
    ...Array.from({ length: serviceCityBatches }, (_, i) => `devis-service-cities-${i}`),
    ...Array.from({ length: sqBatchCount }, (_, i) => `devis-quartiers-${i}`),
    ...Array.from({ length: Math.ceil(emergencySlugs.length * villes.length / BATCH_SIZE) }, (_, i) => `urgence-service-cities-${i}`),
    ...Array.from({ length: serviceCityBatches }, (_, i) => `tarifs-service-cities-${i}`),
    'avis-services',
    // avis-service-cities uses tradeContent keys (not services) — use correct count
    ...Array.from({ length: Math.ceil(avisServiceSlugs.length * villes.length / BATCH_SIZE) }, (_, i) => `avis-service-cities-${i}`),
    'problemes',
    // problemes-cities uses actual getProblemSlugs() count — approximated conservatively
    ...Array.from({ length: Math.ceil(30 * villes.length / BATCH_SIZE) }, (_, i) => `problemes-cities-${i}`),
    ...Array.from({ length: Math.ceil(departements.length * tradeSlugs.length / BATCH_SIZE) }, (_, i) => `dept-services-${i}`),
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
      const batchCount = Math.ceil(count / PROVIDER_BATCH_SIZE)
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
