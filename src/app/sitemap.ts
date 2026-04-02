import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'
import { tradeContent, getTradesSlugs, parseTask } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getQuestionSlugs } from '@/lib/data/questions'
import { comparisons } from '@/lib/data/comparisons'
import { GSC_PRIORITY_CITIES } from '@/lib/seo/gsc-priority-cities'
import { STATIC_BATCH, LARGE_BATCH, SITEMAP_CITY_COUNT, SITEMAP_CITY_COUNT_TIER2 } from '@/lib/seo/sitemap-config'
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
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
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
  const serviceCitiesBatchCount = Math.ceil(services.length * SITEMAP_CITY_COUNT / LARGE_BATCH)

  const emergencySlugs = Object.keys(tradeContent)
  const avisServiceSlugs = Object.keys(tradeContent)
  const problemSlugs = getProblemSlugs()

  // Tier 2: tarifs-task, avis, problemes use top 500 cities only
  const totalTaskCount = Object.values(tradeContent).reduce((sum, t) => sum + t.commonTasks.length, 0)
  const tarifsTaskCitiesBatchCount = Math.ceil(totalTaskCount * SITEMAP_CITY_COUNT_TIER2 / LARGE_BATCH)

  const sitemaps: { id: string }[] = [
    { id: 'static' },
    ...Array.from({ length: serviceCitiesBatchCount }, (_, i) => ({ id: `service-cities-${i}` })),
    { id: 'cities' },
    { id: 'geo' },
    { id: 'devis-services' },
    // Tier 1: devis, urgence, tarifs → all 2 267 cities
    ...Array.from({ length: Math.ceil(services.length * SITEMAP_CITY_COUNT / STATIC_BATCH) }, (_, i) => ({ id: `devis-service-cities-${i}` })),
    ...Array.from({ length: Math.ceil(emergencySlugs.length * SITEMAP_CITY_COUNT / STATIC_BATCH) }, (_, i) => ({ id: `urgence-service-cities-${i}` })),
    ...Array.from({ length: Math.ceil(services.length * SITEMAP_CITY_COUNT / STATIC_BATCH) }, (_, i) => ({ id: `tarifs-service-cities-${i}` })),
    // Tier 2: tarifs-tâche, avis, problèmes → top 500 cities
    ...Array.from({ length: tarifsTaskCitiesBatchCount }, (_, i) => ({ id: `tarifs-task-cities-${i}` })),
    { id: 'avis-services' },
    ...Array.from({ length: Math.ceil(avisServiceSlugs.length * SITEMAP_CITY_COUNT_TIER2 / STATIC_BATCH) }, (_, i) => ({ id: `avis-service-cities-${i}` })),
    { id: 'problemes' },
    ...Array.from({ length: Math.ceil(problemSlugs.length * SITEMAP_CITY_COUNT_TIER2 / STATIC_BATCH) }, (_, i) => ({ id: `problemes-cities-${i}` })),
    ...Array.from(
      { length: Math.ceil(departements.length * getTradesSlugs().length / LARGE_BATCH) },
      (_, i) => ({ id: `dept-services-${i}` })
    ),
    { id: 'barometre' },
    { id: 'region-services' },
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
      { url: `${SITE_URL}/tarifs`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/urgence`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/devis`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/avis`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/blog`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/guides`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/questions`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/barometre`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/barometre/regions`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${SITE_URL}/barometre/tarifs`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
      // /recherche removed — 301-redirects to /services (next.config.js). Including redirected URLs
      // in sitemaps wastes crawl budget and sends conflicting signals to Google.
      { url: `${SITE_URL}/comparaison`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${SITE_URL}/glossaire`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${SITE_URL}/normes`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${SITE_URL}/statistiques-artisans-france`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
    ]

    // Static pages — STATIC_DATE: rarely change, honest lastmod
    const staticPages: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/a-propos`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/contact`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/faq`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/comment-ca-marche`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/notre-processus-de-verification`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/politique-avis`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/mediation`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/garantie`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/outils`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${SITE_URL}/outils/calculateur-prix`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/outils/diagnostic`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/carte-artisans`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.5 },
      { url: `${SITE_URL}/artisans`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.5 },
      { url: `${SITE_URL}/avant-apres`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/calendrier-travaux`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/checklist-travaux`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/badge-artisan`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${SITE_URL}/verifier-artisan`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${SITE_URL}/widget-prix`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
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
    const guidePages: MetadataRoute.Sitemap = guideSlugs.map(slug => ({
      url: `${SITE_URL}/guides/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    // Question pages
    // Questions — STATIC_DATE: Q&A content, stable once published
    const questionPages: MetadataRoute.Sitemap = getQuestionSlugs().map(slug => ({
      url: `${SITE_URL}/questions/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))

    // Comparison pages
    // Comparisons — STATIC_DATE: editorial content, stable once published
    const comparisonPages: MetadataRoute.Sitemap = comparisons.map(c => ({
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
      { url: `${SITE_URL}/services`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
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
      .filter(c => allArticlesMeta.some(a => categoryToSlug(normalizeCategory(a.category)) === c.slug))
      .map(c => {
        const categoryArticles = allArticlesMeta.filter(a => categoryToSlug(normalizeCategory(a.category)) === c.slug)
        const latestDate = categoryArticles.length > 0
          ? new Date(Math.max(...categoryArticles.map(a => new Date(a.date).getTime())))
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
        const slug = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        if (!tagSet.has(slug)) tagSet.set(slug, t)
      }
    }
    const blogTagPages: MetadataRoute.Sitemap = Array.from(tagSet.keys()).map(tagSlug => {
      // Trouver la date du dernier article ayant ce tag
      const tagArticles = allArticlesMeta.filter(a =>
        a.tags.some(t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === tagSlug)
      )
      const latestDate = tagArticles.length > 0
        ? new Date(Math.max(...tagArticles.map(a => new Date(a.date).getTime())))
        : undefined
      return {
        url: `${SITE_URL}/blog/tag/${tagSlug}`,
        lastModified: latestDate,
      }
    })

    return [...homepage, ...hubPages, ...staticPages, ...guidePages, ...questionPages, ...comparisonPages, ...blogArticlePages, ...blogCategoryPages, ...blogTagPages, ...servicesIndex, ...servicePages, ...urgencePages, ...tarifsPages]
  }

  // ── Service × city — full scale: all 2 267 cities ──────────────────
  if (id.startsWith('service-cities-') && !id.startsWith('service-cities-extended-')) {
    const batchIndex = parseInt(id.replace('service-cities-', ''), 10)
    const BATCH = LARGE_BATCH
    const offset = batchIndex * BATCH

    // Merge top cities by population + GSC priority cities (deduplicated)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const phase1Slugs = new Set(phase1Cities.map(v => v.slug))
    const gscExtras = GSC_PRIORITY_CITIES
      .filter(slug => !phase1Slugs.has(slug))
      .map(slug => villes.find(v => v.slug === slug))
      .filter((v): v is NonNullable<typeof v> => v != null)
    const mergedCities = [...phase1Cities, ...gscExtras]

    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      for (const ville of mergedCities) {
        // Service×city — no lastmod: static composition, never truly changes between deploys
        // Priority 0.8: these are the primary conversion pages (service + location intent)
        allUrls.push({ url: `${SITE_URL}/services/${service.slug}/${ville.slug}`, changeFrequency: 'monthly', priority: 0.8 })
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

  // ── Devis service×city pages (Full scale: all cities) ─────────
  if (id.startsWith('devis-service-cities-')) {
    const batchIndex = parseInt(id.replace('devis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const ville of phase1Cities) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}`, changeFrequency: 'monthly', priority: 0.6 })
        count++
      }
    }

    return result
  }

  // ── Urgence service×city pages (Full scale: all cities) ───────
  if (id.startsWith('urgence-service-cities-')) {
    const batchIndex = parseInt(id.replace('urgence-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const emergencySlugs = Object.keys(tradeContent)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of emergencySlugs) {
      for (const v of phase1Cities) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/urgence/${svc}/${v.slug}`, changeFrequency: 'monthly', priority: 0.5 })
        count++
      }
    }

    return result
  }

  // ── Tarifs service×city pages (Full scale: all cities) ────────
  if (id.startsWith('tarifs-service-cities-')) {
    const batchIndex = parseInt(id.replace('tarifs-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const v of phase1Cities) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/tarifs/${svc.slug}/${v.slug}`, changeFrequency: 'monthly', priority: 0.7 })
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
          if (count >= start) result.push({ url: `${SITE_URL}/tarifs/${serviceSlug}/${v.slug}/${taskSlug}`, changeFrequency: 'monthly', priority: 0.5 })
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
      { url: `${SITE_URL}/avis`, lastModified: latestReview, changeFrequency: 'weekly' as const, priority: 0.7 },
      // /avis/{service} — lastmod = date du dernier avis pour ce service. Si aucun → omis.
      ...tradeSlugs.map(slug => ({
        url: `${SITE_URL}/avis/${slug}`,
        lastModified: reviewByService.get(slug),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]
  }

  // ── Avis service×city pages (Tier 2: top 500 cities) ───────────
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
        if (count >= start) result.push({ url: `${SITE_URL}/avis/${svc}/${v.slug}`, changeFrequency: 'monthly', priority: 0.5 })
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
      { url: `${SITE_URL}/problemes`, lastModified: STATIC_DATE, changeFrequency: 'weekly' as const, priority: 0.6 },
      ...problemSlugs.map(slug => ({ url: `${SITE_URL}/problemes/${slug}`, lastModified: STATIC_DATE, changeFrequency: 'monthly' as const, priority: 0.5 })),
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
        if (count >= start) result.push({ url: `${SITE_URL}/problemes/${problem}/${ville.slug}`, changeFrequency: 'monthly', priority: 0.4 })
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
    const barometreRegions: MetadataRoute.Sitemap = regions.map(region => ({
      url: `${SITE_URL}/barometre/regions/${region.slug}`,
      lastModified: byRegion.get(normalizeName(region.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
    // Baromètre métiers — lastmod = dernier provider modifié pour ce service
    const barometreMetiers: MetadataRoute.Sitemap = getTradesSlugs().map(slug => ({
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
    return regions.flatMap(region =>
      tradeSlugs.map(service => {
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


  // Provider sitemaps are served via /api/sitemap-providers (dynamic API route).
  // Requests to /sitemap/providers-*.xml are rewritten by next.config.js.

  return []
}
