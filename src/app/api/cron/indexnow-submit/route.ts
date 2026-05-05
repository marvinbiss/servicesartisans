import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { SITE_URL } from '@/lib/seo/config'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { services, villes } from '@/lib/data/france'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { RGE_QUALIFICATIONS_WITH_GUIDE } from '@/lib/rge/qualification-guides-content'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

/** CEE operation codes — source unique : src/lib/cee/operation-codes.ts (leaf). */
import { CEE_OPERATION_CODES } from '@/lib/cee/operation-codes'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

const TOP_CITIES = [
  'paris',
  'marseille',
  'lyon',
  'toulouse',
  'nice',
  'nantes',
  'strasbourg',
  'montpellier',
  'bordeaux',
  'lille',
]

/** Extended city list for /devis/ rotation (top 30 French cities by population) */
const EXTENDED_CITIES = [
  ...TOP_CITIES,
  'rennes',
  'reims',
  'saint-etienne',
  'toulon',
  'le-havre',
  'grenoble',
  'dijon',
  'angers',
  'nimes',
  'villeurbanne',
  'clermont-ferrand',
  'le-mans',
  'aix-en-provence',
  'brest',
  'tours',
  'amiens',
  'limoges',
  'perpignan',
  'metz',
  'besancon',
]

/** All guide slugs — submitted once a week (Sundays) */
const GUIDE_SLUGS = [
  'aides-renovation-2026',
  'artisan-rge',
  'assurance-dommage-ouvrage',
  'budget-renovation',
  'declaration-prealable-travaux',
  'devis-travaux',
  'diagnostics-immobiliers',
  'eviter-arnaques-artisan',
  'extension-maison',
  'garantie-decennale',
  'isolation-combles',
  'isolation-thermique',
  'maprimerenov-2026',
  'normes-electriques',
  'permis-construire',
  'pompe-a-chaleur',
  'renovation-cuisine',
  'renovation-energetique-complete',
  'renovation-fenetres',
  'renovation-salle-de-bain',
  'renovation-toiture',
  'travaux-copropriete',
  'trouver-artisan',
]

/** Max URLs per daily run — target 2500/day, well under IndexNow 10K limit */
const MAX_URLS_PER_DAY = 2500

/** Number of rotation buckets (days) to cycle through all URLs */
const ROTATION_DAYS = 3

/**
 * Deterministic daily rotation index based on UTC date.
 * Returns 0, 1, or 2 — cycles every ROTATION_DAYS.
 */
function getDayBucket(): number {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getUTCFullYear(), 0, 1).getTime()) / (24 * 60 * 60 * 1000)
  )
  return dayOfYear % ROTATION_DAYS
}

/**
 * Return every Nth element from an array based on the current day bucket.
 * This ensures full coverage across ROTATION_DAYS.
 */
function rotateSlice<T>(items: T[], bucket: number): T[] {
  return items.filter((_, i) => i % ROTATION_DAYS === bucket)
}

/** Vercel function timeout — 60s is plenty for building URL list + single IndexNow POST */
export const maxDuration = 60

/**
 * Cron job: Submit strategic URLs to IndexNow after each deploy.
 * Runs daily to ensure Bing always has fresh data.
 *
 * Target: ~2500 URLs/day with rotation to cover all pages in ~3 days.
 *
 * Categories:
 * - Priority pages: homepage, /services index, /blog index (always)
 * - Service hub pages: all 46 services (rotated)
 * - Service × top cities: /services/{slug}/{city} (rotated)
 * - Devis pages: /devis/{slug}/{city} with extended cities (rotated)
 * - Tarifs pSEO: /tarifs/{slug}/{city} with extended cities (rotated)
 * - Urgence pSEO: /urgence/{slug}/{city} with extended cities (rotated)
 * - Avis pSEO: /avis/{slug}/{city} with top cities (rotated)
 * - Blog articles: prix articles + recent articles (rotated + fresh)
 * - New providers: created in last 24h (hub pages impacted)
 * - RGE pSEO: /artisans-rge/{city} top 30 + /rge/{service}/{city} 14×10 (rotated)
 * - Guides: all guide pages, once per week (Sundays)
 */
export const GET = withCronCheckIn('cron-indexnow-submit', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-indexnow-submit',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const bucket = getDayBucket()
      const counts = {
        strategic: 0,
        serviceHubs: 0,
        devis: 0,
        tarifs: 0,
        urgence: 0,
        avis: 0,
        blog: 0,
        blogPrix: 0,
        providers: 0,
        guides: 0,
        rgeCity: 0,
        rgeServiceCity: 0,
        rgeFreshProviders: 0,
        rgeQualifGuides: 0,
        ceeOperation: 0,
        ceeOperationCity: 0,
        ceeOperationGuide: 0,
      }

      // ── 1. Always-submit priority pages ─────────────────────────────────
      // Note : les slugs satellites (mandataire-vs-direct, maprimerenov-cumulaison-cee,
      // BAR-TH-143/159/174, qualibat-5911-thermique) sont des pages satellites et guides
      // nouvellement ajoutés (Sprint 4). On les force dans la submission quotidienne
      // pour garantir une découverte rapide par Bing, puis elles entreront dans la
      // rotation naturelle via Object.keys() des dicts content.
      // Note historique : BAR-TH-164 (rénovation globale MI) a été abrogée et remplacée
      // par BAR-TH-174 (rénovation d'ampleur MI) — on ne soumet plus que la nouvelle fiche.
      const urls: string[] = [
        SITE_URL,
        `${SITE_URL}/services`,
        `${SITE_URL}/blog`,
        `${SITE_URL}/tarifs`,
        `${SITE_URL}/faq`,
        `${SITE_URL}/cee/mandataire-vs-direct`,
        `${SITE_URL}/maprimerenov-cumulaison-cee`,
        `${SITE_URL}/cee/bar-th-143/guide`,
        `${SITE_URL}/cee/bar-th-159/guide`,
        `${SITE_URL}/cee/bar-th-174/guide`,
        `${SITE_URL}/rge/qualifications/qualibat-5911-thermique`,
        `${SITE_URL}/simulateur-aides-renovation`,
        `${SITE_URL}/devenir-partenaire-cee`,
        `${SITE_URL}/leads-exclusifs-vs-partages`,
        `${SITE_URL}/comparatif-primes-cee-2026`,
      ]
      counts.strategic = urls.length

      // ── 2. Service hub pages — all 46 services, rotated ─────────────────
      const serviceBatch = rotateSlice(services, bucket)
      for (const service of serviceBatch) {
        urls.push(`${SITE_URL}/services/${service.slug}`)
        urls.push(`${SITE_URL}/tarifs/${service.slug}`)
      }
      counts.serviceHubs = serviceBatch.length * 2

      // ── 3. Service × top cities (rotated by service) ────────────────────
      for (const service of serviceBatch) {
        for (const city of TOP_CITIES) {
          urls.push(`${SITE_URL}/services/${service.slug}/${city}`)
        }
      }

      // ── 4. Devis pSEO pages — all services × extended cities (rotated) ──
      // Build the full matrix and rotate it for broad daily coverage
      const allDevisUrls: string[] = []
      for (const service of services) {
        for (const city of EXTENDED_CITIES) {
          allDevisUrls.push(`${SITE_URL}/services/${service.slug}/${city}`)
        }
      }
      const devisBatch = rotateSlice(allDevisUrls, bucket)
      urls.push(...devisBatch)
      counts.devis = devisBatch.length

      // ── 4b. Tarifs pSEO pages — all services × extended cities (rotated) ──
      const allTarifsUrls: string[] = []
      for (const service of services) {
        for (const city of EXTENDED_CITIES) {
          allTarifsUrls.push(`${SITE_URL}/services/${service.slug}/${city}`)
        }
      }
      const tarifsBatch = rotateSlice(allTarifsUrls, bucket)
      urls.push(...tarifsBatch)
      counts.tarifs = tarifsBatch.length

      // ── 4c. Urgence pSEO pages — all services × top cities (rotated) ──
      const allUrgenceUrls: string[] = []
      for (const service of services) {
        for (const city of EXTENDED_CITIES) {
          allUrgenceUrls.push(`${SITE_URL}/urgence/${service.slug}/${city}`)
        }
      }
      const urgenceBatch = rotateSlice(allUrgenceUrls, bucket)
      urls.push(...urgenceBatch)
      counts.urgence = urgenceBatch.length

      // ── 4d. Avis pSEO pages — all services × top cities (rotated) ──
      const allAvisUrls: string[] = []
      for (const service of services) {
        for (const city of TOP_CITIES) {
          allAvisUrls.push(`${SITE_URL}/avis/${service.slug}/${city}`)
        }
      }
      const avisBatch = rotateSlice(allAvisUrls, bucket)
      urls.push(...avisBatch)
      counts.avis = avisBatch.length

      // ── 5. Blog articles — fresh first, then prix articles in rotation ──
      const now = Date.now()
      const hours48 = 48 * 60 * 60 * 1000

      // 5a. Recent articles (published/modified in last 48h) — always submitted
      const recentArticles = allArticlesMeta.filter((a) => {
        const articleDate = new Date(a.date).getTime()
        return now - articleDate < hours48
      })
      for (const article of recentArticles) {
        urls.push(`${SITE_URL}/blog/${article.slug}`)
      }
      counts.blog = recentArticles.length

      // 5b. Prix articles — rotated daily for continuous re-submission
      const prixArticles = allArticlesMeta.filter((a) => a.slug.startsWith('prix-'))
      const prixBatch = rotateSlice(prixArticles, bucket)
      for (const article of prixBatch) {
        urls.push(`${SITE_URL}/blog/${article.slug}`)
      }
      counts.blogPrix = prixBatch.length

      // 5c. Non-prix, non-recent articles — rotated for background coverage
      const recentSlugs = new Set(recentArticles.map((a) => a.slug))
      const otherArticles = allArticlesMeta.filter(
        (a) => !a.slug.startsWith('prix-') && !recentSlugs.has(a.slug)
      )
      const otherBatch = rotateSlice(otherArticles, bucket)
      for (const article of otherBatch) {
        urls.push(`${SITE_URL}/blog/${article.slug}`)
      }

      // ── 6. New providers created in last 24h ────────────────────────────
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString()

        const { data: newProviders, error } = await supabase
          .from('providers')
          .select('specialty, address_city')
          .eq('is_active', true)
          .eq('noindex', false)
          .gte('created_at', yesterday)
          .limit(200)

        if (error) {
          logger.warn('IndexNow cron: failed to fetch new providers', { error: error.message })
        } else if (newProviders && newProviders.length > 0) {
          const hubPages = new Set<string>()
          const serviceMap = new Map(
            services.map((s) => [
              s.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim(),
              s.slug,
            ])
          )

          for (const p of newProviders) {
            if (!p.specialty || !p.address_city) continue

            const normalizedSpecialty = p.specialty
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim()
            const serviceSlug = serviceMap.get(normalizedSpecialty)
            if (!serviceSlug) continue

            const citySlug = p.address_city
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
            if (!citySlug) continue

            hubPages.add(`${SITE_URL}/services/${serviceSlug}/${citySlug}`)
            // Also notify the devis page for this service+city
            hubPages.add(`${SITE_URL}/services/${serviceSlug}/${citySlug}`)
          }

          urls.push(...Array.from(hubPages))
          counts.providers = hubPages.size

          if (hubPages.size > 0) {
            urls.push(`${SITE_URL}/artisans`)
          }
        }
      } catch (err) {
        // DB unavailable — continue with static URLs only
        logger.warn('IndexNow cron: Supabase unavailable, skipping new providers', {
          error: err instanceof Error ? err.message : 'unknown',
        })
      }

      // ── 6b. RGE pSEO routes — city listing + service×city (rotated) ─────
      // /artisans-rge/{city} — top 30 villes, rotation 1/3 par jour (~10/jour)
      const rgeTopCitySlugs = villes.slice(0, 30).map((v) => v.slug)
      const rgeCityUrls = rgeTopCitySlugs.map((slug) => `${SITE_URL}/artisans-rge/${slug}`)
      const rgeCityBatch = rotateSlice(rgeCityUrls, bucket)
      urls.push(...rgeCityBatch)
      counts.rgeCity = rgeCityBatch.length

      // /rge/{service}/{city} — 19 services × top 10 villes, rotation 1/3 par jour (~63/jour)
      // (14 historiques + 5 élargissement 2026-05-02 : borne-recharge,
      //  chauffe-eau-thermodynamique, audit-energetique, ventilation, fenetres)
      const rgeServiceTopCitySlugs = villes.slice(0, 10).map((v) => v.slug)
      const allRgeServiceCityUrls: string[] = []
      for (const serviceSlug of RGE_ALLOWED_SERVICES) {
        for (const citySlug of rgeServiceTopCitySlugs) {
          allRgeServiceCityUrls.push(`${SITE_URL}/rge/${serviceSlug}/${citySlug}`)
        }
      }
      const rgeServiceCityBatch = rotateSlice(allRgeServiceCityUrls, bucket)
      urls.push(...rgeServiceCityBatch)
      counts.rgeServiceCity = rgeServiceCityBatch.length

      // ── 6c. CEE operation pages — hub + rotation sur top 30 villes + guides
      // Les pages CEE portent les descriptions fraîches pushées en avril 2026
      // (46K fiches RGE + opérations CEE) → IndexNow doit les submettre pour
      // forcer le recrawl Bing/Yandex, Google suivra via le referrer IndexNow.
      for (const code of CEE_OPERATION_CODES) {
        urls.push(`${SITE_URL}/cee/${code}`)
      }
      counts.ceeOperation = CEE_OPERATION_CODES.length

      // CEE operation × top 30 villes = 19 × 30 = 570 URLs, rotation 1/3 = ~190/jour
      const allCeeOperationCityUrls: string[] = []
      const ceeTopCitySlugs = villes.slice(0, 30).map((v) => v.slug)
      for (const code of CEE_OPERATION_CODES) {
        for (const citySlug of ceeTopCitySlugs) {
          allCeeOperationCityUrls.push(`${SITE_URL}/cee/${code}/${citySlug}`)
        }
      }
      const ceeOperationCityBatch = rotateSlice(allCeeOperationCityUrls, bucket)
      urls.push(...ceeOperationCityBatch)
      counts.ceeOperationCity = ceeOperationCityBatch.length

      // CEE operation guides — contenu éditorial long, rotation 1/3
      const ceeGuideUrls = CEE_OPERATIONS_WITH_GUIDE.map(
        (code) => `${SITE_URL}/cee/${code.toLowerCase()}/guide`
      )
      const ceeGuideBatch = rotateSlice(ceeGuideUrls, bucket)
      urls.push(...ceeGuideBatch)
      counts.ceeOperationGuide = ceeGuideBatch.length

      // ── 6d. RGE qualifications guides (hub + slugs) ─────────────────────
      urls.push(`${SITE_URL}/rge/qualifications`)
      for (const slug of RGE_QUALIFICATIONS_WITH_GUIDE) {
        urls.push(`${SITE_URL}/rge/qualifications/${slug}`)
      }
      counts.rgeQualifGuides = RGE_QUALIFICATIONS_WITH_GUIDE.length + 1

      // ── 6e. RGE providers updated in last 7 days — forces recrawl of the
      // 46K fiches RGE dont les descriptions E-E-A-T ont été pushées en avril.
      // URL canonique /services/{serviceSlug}/{locationSlug}/{id} (via getArtisanUrl)
      // — /artisan/[slug] est robots:noindex + redirect, donc inutile pour IndexNow.
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const { getArtisanUrl } = await import('@/lib/utils')
        const supabase = createAdminClient()
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data: freshRgeProviders, error: rgeError } = await supabase
          .from('providers')
          .select('stable_id, slug, specialty, address_city')
          .eq('is_active', true)
          .eq('noindex', false)
          .not('rge_qualifications', 'is', null)
          .gte('updated_at', sevenDaysAgo)
          .not('specialty', 'is', null)
          .not('address_city', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(500)

        if (rgeError) {
          logger.warn('IndexNow cron: failed to fetch fresh RGE providers', {
            error: rgeError.message,
          })
        } else if (freshRgeProviders && freshRgeProviders.length > 0) {
          const freshUrls = new Set<string>()
          for (const p of freshRgeProviders) {
            const path = getArtisanUrl({
              slug: p.slug as string | null,
              stable_id: p.stable_id as string | null,
              specialty: p.specialty as string | null,
              city: p.address_city as string | null,
            })
            if (path && !path.endsWith('/')) {
              freshUrls.add(`${SITE_URL}${path}`)
            }
          }
          urls.push(...Array.from(freshUrls))
          counts.rgeFreshProviders = freshUrls.size
        }
      } catch (err) {
        logger.warn('IndexNow cron: Supabase unavailable for fresh RGE providers', {
          error: err instanceof Error ? err.message : 'unknown',
        })
      }

      // ── 7. Guides — once per week (Sundays) ─────────────────────────────
      const isSunday = new Date().getUTCDay() === 0
      if (isSunday) {
        urls.push(`${SITE_URL}/guides`)
        for (const slug of GUIDE_SLUGS) {
          urls.push(`${SITE_URL}/guides/${slug}`)
        }
        counts.guides = GUIDE_SLUGS.length + 1
      }

      // ── Deduplicate and cap at MAX_URLS_PER_DAY ─────────────────────────
      const allUniqueUrls = Array.from(new Set(urls))
      const uniqueUrls = allUniqueUrls.slice(0, MAX_URLS_PER_DAY)
      const wasCapped = allUniqueUrls.length > MAX_URLS_PER_DAY

      if (wasCapped) {
        logger.warn('IndexNow cron: URL count exceeds MAX_URLS_PER_DAY, truncating', {
          action: 'indexnow-cron-truncated',
          totalUnique: allUniqueUrls.length,
          max: MAX_URLS_PER_DAY,
          dropped: allUniqueUrls.length - MAX_URLS_PER_DAY,
        })
      }

      logger.info('IndexNow cron: submitting URLs', {
        action: 'indexnow-cron',
        bucket,
        strategic: counts.strategic,
        serviceHubs: counts.serviceHubs,
        devis: counts.devis,
        tarifs: counts.tarifs,
        urgence: counts.urgence,
        avis: counts.avis,
        blog: counts.blog,
        blogPrix: counts.blogPrix,
        providers: counts.providers,
        guides: counts.guides,
        rgeCity: counts.rgeCity,
        rgeServiceCity: counts.rgeServiceCity,
        rgeFreshProviders: counts.rgeFreshProviders,
        rgeQualifGuides: counts.rgeQualifGuides,
        ceeOperation: counts.ceeOperation,
        ceeOperationCity: counts.ceeOperationCity,
        ceeOperationGuide: counts.ceeOperationGuide,
        totalBeforeCap: urls.length,
        totalUnique: uniqueUrls.length,
        capped: wasCapped,
      })

      // ── Submit directly via IndexNow API ────────────────────────────────
      const result = await submitToIndexNow(uniqueUrls)

      await pingHeartbeat('indexnow-submit')
      return NextResponse.json({
        ...result,
        urlCount: uniqueUrls.length,
        breakdown: counts,
        rotation: { bucket, totalDays: ROTATION_DAYS },
      })
    },
    {
      schedule: { type: 'crontab', value: '15 6 * * *' },
    }
  )
})
