import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

/**
 * Cache warmup cron — rotation-based strategy.
 * Runs every 2h (12 runs/day). Covers 20,000+ strategic pages in 24h.
 *
 * Every run (~2,300 URLs):
 *   - 15 static pages
 *   - 47 service hubs
 *   - 2,267 city hubs (high value local SEO)
 *
 * Rotating by slot (based on UTC hour):
 *   Slots 0-3:  service × ville (top 100, 25 cities/slot)
 *   Slots 4-5:  devis × ville (top 100, 50 cities/slot)
 *   Slots 6-7:  tarifs × ville (top 100, 50 cities/slot)
 *   Slots 8-9:  urgence × ville (top 100, 50 cities/slot)
 *   Slot 10:    avis × ville (top 50)
 *   Slot 11:    departements × service
 *
 * In 24h ALL ~20,000 strategic pages get warmed.
 */

const MAX_URLS_PER_RUN = 7_500
const BATCH_SIZE = 50
const SAFETY_TIMEOUT_MS = 55_000
const REQUEST_TIMEOUT_MS = 8_000
const TOP_100_CITIES = villes.slice(0, 100)
const TOP_50_CITIES = villes.slice(0, 50)

type SlotCategory =
  | 'service×ville'
  | 'devis×ville'
  | 'tarifs×ville'
  | 'urgence×ville'
  | 'avis×ville'
  | 'departements×service'

function getSlot(): number {
  const hour = new Date().getUTCHours()
  return Math.floor(hour / 2) // 0-11
}

function getStaticUrls(): string[] {
  return [
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
  ]
}

function getServiceHubUrls(): string[] {
  return services.map((s) => `${SITE_URL}/services/${s.slug}`)
}

function getCityHubUrls(): string[] {
  return villes.map((v) => `${SITE_URL}/villes/${v.slug}`)
}

function getRotatingUrls(slot: number): { category: SlotCategory; urls: string[] } {
  const urgenceSlugs = Object.keys(tradeContent)
  const tradesSlugs = getTradesSlugs()

  switch (slot) {
    // Slots 0-3: service × ville (top 100 cities, 25 cities per slot)
    case 0:
    case 1:
    case 2:
    case 3: {
      const slotIndex = slot
      const citiesPerSlot = 25
      const citySlice = TOP_100_CITIES.slice(
        slotIndex * citiesPerSlot,
        (slotIndex + 1) * citiesPerSlot
      )
      const urls: string[] = []
      for (const service of services) {
        for (const ville of citySlice) {
          urls.push(`${SITE_URL}/services/${service.slug}/${ville.slug}`)
        }
      }
      return { category: 'service×ville', urls }
    }

    // Slots 4-5: devis × ville (top 100 cities, 50 cities per slot)
    case 4:
    case 5: {
      const slotIndex = slot - 4
      const citiesPerSlot = 50
      const citySlice = TOP_100_CITIES.slice(
        slotIndex * citiesPerSlot,
        (slotIndex + 1) * citiesPerSlot
      )
      const urls: string[] = []
      for (const service of services) {
        for (const ville of citySlice) {
          urls.push(`${SITE_URL}/services/${service.slug}/${ville.slug}`)
        }
      }
      return { category: 'devis×ville', urls }
    }

    // Slots 6-7: tarifs × ville (top 100 cities, 50 cities per slot)
    case 6:
    case 7: {
      const slotIndex = slot - 6
      const citiesPerSlot = 50
      const citySlice = TOP_100_CITIES.slice(
        slotIndex * citiesPerSlot,
        (slotIndex + 1) * citiesPerSlot
      )
      const urls: string[] = []
      for (const service of services) {
        for (const ville of citySlice) {
          urls.push(`${SITE_URL}/tarifs/${service.slug}/${ville.slug}`)
        }
      }
      return { category: 'tarifs×ville', urls }
    }

    // Slots 8-9: urgence × ville (top 100 cities, 50 cities per slot)
    case 8:
    case 9: {
      const slotIndex = slot - 8
      const citiesPerSlot = 50
      const citySlice = TOP_100_CITIES.slice(
        slotIndex * citiesPerSlot,
        (slotIndex + 1) * citiesPerSlot
      )
      const urls: string[] = []
      for (const serviceSlug of urgenceSlugs) {
        for (const ville of citySlice) {
          urls.push(`${SITE_URL}/urgence/${serviceSlug}/${ville.slug}`)
        }
      }
      return { category: 'urgence×ville', urls }
    }

    // Slot 10: avis × ville (top 50 cities)
    case 10: {
      const urls: string[] = []
      for (const serviceSlug of urgenceSlugs) {
        for (const ville of TOP_50_CITIES) {
          urls.push(`${SITE_URL}/avis/${serviceSlug}/${ville.slug}`)
        }
      }
      return { category: 'avis×ville', urls }
    }

    // Slot 11: departements × service
    case 11:
    default: {
      const urls: string[] = []
      for (const dept of departements) {
        for (const serviceSlug of tradesSlugs) {
          urls.push(`${SITE_URL}/departements/${dept.slug}/${serviceSlug}`)
        }
      }
      return { category: 'departements×service', urls }
    }
  }
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const slot = getSlot()
  const urls: string[] = []

  // Always: static pages + service hubs + city hubs (~2,300)
  urls.push(...getStaticUrls())
  urls.push(...getServiceHubUrls())
  urls.push(...getCityHubUrls())

  // Rotating: based on slot (~1,150 to ~3,885)
  const { category, urls: rotatingUrls } = getRotatingUrls(slot)
  urls.push(...rotatingUrls)

  // Cap at 7,500 to stay within 60s timeout
  const cappedUrls = urls.slice(0, MAX_URLS_PER_RUN)

  logger.info('[cache-warmup] Starting', {
    slot,
    category,
    alwaysUrls: urls.length - rotatingUrls.length,
    rotatingUrls: rotatingUrls.length,
    totalUrls: urls.length,
    cappedAt: cappedUrls.length,
  })

  // Fetch in batches of 50 to avoid overwhelming the origin
  let warmed = 0
  let failed = 0
  const startTime = Date.now()

  for (let i = 0; i < cappedUrls.length; i += BATCH_SIZE) {
    // Safety: abort if approaching timeout (55s)
    if (Date.now() - startTime > SAFETY_TIMEOUT_MS) {
      logger.warn('[cache-warmup] Approaching timeout, stopping early', {
        processed: i,
        total: cappedUrls.length,
        slot,
        category,
      })
      break
    }

    const batch = cappedUrls.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((url) =>
        fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'SA-Cache-Warmup/1.0' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        })
      )
    )
    warmed += results.filter(
      (r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<Response>).value.ok
    ).length
    failed += results.filter(
      (r) =>
        r.status === 'rejected' ||
        (r.status === 'fulfilled' && !(r as PromiseFulfilledResult<Response>).value.ok)
    ).length
  }

  const duration = Date.now() - startTime

  logger.info('[cache-warmup] Completed', {
    slot,
    category,
    total: cappedUrls.length,
    warmed,
    failed,
    durationMs: duration,
  })

  return NextResponse.json({
    success: true,
    slot,
    category,
    total: cappedUrls.length,
    warmed,
    failed,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  })
}
