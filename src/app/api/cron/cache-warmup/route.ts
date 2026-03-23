import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes } from '@/lib/data/france'
import { logger } from '@/lib/logger'

/**
 * Cache warmup cron — pre-warms ISR cache for strategic pages.
 * Runs every 2 hours. Warms ~7 000 URLs so Googlebot always hits warm cache.
 *
 * Without this, pages serve at 375ms (cold) instead of 76ms (warm).
 * After each Vercel deploy, 100% cache is invalidated → this restores it.
 *
 * Strategy:
 * - ALL 47 service hubs (high PageRank)
 * - ALL 2 267 city hubs (local SEO breadth)
 * - Service×ville for top 100 cities (conversion pages)
 * - Static pages (homepage, FAQ, contact, etc.)
 *
 * Fits within 60s Vercel cron timeout at 50 parallel + ~400ms/batch.
 */

const TOP_100_CITY_COUNT = 100

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const urls: string[] = []
  const top100Cities = villes.slice(0, TOP_100_CITY_COUNT)

  // Static pages: ~15
  urls.push(
    SITE_URL,
    `${SITE_URL}/services`,
    `${SITE_URL}/inscription`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/faq`,
    `${SITE_URL}/a-propos`,
    `${SITE_URL}/tarifs`,
    `${SITE_URL}/devis`,
    `${SITE_URL}/urgence`,
    `${SITE_URL}/villes`,
    `${SITE_URL}/departements`,
    `${SITE_URL}/regions`,
    `${SITE_URL}/comparaison`,
    `${SITE_URL}/guides`,
  )

  // ALL service hub pages: 47
  for (const service of services) {
    urls.push(`${SITE_URL}/services/${service.slug}`)
  }

  // ALL city hub pages: 2 267
  for (const ville of villes) {
    urls.push(`${SITE_URL}/villes/${ville.slug}`)
  }

  // Service × top 100 cities: 47 × 100 = 4 700 (conversion pages)
  for (const service of services) {
    for (const ville of top100Cities) {
      urls.push(`${SITE_URL}/services/${service.slug}/${ville.slug}`)
    }
  }

  // Safety: cap at 7 500 to stay within 60s timeout
  const cappedUrls = urls.slice(0, 7_500)

  // Fetch in batches of 50 to avoid overwhelming the origin
  const BATCH_SIZE = 50
  let warmed = 0
  let failed = 0
  const startTime = Date.now()

  for (let i = 0; i < cappedUrls.length; i += BATCH_SIZE) {
    // Safety: abort if approaching timeout (55s)
    if (Date.now() - startTime > 55_000) {
      logger.warn('[cache-warmup] Approaching timeout, stopping early', {
        processed: i,
        total: cappedUrls.length,
      })
      break
    }

    const batch = cappedUrls.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(url =>
        fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'SA-Cache-Warmup/1.0' },
          signal: AbortSignal.timeout(8000),
        })
      )
    )
    warmed += results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<Response>).value.ok).length
    failed += results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r as PromiseFulfilledResult<Response>).value.ok)).length
  }

  const duration = Date.now() - startTime

  logger.info('[cache-warmup] Completed', {
    total: cappedUrls.length,
    warmed,
    failed,
    durationMs: duration,
  })

  return NextResponse.json({
    success: true,
    total: cappedUrls.length,
    warmed,
    failed,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  })
}
