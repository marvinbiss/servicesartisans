import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'

/**
 * Cache warmup cron — pre-warms ISR cache for top pages after deploy.
 * Runs every 2 hours. Warms ~350 strategic URLs so Googlebot always hits warm cache.
 *
 * Without this, 75% of pages serve at 375ms (cold) instead of 76ms (warm).
 * After each Vercel deploy, 100% cache is invalidated → this restores it.
 */

const TOP_SERVICES = [
  'plombier', 'electricien', 'serrurier', 'chauffagiste',
  'menuisier', 'couvreur', 'peintre-en-batiment', 'carreleur',
  'macon', 'climaticien', 'vitrier', 'jardinier',
]

const TOP_VILLES = [
  'paris', 'marseille', 'lyon', 'toulouse', 'nice',
  'nantes', 'montpellier', 'strasbourg', 'bordeaux', 'lille',
  'rennes', 'reims', 'saint-etienne', 'toulon', 'le-havre',
  'grenoble', 'dijon', 'angers', 'nimes', 'villeurbanne',
  'clermont-ferrand', 'aix-en-provence', 'brest', 'tours', 'amiens',
]

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const urls: string[] = []

  // Service hub pages: 12
  for (const service of TOP_SERVICES) {
    urls.push(`${SITE_URL}/services/${service}`)
  }

  // Service × ville: 12 × 25 = 300
  for (const service of TOP_SERVICES) {
    for (const ville of TOP_VILLES) {
      urls.push(`${SITE_URL}/services/${service}/${ville}`)
    }
  }

  // Ville hub pages: 25
  for (const ville of TOP_VILLES) {
    urls.push(`${SITE_URL}/villes/${ville}`)
  }

  // Static pages: ~10
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
  )

  // Fetch in batches of 50 to avoid overwhelming the origin
  const BATCH_SIZE = 50
  let warmed = 0
  let failed = 0
  const startTime = Date.now()

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(url =>
        fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'SA-Cache-Warmup/1.0' },
          signal: AbortSignal.timeout(10000),
        })
      )
    )
    warmed += results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<Response>).value.ok).length
    failed += results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r as PromiseFulfilledResult<Response>).value.ok)).length
  }

  const duration = Date.now() - startTime

  logger.info('[cache-warmup] Completed', {
    total: urls.length,
    warmed,
    failed,
    durationMs: duration,
  })

  return NextResponse.json({
    success: true,
    total: urls.length,
    warmed,
    failed,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  })
}
