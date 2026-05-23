import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { departements } from '@/lib/data/france'
import { getTradesSlugs } from '@/lib/data/trade-content'
import { LARGE_BATCH, PROVIDER_BATCH_SIZE, MAX_PROVIDER_SITEMAPS } from '@/lib/seo/sitemap-config'
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
  try {
    // emergencySlugs anciennement utilisé pour calculer le nombre de shards
    // urgence-service-cities. V2 #4 stratégie 140K consolide en 1 shard.
    // problemSlugs n'est plus requis ici depuis V2 #7 — `problemes-cities-0` fixe
    // (≈ 7 000 URLs ≤ STATIC_BATCH = 8 000, cf. problemes-whitelist.ts).
    const tradeSlugs = getTradesSlugs()

    // tarifs-task-cities REMOVED 2026-04-29 — see src/app/sitemap.ts
    // and src/lib/seo/gone-paths.ts. 184K URLs purged via DELETE 410.

    const ids: string[] = [
      'static',
      // service × city — post-pivot RGE 2026-05-03 + Tier C filter
      // `isServiceVilleIndexable` : 1 shard suffit (audit live 2026-05-22 :
      // shards 1-5 retournaient 0 URL). Restaurer l'Array.from(...) avec
      // `Math.ceil((services.length * SITEMAP_SERVICE_CITIES_COUNT) / LARGE_BATCH)`
      // dès que `service-cities-0` dépasse LARGE_BATCH = 20K URLs.
      // KEEP IN SYNC avec src/app/sitemap.ts:generateSitemaps().
      'service-cities-0',
      'cities',
      'geo',
      'devis-services',
      // devis-service-cities REMOVED 2026-04-29 (V1 #2 — 301 vers /services/[s]/[v]
      // via next.config.js redirects()).
      // urgence-service-cities CONSOLIDATED 2026-04-29 (V2 #4 — 4 svc × 25 villes
      // = 100 URLs, tient dans 1 seul shard). Voir src/lib/seo/urgence-whitelist.ts
      'urgence-service-cities-0',
      // tarifs-service-cities REMOVED 2026-04-29 (V1 #3 — 301 vers
      // /services/[s]/[v]#tarifs avec PriceTableHTML injecté dans SeoContent).
      // Tier 2: avis, problèmes → top 500 cities (tarifs-task supprimé 2026-04-29)
      // tarifs-task-whitelist-gsc REMOVED 2026-04-30 — les 100 URLs whitelistées
      // sont 301-redirigées par le middleware vers /services/[s]/[v]#tarifs ;
      // pas indexées en tant que redirect (signal contradictoire).
      'avis-services',
      // avis-service-cities REMOVED 2026-04-29 (V1 #5 stratégie 140K — pages
      // noindex tant que <3 avis, retirées du sitemap pour économiser le
      // crawl budget). Shard `avis-qualified-cities-*` à recréer en V2.
      'problemes',
      // problemes-cities CONSOLIDATED 2026-04-29 (V2 #7 — tiered allocation
      // haute=200/moyenne=100/basse=50 villes, ≈ 7 000 URLs en 1 seul shard).
      // Voir src/lib/seo/problemes-whitelist.ts.
      'problemes-cities-0',
      // V3 #1 stratégie 140K (2026-04-29) — BUILD /communes/[c]. Hub /communes
      // + 3 shards data-driven Supabase de STATIC_BATCH (8 000). Audit
      // 2026-05-22 : `communes-cities-3` retournait 0 URL (live ~17.5K post-
      // pivot RGE). Cleanup décidé. Réintroduire `communes-cities-3` dès
      // dépassement 24 000 communes qualifiées (claim massif).
      // Historique : `communes-cities-4` retiré 2026-05-02 (audit Sentry -100%).
      // KEEP IN SYNC avec src/app/sitemap.ts.
      'communes',
      'communes-cities-0',
      'communes-cities-1',
      'communes-cities-2',
      // V3 #3 stratégie 140K (2026-04-29) — BUILD /aides/[dept]/[aide] (11 × 101
      // = 1 111 URLs). MaPrimeRénov par dept déjà dans 'static' (legacy).
      'aides-dept',
      // dept × service — 105 depts × 21 services RGE
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
  } catch (error) {
    const { logger } = await import('@/lib/logger')
    logger.error('[api/sitemap-index] GET failed', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
