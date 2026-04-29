import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services, departements } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import {
  STATIC_BATCH,
  LARGE_BATCH,
  PROVIDER_BATCH_SIZE,
  MAX_PROVIDER_SITEMAPS,
  SITEMAP_CITY_COUNT,
  SITEMAP_CITY_COUNT_TIER2,
  SITEMAP_SERVICE_CITIES_COUNT,
} from '@/lib/seo/sitemap-config'
import { sitemapHeaders } from '@/lib/seo/sitemap-headers'

/**
 * Sitemap index generator — workaround for Next.js 14.2 not auto-generating
 * the sitemap index at /sitemap.xml when using generateSitemaps().
 *
 * This route is rewritten from /sitemap.xml via next.config.js.
 * Keep in sync with generateSitemaps() in src/app/sitemap.ts.
 *
 * All constants imported from sitemap-config.ts (single source of truth).
 */
export async function GET(request: Request) {
  const emergencySlugs = Object.keys(tradeContent)
  const tradeSlugs = getTradesSlugs()
  const problemSlugs = getProblemSlugs()

  // tarifs-task-cities REMOVED 2026-04-29 — see src/app/sitemap.ts
  // and src/lib/seo/gone-paths.ts. 184K URLs purged via DELETE 410.

  const ids: string[] = [
    'static',
    // service × city — full scale: 47 services × (2 267 + GSC priority extras).
    // Audit 2026-04-25 (B1) : on doit utiliser SITEMAP_SERVICE_CITIES_COUNT
    // (= SITEMAP_CITY_COUNT + extras GSC) pour matcher la longueur réelle
    // de mergedCities émise par le handler, sinon les ~3 700 URLs prioritaires
    // GSC sortent du dernier batch slice et ne sont jamais déclarées.
    ...Array.from(
      { length: Math.ceil((services.length * SITEMAP_SERVICE_CITIES_COUNT) / LARGE_BATCH) },
      (_, i) => `service-cities-${i}`
    ),
    'cities',
    'geo',
    'devis-services',
    // devis-service-cities REMOVED 2026-04-29 (V1 #2 — 301 vers /services/[s]/[v]
    // via next.config.js redirects()).
    ...Array.from(
      { length: Math.ceil((emergencySlugs.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => `urgence-service-cities-${i}`
    ),
    ...Array.from(
      { length: Math.ceil((services.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => `tarifs-service-cities-${i}`
    ),
    // Tier 2: avis, problèmes → top 500 cities (tarifs-task supprimé 2026-04-29)
    'avis-services',
    // Reviews schema drift resolved 2026-04-12 (migrations 414-417 + admin
    // client bascule + canonical type). Shards re-listed here to keep this
    // index aligned with generateSitemaps() in sitemap.ts.
    ...Array.from(
      {
        length: Math.ceil(
          (Object.keys(tradeContent).length * SITEMAP_CITY_COUNT_TIER2) / STATIC_BATCH
        ),
      },
      (_, i) => `avis-service-cities-${i}`
    ),
    'problemes',
    ...Array.from(
      { length: Math.ceil((problemSlugs.length * SITEMAP_CITY_COUNT_TIER2) / STATIC_BATCH) },
      (_, i) => `problemes-cities-${i}`
    ),
    // dept × service — 105 depts × 47 services
    ...Array.from(
      { length: Math.ceil((departements.length * tradeSlugs.length) / LARGE_BATCH) },
      (_, i) => `dept-services-${i}`
    ),
    'barometre',
    'region-services',
    // RGE pSEO — Tier 2 (top 500 villes). Keep in sync with sitemap.ts.
    'rge-city',
    'rge-service', // /rge/[service] — 14 URLs (hub par métier)
    'rge-qualification', // /rge/qualifications + /rge/qualifications/[slug] — 5 URLs
    'rge-service-city',
    'rge-service-dept',
    // CEE pSEO — Tier 2 (19 op\u00e9rations × top 500 villes = 9 500 URLs)
    // + hub par op\u00e9ration (19 URLs). Keep in sync with sitemap.ts.
    'cee-operation',
    'cee-operation-guide',
    'cee-operation-city',
  ]

  // Provider sitemaps (DB-dependent, served via /api/sitemap-providers)
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('noindex', false)

    if (!error && count && count > 0) {
      const batchCount = Math.min(Math.ceil(count / PROVIDER_BATCH_SIZE), MAX_PROVIDER_SITEMAPS)
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
    ...ids.map((id) => `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>`),
    '</sitemapindex>',
  ].join('\n')

  const { notModified, responseHeaders } = sitemapHeaders(xml, request)
  if (notModified) {
    return new NextResponse(null, { status: 304, headers: responseHeaders })
  }
  return new NextResponse(xml, { headers: responseHeaders })
}
