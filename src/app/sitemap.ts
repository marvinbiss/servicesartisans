import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'
import { tradeContent, getTradesSlugs, parseTask } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getQuestionSlugs } from '@/lib/data/questions'
import { comparisons } from '@/lib/data/comparisons'
import { GSC_PRIORITY_CITIES } from '@/lib/seo/gsc-priority-cities'
import {
  STATIC_BATCH,
  LARGE_BATCH,
  SITEMAP_CITY_COUNT,
  SITEMAP_CITY_COUNT_TIER2,
} from '@/lib/seo/sitemap-config'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import { RGE_QUALIFICATIONS_WITH_GUIDE } from '@/lib/rge/qualification-guides-content'
import { articleSlugs } from '@/lib/data/blog/articles'
import { allArticles } from '@/lib/data/blog/articles'
import { blogCategories, categoryToSlug, normalizeCategory } from '@/lib/data/blog/categories'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { fetchAllLastmodData, type SitemapLastmodData } from '@/lib/seo/lastmod-queries'
// Return 404 for sitemap IDs not in generateSitemaps() — prevents ghost sitemaps
// from returning empty-but-valid XML that Google keeps crawling forever.
export const dynamicParams = false

// Fixed date for pages whose content rarely changes (hub pages, static pages, guides, etc.)
// Google penalizes false freshness signals (Dec 2025 update). Better honest than fake-fresh.
const STATIC_DATE = '2025-11-01'

// CEE — codes d'opérations seed (migration 383). Source statique, alignée sur
// `cee_operations`. Utilisée par les sitemaps pour éviter un round-trip DB au
// build (les codes FOS ne bougent qu'à la publication d'un nouvel arrêté DGEC).
// Fiches abrogées retirées : BAR-TH-106 (01/01/2024, remplacée par BAR-TH-171),
// BAR-TH-160 (01/08/2025, pas de remplacement direct), BAR-TH-164 (remplacée
// par BAR-TH-174). Nouvelles fiches en vigueur ajoutées : BAR-TH-172, 174,
// 175, 177. Ordre alphabétique conservé.
const CEE_OPERATION_CODES: readonly string[] = [
  'BAR-EN-101',
  'BAR-EN-102',
  'BAR-EN-103',
  'BAR-EN-104',
  'BAR-EN-108',
  'BAR-TH-112',
  'BAR-TH-113',
  'BAR-TH-125',
  'BAR-TH-127',
  'BAR-TH-129',
  'BAR-TH-143',
  'BAR-TH-148',
  'BAR-TH-159',
  'BAR-TH-161',
  'BAR-TH-171',
  'BAR-TH-172',
  'BAR-TH-173',
  'BAR-TH-174',
  'BAR-TH-175',
  'BAR-TH-177',
  'BAR-SE-104',
] as const

// Lazily-loaded lastmod data from DB. Fetched once, reused across all sitemap IDs.
// If DB is unavailable, all maps are empty → lastmod is omitted (honest).
let _lastmodData: SitemapLastmodData | null = null
async function getLastmodData(): Promise<SitemapLastmodData> {
  if (!_lastmodData) {
    _lastmodData = await fetchAllLastmodData()
  }
  return _lastmodData
}

/**
 * Lookup helpers — normalize city/dept/region names for map lookup.
 * Returns undefined if no real lastmod data exists (= omit lastmod).
 */
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Generate sitemap index entries.
 * Next.js 14 calls this to produce /sitemap/[id].xml and a sitemap index.
 */
export async function generateSitemaps() {
  // Tiered sitemap strategy — ~742K URLs total.
  // Tier 1 (service, devis, tarifs, urgence × ALL cities): contenu le plus riche.
  // Tier 2 (tarifs-tâche, avis, problèmes × top 500 cities): plus template-like.
  // Quartier-level sitemaps removed (too granular, thin content).
  const serviceCitiesBatchCount = Math.ceil((services.length * SITEMAP_CITY_COUNT) / LARGE_BATCH)

  const emergencySlugs = Object.keys(tradeContent)
  const problemSlugs = getProblemSlugs()

  // Tier 2: tarifs-task, avis, problemes use top 500 cities only
  const totalTaskCount = Object.values(tradeContent).reduce(
    (sum, t) => sum + t.commonTasks.length,
    0
  )
  const tarifsTaskCitiesBatchCount = Math.ceil(
    (totalTaskCount * SITEMAP_CITY_COUNT_TIER2) / LARGE_BATCH
  )

  const sitemaps: { id: string }[] = [
    { id: 'static' },
    ...Array.from({ length: serviceCitiesBatchCount }, (_, i) => ({ id: `service-cities-${i}` })),
    { id: 'cities' },
    { id: 'geo' },
    { id: 'devis-services' },
    // Tier 1: devis, urgence, tarifs → all 2 267 cities
    ...Array.from(
      { length: Math.ceil((services.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => ({ id: `devis-service-cities-${i}` })
    ),
    ...Array.from(
      { length: Math.ceil((emergencySlugs.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => ({ id: `urgence-service-cities-${i}` })
    ),
    ...Array.from(
      { length: Math.ceil((services.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => ({ id: `tarifs-service-cities-${i}` })
    ),
    // Tier 2: tarifs-tâche, avis, problèmes → top 500 cities
    ...Array.from({ length: tarifsTaskCitiesBatchCount }, (_, i) => ({
      id: `tarifs-task-cities-${i}`,
    })),
    { id: 'avis-services' },
    // Reviews schema drift résolu 2026-04-12 (migrations 385+386 + bascule
    // admin client + type canonical src/types/review.ts). Réactivation des
    // shards /avis/{service}/{ville} dans le sitemap.
    ...Array.from(
      {
        length: Math.ceil(
          (Object.keys(tradeContent).length * SITEMAP_CITY_COUNT_TIER2) / STATIC_BATCH
        ),
      },
      (_, i) => ({ id: `avis-service-cities-${i}` })
    ),
    { id: 'problemes' },
    ...Array.from(
      { length: Math.ceil((problemSlugs.length * SITEMAP_CITY_COUNT_TIER2) / STATIC_BATCH) },
      (_, i) => ({ id: `problemes-cities-${i}` })
    ),
    ...Array.from(
      { length: Math.ceil((departements.length * getTradesSlugs().length) / LARGE_BATCH) },
      (_, i) => ({ id: `dept-services-${i}` })
    ),
    { id: 'barometre' },
    { id: 'region-services' },
    // RGE pSEO — Tier 2 (top 500 villes) car pages nouvelles, on évite de diluer
    // le ratio d'indexation tant que Google évalue la qualité du cluster RGE.
    // Scaler au full SITEMAP_CITY_COUNT une fois le ratio > 40%.
    { id: 'rge-city' }, // /artisans-rge/[ville] — 500 URLs
    { id: 'rge-service' }, // /rge/[service] — 14 URLs (hub par métier)
    { id: 'rge-qualification' }, // /rge/qualifications + /rge/qualifications/[slug] — 5 URLs
    { id: 'rge-service-city' }, // /rge/[service]/[ville] — 14 × 500 = 7 000 URLs
    { id: 'rge-service-dept' }, // /rge/[service]/departement/[dept] — 14 × 101 = 1 414 URLs
    // CEE pSEO — Tier 2 : 19 op\u00e9rations × 500 villes = 9 500 URLs
    // + hub par op\u00e9ration (19 URLs). Pages noindex fail-open si 0 provider.
    { id: 'cee-operation' }, // /cee/[op] — 19 URLs
    { id: 'cee-operation-guide' }, // /cee/[op]/guide — 5 URLs (high-intent guides)
    { id: 'cee-operation-city' }, // /cee/[op]/[ville] — 19 × 500 = 9 500 URLs
  ]

  // Provider sitemaps are served dynamically via /api/sitemap-providers
  // (DB-dependent, can't reliably pre-render at build time).
  // They are referenced in the sitemap index (/api/sitemap-index) and
  // rewritten via next.config.js: /sitemap/providers-*.xml → /api/sitemap-providers?id=*

  return sitemaps
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  // ── Static pages + services ─────────────────────────────────────────
  if (id === 'static') {
    // Homepage — STATIC_DATE: content changes rarely (hero, sections are stable)
    const homepage: MetadataRoute.Sitemap = [
      { url: SITE_URL, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 1.0 },
    ]

    // Hub pages — STATIC_DATE: aggregation pages with stable structure
    const hubPages: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/tarifs`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/urgence`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/devis`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/avis`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/blog`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/guides`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/rge`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/rge/sources`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/rge/comment-devenir-rge`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/rge/fraude-rge-comment-verifier`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/rge/tarifs-audit-energetique`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/cee`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/cee/guides`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/cee/coup-de-pouce-2026`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/cee/mandataire-vs-direct`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/maprimerenov-cumulaison-cee`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/ademe`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/questions`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/barometre`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/barometre/regions`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/barometre/tarifs`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      // /recherche removed — 301-redirects to /services (next.config.js). Including redirected URLs
      // in sitemaps wastes crawl budget and sends conflicting signals to Google.
      {
        url: `${SITE_URL}/comparaison`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/glossaire`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/normes`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/statistiques-artisans-france`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Static pages — STATIC_DATE: rarely change, honest lastmod
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/a-propos`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/contact`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      // FAQ lastmod = date the FAQPage schema was reactivated (commit 64b0a627)
      {
        url: `${SITE_URL}/faq`,
        lastModified: '2026-04-03',
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/comment-ca-marche`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/notre-processus-de-verification`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/politique-avis`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/mediation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/garantie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/outils`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/outils/calculateur-prix`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/outils/diagnostic`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/carte-artisans`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/artisans`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/avant-apres`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/calendrier-travaux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/checklist-travaux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/badge-artisan`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/verifier-artisan`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/widget-prix`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ]

    // Guide pages
    const guideSlugs = [
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
    // Guides — STATIC_DATE: editorial content, updated manually when revised
    const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
      url: `${SITE_URL}/guides/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    // Question pages
    // Questions — STATIC_DATE: Q&A content, stable once published
    const questionPages: MetadataRoute.Sitemap = getQuestionSlugs().map((slug) => ({
      url: `${SITE_URL}/questions/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))

    // Comparison pages
    // Comparisons — STATIC_DATE: editorial content, stable once published
    const comparisonPages: MetadataRoute.Sitemap = comparisons.map((c) => ({
      url: `${SITE_URL}/comparaison/${c.slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    // Blog articles — lastModified réel (seul contenu avec vraie date vérifiable)
    // Priority 0.7: blog content drives organic traffic and E-E-A-T signals
    const blogArticlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => {
      const article = allArticles[slug]
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: article ? new Date(article.updatedDate || article.date) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })

    // Service hub pages — lastmod = dernier provider ajouté/modifié pour ce service.
    // Falls back to STATIC_DATE for services with no providers yet.
    const { byService } = await getLastmodData()

    const servicesIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/services`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
    ]

    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: byService.get(service.slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const emergencySlugs = Object.keys(tradeContent)
    const urgencePages: MetadataRoute.Sitemap = emergencySlugs.map((slug) => ({
      url: `${SITE_URL}/urgence/${slug}`,
      lastModified: byService.get(slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const tarifsPages: MetadataRoute.Sitemap = Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/tarifs/${slug}`,
      lastModified: byService.get(slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    // Blog category pages — lastModified = date du dernier article de la catégorie
    const blogCategoryPages: MetadataRoute.Sitemap = blogCategories
      .filter((c) =>
        allArticlesMeta.some((a) => categoryToSlug(normalizeCategory(a.category)) === c.slug)
      )
      .map((c) => {
        const categoryArticles = allArticlesMeta.filter(
          (a) => categoryToSlug(normalizeCategory(a.category)) === c.slug
        )
        const latestDate =
          categoryArticles.length > 0
            ? new Date(Math.max(...categoryArticles.map((a) => new Date(a.date).getTime())))
            : undefined
        return {
          url: `${SITE_URL}/blog/categorie/${c.slug}`,
          lastModified: latestDate,
        }
      })

    // Blog tag pages — all unique tags
    const tagSet = new Map<string, string>()
    for (const a of allArticlesMeta) {
      for (const t of a.tags) {
        const slug = t
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        if (!tagSet.has(slug)) tagSet.set(slug, t)
      }
    }
    const blogTagPages: MetadataRoute.Sitemap = Array.from(tagSet.keys()).map((tagSlug) => {
      // Trouver la date du dernier article ayant ce tag
      const tagArticles = allArticlesMeta.filter((a) =>
        a.tags.some(
          (t) =>
            t
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') === tagSlug
        )
      )
      const latestDate =
        tagArticles.length > 0
          ? new Date(Math.max(...tagArticles.map((a) => new Date(a.date).getTime())))
          : undefined
      return {
        url: `${SITE_URL}/blog/tag/${tagSlug}`,
        lastModified: latestDate,
      }
    })

    return [
      ...homepage,
      ...hubPages,
      ...staticPages,
      ...guidePages,
      ...questionPages,
      ...comparisonPages,
      ...blogArticlePages,
      ...blogCategoryPages,
      ...blogTagPages,
      ...servicesIndex,
      ...servicePages,
      ...urgencePages,
      ...tarifsPages,
    ]
  }

  // ── Service × city — full scale: all 2 267 cities ──────────────────
  if (id.startsWith('service-cities-') && !id.startsWith('service-cities-extended-')) {
    const batchIndex = parseInt(id.replace('service-cities-', ''), 10)
    const BATCH = LARGE_BATCH
    const offset = batchIndex * BATCH

    // Merge top cities by population + GSC priority cities (deduplicated)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const phase1Slugs = new Set(phase1Cities.map((v) => v.slug))
    const gscExtras = GSC_PRIORITY_CITIES.filter((slug) => !phase1Slugs.has(slug))
      .map((slug) => villes.find((v) => v.slug === slug))
      .filter((v): v is NonNullable<typeof v> => v != null)
    const mergedCities = [...phase1Cities, ...gscExtras]

    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      for (const ville of mergedCities) {
        // Service×city — no lastmod: static composition, never truly changes between deploys
        // Priority 0.8: these are the primary conversion pages (service + location intent)
        allUrls.push({
          url: `${SITE_URL}/services/${service.slug}/${ville.slug}`,
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      }
    }

    return allUrls.slice(offset, offset + BATCH)
  }

  // ── City pages ──────────────────────────────────────────────────────
  if (id === 'cities') {
    const { byCity } = await getLastmodData()

    const villesIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/villes`, changeFrequency: 'weekly', priority: 0.6 },
    ]

    // lastmod = date du dernier provider modifié dans cette ville. Si aucun → omis.
    // Priority 0.6: city pages are strong geo-landing pages for local SEO
    const villePages: MetadataRoute.Sitemap = villes.map((ville) => ({
      url: `${SITE_URL}/villes/${ville.slug}`,
      lastModified: byCity.get(normalizeName(ville.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...villesIndex, ...villePages]
  }

  // ── Geo pages (départements + régions) ──────────────────────────────
  if (id === 'geo') {
    const { byDepartment, byRegion } = await getLastmodData()

    const departementsIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/departements`, changeFrequency: 'weekly', priority: 0.7 },
    ]

    // lastmod = date du dernier provider modifié dans ce département. Si aucun → omis.
    const departementPages: MetadataRoute.Sitemap = departements.map((dept) => ({
      url: `${SITE_URL}/departements/${dept.slug}`,
      lastModified: byDepartment.get(normalizeName(dept.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    const regionsIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/regions`, changeFrequency: 'weekly', priority: 0.7 },
    ]

    // lastmod = date du dernier provider modifié dans cette région. Si aucun → omis.
    const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}`,
      lastModified: byRegion.get(normalizeName(region.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...departementsIndex, ...departementPages, ...regionsIndex, ...regionPages]
  }

  // ── Devis service hub pages ─────────────────────────────────────────
  // Devis hub pages — STATIC_DATE: template content, stable
  if (id === 'devis-services') {
    return Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/devis/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  }

  // ── Devis service×city pages — pruned to qualified combos only ────
  // Combos without ≥1 active provider are excluded (HCU anti-thin).
  if (id.startsWith('devis-service-cities-')) {
    const batchIndex = parseInt(id.replace('devis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const { qualifiedCombos } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const ville of phase1Cities) {
        if (qualifiedCombos && !qualifiedCombos.has(`${svc.slug}::${ville.slug}`)) continue
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}`,
            changeFrequency: 'monthly',
            priority: 0.6,
          })
        count++
      }
    }

    return result
  }

  // ── Urgence service×city pages — pruned to qualified combos only ──
  if (id.startsWith('urgence-service-cities-')) {
    const batchIndex = parseInt(id.replace('urgence-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const emergencySlugs = Object.keys(tradeContent)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const { qualifiedCombos } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of emergencySlugs) {
      for (const v of phase1Cities) {
        if (qualifiedCombos && !qualifiedCombos.has(`${svc}::${v.slug}`)) continue
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/urgence/${svc}/${v.slug}`,
            changeFrequency: 'monthly',
            priority: 0.5,
          })
        count++
      }
    }

    return result
  }

  // ── Tarifs service×city pages — pruned to qualified combos only ───
  if (id.startsWith('tarifs-service-cities-')) {
    const batchIndex = parseInt(id.replace('tarifs-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const { qualifiedCombos } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const v of phase1Cities) {
        if (qualifiedCombos && !qualifiedCombos.has(`${svc.slug}::${v.slug}`)) continue
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/tarifs/${svc.slug}/${v.slug}`,
            changeFrequency: 'monthly',
            priority: 0.7,
          })
        count++
      }
    }

    return result
  }

  // ── Tarifs task×city pages (Tier 2: top 500 cities) ────────────
  if (id.startsWith('tarifs-task-cities-')) {
    const batchIndex = parseInt(id.replace('tarifs-task-cities-', ''), 10)
    const BATCH = LARGE_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const [serviceSlug, trade] of Object.entries(tradeContent)) {
      for (const task of trade.commonTasks) {
        const { slug: taskSlug } = parseTask(task)
        for (const v of phase1Cities) {
          if (count >= end) break outer
          if (count >= start)
            result.push({
              url: `${SITE_URL}/tarifs/${serviceSlug}/${v.slug}/${taskSlug}`,
              changeFrequency: 'monthly',
              priority: 0.5,
            })
          count++
        }
      }
    }

    return result
  }

  // ── Avis service hub pages ──────────────────────────────────────────
  if (id === 'avis-services') {
    const { reviewByService } = await getLastmodData()
    const tradeSlugs = Object.keys(tradeContent)
    // Hub /avis — lastmod = date du dernier avis toutes catégories confondues
    const allReviewDates = Array.from(reviewByService.values())
    const latestReview = allReviewDates.length > 0 ? allReviewDates.sort().reverse()[0] : undefined
    return [
      {
        url: `${SITE_URL}/avis`,
        lastModified: latestReview,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      // /avis/{service} — lastmod = date du dernier avis pour ce service. Si aucun → omis.
      ...tradeSlugs.map((slug) => ({
        url: `${SITE_URL}/avis/${slug}`,
        lastModified: reviewByService.get(slug),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]
  }

  // ── Avis service×city pages ─────────────────────────────────────────
  // Réactivées 2026-04-12 après résolution du reviews schema drift
  // (migrations 385_reviews_rls_hardening + 386_reviews_add_missing_columns,
  // bascule POST /api/reviews sur admin client, type canonical review.ts).
  if (id.startsWith('avis-service-cities-')) {
    const batchIndex = parseInt(id.replace('avis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const tradeSlugs = Object.keys(tradeContent)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of tradeSlugs) {
      for (const v of phase1Cities) {
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/avis/${svc}/${v.slug}`,
            changeFrequency: 'monthly',
            priority: 0.5,
          })
        count++
      }
    }

    return result
  }

  // ── Problemes hub + individual pages ────────────────────────────────
  // Problemes = contenu éditorial statique. Pas de lastmod (honnête).
  if (id === 'problemes') {
    const problemSlugs = getProblemSlugs()
    return [
      {
        url: `${SITE_URL}/problemes`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      ...problemSlugs.map((slug) => ({
        url: `${SITE_URL}/problemes/${slug}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
    ]
  }

  // ── Problemes × city pages (Tier 2: top 500 cities) ────────────
  if (id.startsWith('problemes-cities-')) {
    const batchIndex = parseInt(id.replace('problemes-cities-', ''))
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const problemSlugs = getProblemSlugs()
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const problem of problemSlugs) {
      for (const ville of phase1Cities) {
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/problemes/${problem}/${ville.slug}`,
            changeFrequency: 'monthly',
            priority: 0.4,
          })
        count++
      }
    }

    return result
  }

  // ── Dept × service pages ────────────────────────────────────────────
  if (id.startsWith('dept-services-')) {
    const { byDeptService } = await getLastmodData()
    const batchIndex = parseInt(id.replace('dept-services-', ''))
    const tradeSlugs = getTradesSlugs()
    const allUrls: MetadataRoute.Sitemap = []
    for (const dept of departements) {
      for (const service of tradeSlugs) {
        // lastmod = date du dernier provider (dept, service). Si aucun → omis.
        const key = `${normalizeName(dept.name)}::${service}`
        allUrls.push({
          url: `${SITE_URL}/departements/${dept.slug}/${service}`,
          lastModified: byDeptService.get(key),
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }
    return allUrls.slice(batchIndex * LARGE_BATCH, (batchIndex + 1) * LARGE_BATCH)
  }

  // ── Baromètre pages (regions + tarifs by métier) ────────────────────
  if (id === 'barometre') {
    const { byRegion, byService } = await getLastmodData()
    // Baromètre régions — lastmod = dernier provider modifié dans la région
    const barometreRegions: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${SITE_URL}/barometre/regions/${region.slug}`,
      lastModified: byRegion.get(normalizeName(region.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
    // Baromètre métiers — lastmod = dernier provider modifié pour ce service
    const barometreMetiers: MetadataRoute.Sitemap = getTradesSlugs().map((slug) => ({
      url: `${SITE_URL}/barometre/tarifs/${slug}`,
      lastModified: byService.get(slug),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
    return [...barometreRegions, ...barometreMetiers]
  }

  // ── Region × service pages ──────────────────────────────────────────
  if (id === 'region-services') {
    const { byRegionService } = await getLastmodData()
    const tradeSlugs = getTradesSlugs()
    return regions.flatMap((region) =>
      tradeSlugs.map((service) => {
        const key = `${normalizeName(region.name)}::${service}`
        return {
          url: `${SITE_URL}/regions/${region.slug}/${service}`,
          lastModified: byRegionService.get(key),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }
      })
    )
  }

  // ── RGE city listings (/artisans-rge/[ville]) ──────────────────────
  // Tier 2: top 500 cities only. Pages noindex fail-open if 0 providers,
  // ISR corrige avec le vrai comptage. lastmod omis (listing dérivé de la DB,
  // pas de vrai changement template).
  if (id === 'rge-city') {
    const { byCity } = await getLastmodData()
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    return phase1Cities.map((ville) => ({
      url: `${SITE_URL}/artisans-rge/${ville.slug}`,
      lastModified: byCity.get(normalizeName(ville.name)),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  }

  // ── RGE service hub pages (/rge/[service]) ─────────────────────────
  // 14 URLs — une par métier énergétique couvert par la mention RGE.
  // Priority 0.7 (hub éditorial, entre la home /rge à 0.8 et les pSEO
  // ville à 0.6). lastmod statique : contenu éditorial versionné code.
  if (id === 'rge-service') {
    return RGE_ALLOWED_SERVICES.map((svc) => ({
      url: `${SITE_URL}/rge/${svc}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  // ── RGE qualifications guides (/rge/qualifications + /rge/qualifications/[slug])
  // Hub + guides éditoriaux dérivés de RGE_QUALIFICATION_GUIDES
  // (QualiPAC, QualiSol, QualiBois, Qualifelec, QualiPV, architecte audit énergétique).
  if (id === 'rge-qualification') {
    return [
      {
        url: `${SITE_URL}/rge/qualifications`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      ...RGE_QUALIFICATIONS_WITH_GUIDE.map((slug) => ({
        url: `${SITE_URL}/rge/qualifications/${slug}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
    ]
  }

  // ── RGE service × city listings (/rge/[service]/[ville]) ───────────
  // 14 services énergétiques × 500 villes = 7 000 URLs → tient dans un
  // single sitemap (< STATIC_BATCH). lastmod omis.
  if (id === 'rge-service-city') {
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    for (const svc of RGE_ALLOWED_SERVICES) {
      for (const ville of phase1Cities) {
        result.push({
          url: `${SITE_URL}/rge/${svc}/${ville.slug}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
    return result
  }

  // ── RGE service × department listings (/rge/[service]/departement/[dept])
  // 14 services énergétiques × 101 départements = 1 414 URLs. Tier 2 SEO,
  // pages noindex fail-open si 0 provider. Priority 0.55 (sous les villes).
  if (id === 'rge-service-dept') {
    const result: MetadataRoute.Sitemap = []
    for (const svc of RGE_ALLOWED_SERVICES) {
      for (const dept of departements) {
        result.push({
          url: `${SITE_URL}/rge/${svc}/departement/${dept.slug}`,
          changeFrequency: 'weekly',
          priority: 0.55,
        })
      }
    }
    return result
  }

  // ── CEE operation hub pages (/cee/[op]) ──────────────────────────────
  // 19 URLs — une par op\u00e9ration CEE active. Priority 0.7, weekly.
  if (id === 'cee-operation') {
    return CEE_OPERATION_CODES.map((code) => ({
      url: `${SITE_URL}/cee/${code}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  // ── CEE operation guides (/cee/[op]/guide) ──────────────────────────
  // Guides éditoriaux long-format pour les opérations high-intent
  // (dérivés dynamiquement de CEE_OPERATION_GUIDES).
  // Priority 0.75 (au-dessus du hub car contenu éditorial riche).
  if (id === 'cee-operation-guide') {
    return CEE_OPERATIONS_WITH_GUIDE.map((code) => ({
      url: `${SITE_URL}/cee/${code}/guide`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))
  }

  // ── CEE operation × city pSEO (/cee/[op]/[ville]) ───────────────────
  // 19 op\u00e9rations × top 500 villes = 9 500 URLs. Tier 2. lastmod omis
  // (pages ISR derived from DB, pas de vrai changement template).
  if (id === 'cee-operation-city') {
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    for (const code of CEE_OPERATION_CODES) {
      for (const ville of phase1Cities) {
        result.push({
          url: `${SITE_URL}/cee/${code}/${ville.slug}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
    return result
  }

  // Provider sitemaps are served via /api/sitemap-providers (dynamic API route).
  // Requests to /sitemap/providers-*.xml are rewritten by next.config.js.

  return []
}
