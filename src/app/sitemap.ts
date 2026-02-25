import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'
import { tradeContent } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getGuideSlugs } from '@/lib/data/guides'
import { articleSlugs } from '@/lib/data/blog/articles'
import { allArticles } from '@/lib/data/blog/articles'
import {
  getStaticSitemapIds,
  LARGE_BATCH,
  SITEMAP_TOP_CITIES,
} from '@/lib/seo/sitemap-manifest'

/**
 * Generate sitemap index entries.
 * Next.js 14 calls this to produce /sitemap/[id].xml and a sitemap index.
 *
 * Single source of truth: `@/lib/seo/sitemap-manifest`
 *
 * Smart sitemap v2: only hub pages, blog, top N cities, and geo.
 * Pruned categories (quartiers, devis×city, tarifs×city, etc.) are still
 * indexable via internal linking but excluded from sitemap.
 */
export async function generateSitemaps() {
  // Provider sitemaps are served dynamically via /api/sitemap-providers
  // (DB-dependent, can't reliably pre-render at build time).
  // They are referenced in the sitemap index (/api/sitemap-index) and
  // rewritten via next.config.js: /sitemap/providers-*.xml → /api/sitemap-providers?id=*
  return getStaticSitemapIds().map(id => ({ id }))
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {

  // ── Static pages + all hub pages ──────────────────────────────────
  if (id === 'static') {
    const homepage: MetadataRoute.Sitemap = [
      { url: SITE_URL },
    ]

    const staticPages: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/a-propos` },
      { url: `${SITE_URL}/contact` },
      { url: `${SITE_URL}/blog` },
      { url: `${SITE_URL}/faq` },
      { url: `${SITE_URL}/comment-ca-marche` },
      { url: `${SITE_URL}/tarifs` },
      { url: `${SITE_URL}/urgence` },
      { url: `${SITE_URL}/devis` },
      { url: `${SITE_URL}/mentions-legales` },
      { url: `${SITE_URL}/confidentialite` },
      { url: `${SITE_URL}/cgv` },
      { url: `${SITE_URL}/accessibilite` },
      { url: `${SITE_URL}/notre-processus-de-verification` },
      { url: `${SITE_URL}/politique-avis` },
      { url: `${SITE_URL}/mediation` },
      { url: `${SITE_URL}/plan-du-site` },
      { url: `${SITE_URL}/outils/calculateur-prix` },
      { url: `${SITE_URL}/outils/diagnostic` },
      { url: `${SITE_URL}/carte-artisans` },
      { url: `${SITE_URL}/artisans` },
    ]

    // Blog articles — lastModified réel (seul contenu avec vraie date vérifiable)
    const blogArticlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => {
      const article = allArticles[slug]
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: article ? new Date(article.updatedDate || article.date) : undefined,
      }
    })

    // Service hub + individual service pages
    const servicesIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/services` },
    ]
    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
    }))

    // Urgence hub + individual urgence pages (only services with emergencyInfo)
    const emergencySlugs = Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
    const urgencePages: MetadataRoute.Sitemap = emergencySlugs.map((slug) => ({
      url: `${SITE_URL}/urgence/${slug}`,
    }))

    // Tarifs hub pages (individual service tarifs)
    const tarifsPages: MetadataRoute.Sitemap = Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/tarifs/${slug}`,
    }))

    // Devis service pages
    const devisPages: MetadataRoute.Sitemap = Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/devis/${slug}`,
    }))

    // Avis hub + individual service avis pages
    const avisPages: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/avis` },
      ...Object.keys(tradeContent).map(slug => ({ url: `${SITE_URL}/avis/${slug}` })),
    ]

    // Problèmes hub + individual problem pages
    const problemSlugs = getProblemSlugs()
    const problemesPages: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/problemes` },
      ...problemSlugs.map(slug => ({ url: `${SITE_URL}/problemes/${slug}` })),
    ]

    // Guides hub + individual guide pages
    const guideSlugs = getGuideSlugs()
    const guidesPages: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/guides` },
      ...guideSlugs.map(slug => ({ url: `${SITE_URL}/guides/${slug}` })),
    ]

    return [
      ...homepage,
      ...staticPages,
      ...blogArticlePages,
      ...servicesIndex,
      ...servicePages,
      ...urgencePages,
      ...tarifsPages,
      ...devisPages,
      ...avisPages,
      ...problemesPages,
      ...guidesPages,
    ]
  }

  // ── Service + city — top N cities only ────────────────────────────
  if (id.startsWith('service-cities-')) {
    const batchIndex = parseInt(id.replace('service-cities-', ''), 10)
    const BATCH = LARGE_BATCH
    const offset = batchIndex * BATCH

    const topCities = villes.slice(0, SITEMAP_TOP_CITIES)
    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      for (const ville of topCities) {
        allUrls.push({ url: `${SITE_URL}/services/${service.slug}/${ville.slug}` })
      }
    }

    return allUrls.slice(offset, offset + BATCH)
  }

  // ── Geo pages (départements + régions) ──────────────────────────────
  if (id === 'geo') {
    const departementsIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/departements` },
    ]

    const departementPages: MetadataRoute.Sitemap = departements.map((dept) => ({
      url: `${SITE_URL}/departements/${dept.slug}`,
    }))

    const regionsIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/regions` },
    ]

    const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}`,
    }))

    return [...departementsIndex, ...departementPages, ...regionsIndex, ...regionPages]
  }

  // Provider sitemaps are served via /api/sitemap-providers (dynamic API route).
  // Requests to /sitemap/providers-*.xml are rewritten by next.config.js.

  return []
}
