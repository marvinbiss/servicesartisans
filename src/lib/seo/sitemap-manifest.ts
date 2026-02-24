/**
 * Sitemap Manifest — Single source of truth for all sitemap IDs.
 *
 * Both `src/app/sitemap.ts` (generateSitemaps) and
 * `src/app/api/sitemap-index/route.ts` consume these helpers so the two
 * lists can never drift apart.
 */

import { services, villes, departements, getQuartiersByVille } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { SITE_URL } from '@/lib/seo/config'

// ── Batch constants (shared) ───────────────────────────────────────────────
export const STATIC_BATCH = 10_000
export const LARGE_BATCH = 45_000
export const PROVIDER_BATCH_SIZE = 5_000

/**
 * Phase 1: only submit top-N cities for new domain (conservative crawl budget).
 * Increase to `villes.length` once domain authority grows (month 2-3).
 */
export const TOP_CITIES_PHASE1 = 300

// ── Helpers (exported for tests) ───────────────────────────────────────────

export function getTotalServiceQuartierUrls(): number {
  let total = 0
  for (const v of villes) {
    total += (getQuartiersByVille(v.slug)?.length || 0) * services.length
  }
  return total
}

export function getEmergencySlugs(): string[] {
  return Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
}

export function getAvisServiceSlugs(): string[] {
  return Object.keys(tradeContent)
}

// ── Main exports ───────────────────────────────────────────────────────────

/**
 * All sitemap IDs that can be computed without a database call.
 * Deterministic & pure — safe to call at build-time.
 */
export function getStaticSitemapIds(): string[] {
  const sqBatchCount = Math.ceil(getTotalServiceQuartierUrls() / STATIC_BATCH)
  const emergencySlugs = getEmergencySlugs()
  const avisServiceSlugs = getAvisServiceSlugs()
  const problemSlugs = getProblemSlugs()
  const tradeSlugs = getTradesSlugs()

  return [
    'static',

    // service × city — Phase 1: top cities only (LARGE_BATCH = 45 000)
    ...Array.from(
      { length: Math.ceil(services.length * TOP_CITIES_PHASE1 / LARGE_BATCH) },
      (_, i) => `service-cities-${i}`,
    ),

    // Phase 2 (uncomment when domain authority grows):
    // ...Array.from(
    //   { length: Math.ceil(services.length * (villes.length - TOP_CITIES_PHASE1) / LARGE_BATCH) },
    //   (_, i) => `service-cities-extended-${i}`,
    // ),

    'cities',
    'geo',
    'quartiers',

    ...Array.from({ length: sqBatchCount }, (_, i) => `service-quartiers-${i}`),

    'devis-services',
    ...Array.from(
      { length: Math.ceil(services.length * villes.length / STATIC_BATCH) },
      (_, i) => `devis-service-cities-${i}`,
    ),
    ...Array.from({ length: sqBatchCount }, (_, i) => `devis-quartiers-${i}`),

    ...Array.from(
      { length: Math.ceil(emergencySlugs.length * villes.length / STATIC_BATCH) },
      (_, i) => `urgence-service-cities-${i}`,
    ),

    ...Array.from(
      { length: Math.ceil(services.length * villes.length / STATIC_BATCH) },
      (_, i) => `tarifs-service-cities-${i}`,
    ),

    'avis-services',
    ...Array.from(
      { length: Math.ceil(avisServiceSlugs.length * villes.length / STATIC_BATCH) },
      (_, i) => `avis-service-cities-${i}`,
    ),

    'problemes',
    ...Array.from(
      { length: Math.ceil(problemSlugs.length * villes.length / STATIC_BATCH) },
      (_, i) => `problemes-cities-${i}`,
    ),

    // dept × service — uses LARGE_BATCH (45 000)
    ...Array.from(
      { length: Math.ceil(departements.length * tradeSlugs.length / LARGE_BATCH) },
      (_, i) => `dept-services-${i}`,
    ),

    'region-services',
    'guides',
  ]
}

/**
 * Sitemap IDs that depend on a database query (providers count).
 * Returns an empty array when `activeProvidersCount` is 0 or negative.
 */
export function getDynamicSitemapIds(params: { activeProvidersCount: number }): string[] {
  const { activeProvidersCount } = params
  if (activeProvidersCount <= 0) return []
  const batchCount = Math.ceil(activeProvidersCount / PROVIDER_BATCH_SIZE)
  return Array.from({ length: batchCount }, (_, i) => `providers-${i}`)
}

/**
 * Absolute `<loc>` URLs for the `<sitemapindex>` XML.
 */
export function getSitemapIndexUrls(params: { activeProvidersCount: number }): string[] {
  const staticIds = getStaticSitemapIds()
  const dynamicIds = getDynamicSitemapIds(params)
  return [...staticIds, ...dynamicIds].map(id => `${SITE_URL}/sitemap/${id}.xml`)
}
