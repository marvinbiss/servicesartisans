import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions, getQuartiersByVille } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getGuideSlugs } from '@/lib/data/guides'
import { articleSlugs } from '@/lib/data/blog/articles'
import { allArticles } from '@/lib/data/blog/articles'
import {
  getStaticSitemapIds,
  STATIC_BATCH,
  LARGE_BATCH,
  TOP_CITIES_PHASE1,
  getEmergencySlugs,
} from '@/lib/seo/sitemap-manifest'

/**
 * Generate sitemap index entries.
 * Next.js 14 calls this to produce /sitemap/[id].xml and a sitemap index.
 *
 * Single source of truth: `@/lib/seo/sitemap-manifest`
 */
export async function generateSitemaps() {
  // Provider sitemaps are served dynamically via /api/sitemap-providers
  // (DB-dependent, can't reliably pre-render at build time).
  // They are referenced in the sitemap index (/api/sitemap-index) and
  // rewritten via next.config.js: /sitemap/providers-*.xml → /api/sitemap-providers?id=*
  return getStaticSitemapIds().map(id => ({ id }))
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {

  // ── Static pages + services ─────────────────────────────────────────
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

    const servicesIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/services` },
    ]

    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
    }))

    const urgencePages: MetadataRoute.Sitemap = getEmergencySlugs().map((slug) => ({
      url: `${SITE_URL}/urgence/${slug}`,
    }))

    const tarifsPages: MetadataRoute.Sitemap = Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/tarifs/${slug}`,
    }))

    return [...homepage, ...staticPages, ...blogArticlePages, ...servicesIndex, ...servicePages, ...urgencePages, ...tarifsPages]
  }

  // ── Service + city — Phase 1: top 300 cities ────────────────────────
  if (id.startsWith('service-cities-') && !id.startsWith('service-cities-extended-')) {
    const batchIndex = parseInt(id.replace('service-cities-', ''), 10)
    const BATCH = LARGE_BATCH
    const offset = batchIndex * BATCH

    const phase1Cities = villes.slice(0, TOP_CITIES_PHASE1)
    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      for (const ville of phase1Cities) {
        allUrls.push({ url: `${SITE_URL}/services/${service.slug}/${ville.slug}` })
      }
    }

    return allUrls.slice(offset, offset + BATCH)
  }

  // ── Service + city — Phase 2: remaining cities (not registered yet) ──
  if (id.startsWith('service-cities-extended-')) {
    const batchIndex = parseInt(id.replace('service-cities-extended-', ''), 10)
    const BATCH = LARGE_BATCH
    const offset = batchIndex * BATCH

    const phase2Cities = villes.slice(TOP_CITIES_PHASE1)
    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      for (const ville of phase2Cities) {
        allUrls.push({ url: `${SITE_URL}/services/${service.slug}/${ville.slug}` })
      }
    }

    return allUrls.slice(offset, offset + BATCH)
  }

  // ── City pages ──────────────────────────────────────────────────────
  if (id === 'cities') {
    const villesIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/villes` },
    ]

    const villePages: MetadataRoute.Sitemap = villes.map((ville) => ({
      url: `${SITE_URL}/villes/${ville.slug}`,
    }))

    return [...villesIndex, ...villePages]
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

  // ── Quartier pages ─────────────────────────────────────────────────
  if (id === 'quartiers') {
    return villes.flatMap(ville =>
      getQuartiersByVille(ville.slug).map(q => ({
        url: `${SITE_URL}/villes/${ville.slug}/${q.slug}`,
      }))
    )
  }

  // ── Service × Quartier pages ────────────────────────────────────────
  if (id.startsWith('service-quartiers-')) {
    const batchIndex = parseInt(id.replace('service-quartiers-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const ville of villes) {
        const quartiers = getQuartiersByVille(ville.slug)
        for (const q of quartiers) {
          if (count >= end) break outer
          if (count >= start) result.push({ url: `${SITE_URL}/services/${svc.slug}/${ville.slug}/${q.slug}` })
          count++
        }
      }
    }

    return result
  }

  // ── Devis service hub pages ─────────────────────────────────────────
  if (id === 'devis-services') {
    return Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/devis/${slug}`,
    }))
  }

  // ── Devis service×city pages ────────────────────────────────────────
  if (id.startsWith('devis-service-cities-')) {
    const batchIndex = parseInt(id.replace('devis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const ville of villes) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}` })
        count++
      }
    }

    return result
  }

  // ── Devis × Quartier pages ──────────────────────────────────────────
  if (id.startsWith('devis-quartiers-')) {
    const batchIndex = parseInt(id.replace('devis-quartiers-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const ville of villes) {
        const quartiers = getQuartiersByVille(ville.slug)
        for (const q of quartiers) {
          if (count >= end) break outer
          if (count >= start) result.push({ url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}/${q.slug}` })
          count++
        }
      }
    }

    return result
  }

  // ── Urgence service×city pages ──────────────────────────────────────
  if (id.startsWith('urgence-service-cities-')) {
    const batchIndex = parseInt(id.replace('urgence-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of getEmergencySlugs()) {
      for (const v of villes) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/urgence/${svc}/${v.slug}` })
        count++
      }
    }

    return result
  }

  // ── Tarifs service×city pages ───────────────────────────────────────
  if (id.startsWith('tarifs-service-cities-')) {
    const batchIndex = parseInt(id.replace('tarifs-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const v of villes) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/tarifs/${svc.slug}/${v.slug}` })
        count++
      }
    }

    return result
  }

  // ── Avis service hub pages ──────────────────────────────────────────
  if (id === 'avis-services') {
    const tradeSlugs = Object.keys(tradeContent)
    return [
      { url: `${SITE_URL}/avis` },
      ...tradeSlugs.map(slug => ({ url: `${SITE_URL}/avis/${slug}` })),
    ]
  }

  // ── Avis service×city pages ─────────────────────────────────────────
  if (id.startsWith('avis-service-cities-')) {
    const batchIndex = parseInt(id.replace('avis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const tradeSlugs = Object.keys(tradeContent)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of tradeSlugs) {
      for (const v of villes) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/avis/${svc}/${v.slug}` })
        count++
      }
    }

    return result
  }

  // ── Problemes hub + individual pages ────────────────────────────────
  if (id === 'problemes') {
    const problemSlugs = getProblemSlugs()
    return [
      { url: `${SITE_URL}/problemes` },
      ...problemSlugs.map(slug => ({ url: `${SITE_URL}/problemes/${slug}` })),
    ]
  }

  // ── Problemes × city pages ──────────────────────────────────────────
  if (id.startsWith('problemes-cities-')) {
    const batchIndex = parseInt(id.split('-').pop()!)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const problemSlugs = getProblemSlugs()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const problem of problemSlugs) {
      for (const ville of villes) {
        if (count >= end) break outer
        if (count >= start) result.push({ url: `${SITE_URL}/problemes/${problem}/${ville.slug}` })
        count++
      }
    }

    return result
  }

  // ── Dept × service pages ────────────────────────────────────────────
  if (id.startsWith('dept-services-')) {
    const batchIndex = parseInt(id.split('-').pop()!)
    const tradeSlugs = getTradesSlugs()
    const allUrls: MetadataRoute.Sitemap = []
    for (const dept of departements) {
      for (const service of tradeSlugs) {
        allUrls.push({ url: `${SITE_URL}/departements/${dept.slug}/${service}` })
      }
    }
    return allUrls.slice(batchIndex * LARGE_BATCH, (batchIndex + 1) * LARGE_BATCH)
  }

  // ── Region × service pages ──────────────────────────────────────────
  if (id === 'region-services') {
    const tradeSlugs = getTradesSlugs()
    return regions.flatMap(region =>
      tradeSlugs.map(service => ({
        url: `${SITE_URL}/regions/${region.slug}/${service}`,
      }))
    )
  }

  // ── Guides hub + individual pages ───────────────────────────────────
  if (id === 'guides') {
    const guideSlugs = getGuideSlugs()
    return [
      { url: `${SITE_URL}/guides` },
      ...guideSlugs.map(slug => ({ url: `${SITE_URL}/guides/${slug}` })),
    ]
  }

  // Provider sitemaps are served via /api/sitemap-providers (dynamic API route).
  // Requests to /sitemap/providers-*.xml are rewritten by next.config.js.

  return []
}
