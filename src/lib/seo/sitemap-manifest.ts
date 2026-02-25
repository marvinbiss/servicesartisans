/**
 * Sitemap Manifest — Single source of truth for all sitemap IDs.
 *
 * SMART SITEMAP v2 — Pruned for young domain (crawl budget optimization)
 * Target: 2,000–3,500 static URLs (+ dynamic provider pages from DB).
 *
 * Strategy:
 * - Niveau 1 (always): homepage, static pages, blog, all hub pages, geo pages
 * - Niveau 2 (conditional): service × top N cities (most populated)
 * - Niveau 3 (excluded from sitemap, still indexable via internal linking):
 *   quartiers, devis×city, tarifs×city, avis×city, urgence×city,
 *   problemes×city, dept×service, region×service, individual city pages
 *
 * INVARIANTS (tested, CI-enforced):
 * 1. Both `src/app/sitemap.ts` (generateSitemaps) and
 *    `src/app/api/sitemap-index/route.ts` MUST consume these helpers
 *    so the two lists can never drift apart.
 * 2. `src/app/api/sitemap-providers/route.ts` MUST import PROVIDER_BATCH_SIZE
 *    from this module — never define its own.
 * 3. All batch sizes MUST stay below Google's 50,000 URL limit.
 * 4. All sitemap `<loc>` values MUST be escaped via `escapeXmlLoc()`.
 */

import { services } from '@/lib/data/france'
import { SITE_URL } from '@/lib/seo/config'

// ── Protocol limits ──────────────────────────────────────────────────────────
/** Google sitemap protocol: max 50,000 URLs per sitemap file */
export const GOOGLE_MAX_URLS_PER_SITEMAP = 50_000

// ── Batch constants (shared — NEVER duplicate these in other files) ──────────
export const STATIC_BATCH = 10_000
export const LARGE_BATCH = 45_000
export const PROVIDER_BATCH_SIZE = 5_000

// Compile-time assertion: batch sizes must respect Google limits
if (STATIC_BATCH > GOOGLE_MAX_URLS_PER_SITEMAP) throw new Error(`STATIC_BATCH (${STATIC_BATCH}) exceeds Google limit`)
if (LARGE_BATCH > GOOGLE_MAX_URLS_PER_SITEMAP) throw new Error(`LARGE_BATCH (${LARGE_BATCH}) exceeds Google limit`)
if (PROVIDER_BATCH_SIZE > GOOGLE_MAX_URLS_PER_SITEMAP) throw new Error(`PROVIDER_BATCH_SIZE (${PROVIDER_BATCH_SIZE}) exceeds Google limit`)

/**
 * Top N cities included in service × city sitemaps.
 * Villes array is sorted by population (Paris, Marseille, Lyon, ...).
 * Keep low for young domains. Increase once domain authority grows (month 6+).
 *
 * 40 cities × 46 services = 1,840 URLs — well within crawl budget.
 */
export const SITEMAP_TOP_CITIES = 40

// ── XML Escaping (centralized, reused by all sitemap routes) ─────────────────

/**
 * Escape a string for use inside XML `<loc>` elements.
 * Handles the 5 XML special characters per the XML 1.0 spec.
 * MUST be used for all dynamic content inserted into sitemap XML.
 */
export function escapeXmlLoc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ── Main exports ─────────────────────────────────────────────────────────────

/**
 * All sitemap IDs that can be computed without a database call.
 * Deterministic & pure — safe to call at build-time.
 *
 * Smart sitemap v2: only 3 static sitemaps
 * - 'static': homepage + static pages + blog + all hub/service pages (~520 URLs)
 * - 'service-cities-0': top 40 cities × all services (1,840 URLs)
 * - 'geo': départements + régions (~120 URLs)
 */
export function getStaticSitemapIds(): string[] {
  return [
    'static',

    // service × city — top N cities only (conservative crawl budget)
    ...Array.from(
      { length: Math.ceil(services.length * SITEMAP_TOP_CITIES / LARGE_BATCH) },
      (_, i) => `service-cities-${i}`,
    ),

    'geo',
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
