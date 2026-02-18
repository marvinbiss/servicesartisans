import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions, getQuartiersByVille } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getGuideSlugs } from '@/lib/data/guides'
import { articleSlugs } from '@/lib/data/blog/articles'
import { allArticles } from '@/lib/data/blog/articles'
import { getBlogImage, getServiceImage, getCityImage, heroImage, getDepartmentImage, getRegionImage, pageImages, ambianceImages } from '@/lib/data/images'

// Provider batch size — well under the 50,000 URL sitemap limit
const PROVIDER_BATCH_SIZE = 40_000

/**
 * Generate sitemap index entries.
 * Next.js 14 calls this to produce /sitemap/[id].xml and a sitemap index.
 */
export async function generateSitemaps() {
  // Count total service×quartier URLs to determine batch count
  let totalServiceQuartierUrls = 0
  for (const v of villes) {
    totalServiceQuartierUrls += (v.quartiers?.length || 0) * services.length
  }
  const sqBatchCount = Math.ceil(totalServiceQuartierUrls / 45000) // Stay under 50K limit

  const sitemaps: { id: string }[] = [
    { id: 'static' },           // homepage, static pages, services index, individual services
    { id: 'service-cities' },   // service + city combination pages
    { id: 'cities' },           // villes index + individual city pages
    { id: 'geo' },              // departements + regions (index + individual)
    { id: 'quartiers' },        // quartier pages within cities
    // service×quartier sitemaps — split into batches if > 45K URLs
    ...Array.from({ length: sqBatchCount }, (_, i) => ({ id: `service-quartiers-${i}` })),
    // devis sitemaps
    { id: 'devis-services' },     // 46 service hub pages
    ...Array.from({ length: Math.ceil(services.length * villes.length / 45000) }, (_, i) => ({ id: `devis-service-cities-${i}` })),
    // devis×quartier sitemaps — batched at 45K per sitemap
    ...(() => {
      let totalDevisQuartierUrls = 0
      for (const v of villes) {
        totalDevisQuartierUrls += (v.quartiers?.length || 0) * services.length
      }
      const dqBatchCount = Math.ceil(totalDevisQuartierUrls / 45000)
      return Array.from({ length: dqBatchCount }, (_, i) => ({ id: `devis-quartiers-${i}` }))
    })(),
    // urgence service×city sitemaps
    ...(() => {
      const emergencySlugs = Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
      const ucBatchCount = Math.ceil(emergencySlugs.length * villes.length / 45000)
      return Array.from({ length: ucBatchCount }, (_, i) => ({ id: `urgence-service-cities-${i}` }))
    })(),
    // tarifs service×city sitemaps
    ...Array.from(
      { length: Math.ceil(services.length * villes.length / 45000) },
      (_, i) => ({ id: `tarifs-service-cities-${i}` })
    ),
    // avis sitemaps
    { id: 'avis-services' },
    ...Array.from(
      { length: Math.ceil(services.length * villes.length / 45000) },
      (_, i) => ({ id: `avis-service-cities-${i}` })
    ),
    // Problemes sitemaps
    { id: 'problemes' },  // hub + 30 problem pages
    ...Array.from(
      { length: Math.ceil(30 * villes.length / 45000) },
      (_, i) => ({ id: `problemes-cities-${i}` })
    ),
    // Dept×service sitemaps
    ...Array.from(
      { length: Math.ceil(departements.length * getTradesSlugs().length / 45000) },
      (_, i) => ({ id: `dept-services-${i}` })
    ),
    // Region×service sitemap
    { id: 'region-services' },
    // Guides sitemap
    { id: 'guides' },
  ]

  // Determine how many provider batches we need
  let providerCount = 0
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('noindex', false)

    if (!error && count) {
      providerCount = count
    }
  } catch {
    // DB unavailable at build time — no provider sitemaps
  }

  if (providerCount > 0) {
    const batchCount = Math.ceil(providerCount / PROVIDER_BATCH_SIZE)
    for (let i = 0; i < batchCount; i++) {
      sitemaps.push({ id: `providers-${i}` })
    }
  }

  return sitemaps
}

// Fixed date for static content — prevents crawl budget waste on every deploy
const STATIC_LAST_MODIFIED = new Date('2026-02-10')

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {

  // ── Static pages + services ─────────────────────────────────────────
  if (id === 'static') {
    const homepage: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ]

    const ogFallback = heroImage.src
    // Page-specific images where a relevant photo exists
    const staticPageImages: Record<string, string> = {
      '/a-propos': pageImages.about[0].src,
      '/comment-ca-marche': pageImages.howItWorks[0].src,
      '/notre-processus-de-verification': pageImages.verification[0].src,
      '/urgence': ambianceImages.ctaBg,
      '/devis': ambianceImages.renovation,
    }
    const staticPages: MetadataRoute.Sitemap = [
      { path: '/a-propos', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
      { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/comment-ca-marche', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/tarifs-artisans', changeFrequency: 'weekly' as const, priority: 0.8 },
      { path: '/urgence', changeFrequency: 'weekly' as const, priority: 0.8 },
      { path: '/devis', changeFrequency: 'weekly' as const, priority: 0.7 },
      { path: '/recherche', changeFrequency: 'monthly' as const, priority: 0.4 },
      { path: '/mentions-legales', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/confidentialite', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/cgv', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/accessibilite', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/notre-processus-de-verification', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/politique-avis', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/mediation', changeFrequency: 'yearly' as const, priority: 0.4 },
      { path: '/plan-du-site', changeFrequency: 'monthly' as const, priority: 0.4 },
      { path: '/outils/calculateur-prix', changeFrequency: 'monthly' as const, priority: 0.7 },
    ].map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency,
      priority,
      images: [staticPageImages[path] || ogFallback],
    }))

    const blogArticlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => {
      const article = allArticles[slug]
      const blogImage = article ? getBlogImage(slug, article.category) : null
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: article ? new Date(article.updatedDate || article.date) : STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        ...(blogImage ? { images: [blogImage.src] } : {}),
      }
    })

    const servicesIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/services`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
    ]

    const servicePages: MetadataRoute.Sitemap = services.map((service) => {
      const serviceImage = getServiceImage(service.slug)
      return {
        url: `${SITE_URL}/services/${service.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        images: [serviceImage.src],
      }
    })

    // Urgence sub-pages (services with emergencyInfo)
    const emergencySlugs = Object.keys(tradeContent).filter((s) => tradeContent[s].emergencyInfo)
    const urgencePages: MetadataRoute.Sitemap = emergencySlugs.map((slug) => ({
      url: `${SITE_URL}/urgence/${slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: [getServiceImage(slug).src],
    }))

    // Tarifs per-service pages
    const tarifsPages: MetadataRoute.Sitemap = Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/tarifs-artisans/${slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: [getServiceImage(slug).src],
    }))

    return [...homepage, ...staticPages, ...blogArticlePages, ...servicesIndex, ...servicePages, ...urgencePages, ...tarifsPages]
  }

  // ── Service + city combination pages ────────────────────────────────
  if (id === 'service-cities') {
    return services.flatMap((service) => {
      const serviceImage = getServiceImage(service.slug)
      return villes.map((ville) => ({
        url: `${SITE_URL}/services/${service.slug}/${ville.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: [serviceImage.src],
      }))
    })
  }

  // ── City pages ──────────────────────────────────────────────────────
  if (id === 'cities') {
    const villesIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/villes`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]

    const villePages: MetadataRoute.Sitemap = villes.map((ville) => {
      const cityImage = getCityImage(ville.slug)
      return {
        url: `${SITE_URL}/villes/${ville.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        images: [cityImage ? cityImage.src : heroImage.src],
      }
    })

    return [...villesIndex, ...villePages]
  }

  // ── Geo pages (départements + régions) ──────────────────────────────
  if (id === 'geo') {
    const departementsIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/departements`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]

    const departementPages: MetadataRoute.Sitemap = departements.map((dept) => ({
      url: `${SITE_URL}/departements/${dept.slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: [getDepartmentImage(dept.code).src],
    }))

    const regionsIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/regions`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]

    const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: [getRegionImage(region.slug).src],
    }))

    return [...departementsIndex, ...departementPages, ...regionsIndex, ...regionPages]
  }

  // ── Quartier pages ─────────────────────────────────────────────────
  if (id === 'quartiers') {
    return villes.flatMap(ville => {
      const cityImage = getCityImage(ville.slug)
      const images = cityImage ? [cityImage.src] : []
      return getQuartiersByVille(ville.slug).map(q => ({
        url: `${SITE_URL}/villes/${ville.slug}/${q.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        ...(images.length > 0 ? { images } : {}),
      }))
    })
  }

  // ── Service × Quartier pages (batched) ─────────────────────────────
  if (id.startsWith('service-quartiers-')) {
    const batchIndex = parseInt(id.replace('service-quartiers-', ''), 10)
    const batchSize = 45000
    const offset = batchIndex * batchSize

    // Flatten all service×ville×quartier URLs
    const allUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number; images: string[] }[] = []
    for (const svc of services) {
      const serviceImage = getServiceImage(svc.slug)
      for (const ville of villes) {
        const quartiers = getQuartiersByVille(ville.slug)
        for (const q of quartiers) {
          allUrls.push({
            url: `${SITE_URL}/services/${svc.slug}/${ville.slug}/${q.slug}`,
            lastModified: STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly',
            priority: 0.6,
            images: [serviceImage.src],
          })
        }
      }
    }

    return allUrls.slice(offset, offset + batchSize)
  }

  // ── Devis service hub pages ───────────────────────────────────────
  if (id === 'devis-services') {
    return Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/devis/${slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: [getServiceImage(slug).src],
    }))
  }

  // ── Devis service×city pages (batched) ────────────────────────────
  if (id.startsWith('devis-service-cities-')) {
    const batchIndex = parseInt(id.replace('devis-service-cities-', ''), 10)
    const batchSize = 45000
    const offset = batchIndex * batchSize

    const allUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number; images: string[] }[] = []
    for (const svc of services) {
      const serviceImage = getServiceImage(svc.slug)
      for (const ville of villes) {
        allUrls.push({
          url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.7,
          images: [serviceImage.src],
        })
      }
    }

    return allUrls.slice(offset, offset + batchSize)
  }

  // ── Devis × Quartier pages (batched) ──────────────────────────────
  if (id.startsWith('devis-quartiers-')) {
    const batchIndex = parseInt(id.replace('devis-quartiers-', ''), 10)
    const batchSize = 45000
    const offset = batchIndex * batchSize

    const allUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number; images: string[] }[] = []
    for (const svc of services) {
      const serviceImage = getServiceImage(svc.slug)
      for (const ville of villes) {
        const quartiers = getQuartiersByVille(ville.slug)
        for (const q of quartiers) {
          allUrls.push({
            url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}/${q.slug}`,
            lastModified: STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly',
            priority: 0.6,
            images: [serviceImage.src],
          })
        }
      }
    }

    return allUrls.slice(offset, offset + batchSize)
  }

  // ── Urgence service×city pages (batched) ────────────────────────────
  if (id.startsWith('urgence-service-cities-')) {
    const batchIndex = parseInt(id.replace('urgence-service-cities-', ''), 10)
    const BATCH = 45000
    const emergencySlugs = Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
    const allUrls: MetadataRoute.Sitemap = []

    for (const svc of emergencySlugs) {
      for (const v of villes) {
        allUrls.push({
          url: `${SITE_URL}/urgence/${svc}/${v.slug}`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }

    return allUrls.slice(batchIndex * BATCH, (batchIndex + 1) * BATCH)
  }

  // ── Tarifs service×city pages (batched) ─────────────────────────────
  if (id.startsWith('tarifs-service-cities-')) {
    const batchIndex = parseInt(id.replace('tarifs-service-cities-', ''), 10)
    const BATCH = 45000
    const allUrls: MetadataRoute.Sitemap = []

    for (const svc of services) {
      const serviceImage = getServiceImage(svc.slug)
      for (const v of villes) {
        allUrls.push({
          url: `${SITE_URL}/tarifs-artisans/${svc.slug}/${v.slug}`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.6,
          images: [serviceImage.src],
        })
      }
    }

    return allUrls.slice(batchIndex * BATCH, (batchIndex + 1) * BATCH)
  }

  // ── Avis service hub pages ──────────────────────────────────────────
  if (id === 'avis-services') {
    const tradeSlugs = Object.keys(tradeContent)
    return [
      { url: `${SITE_URL}/avis`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly' as const, priority: 0.7 },
      ...tradeSlugs.map(slug => ({
        url: `${SITE_URL}/avis/${slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  }

  // ── Avis service×city pages (batched) ───────────────────────────────
  if (id.startsWith('avis-service-cities-')) {
    const batchIndex = parseInt(id.replace('avis-service-cities-', ''), 10)
    const BATCH = 45000
    const tradeSlugs = Object.keys(tradeContent)
    const allUrls: MetadataRoute.Sitemap = []

    for (const svc of tradeSlugs) {
      for (const v of villes) {
        allUrls.push({
          url: `${SITE_URL}/avis/${svc}/${v.slug}`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }

    return allUrls.slice(batchIndex * BATCH, (batchIndex + 1) * BATCH)
  }

  // ── Problemes hub + individual pages ────────────────────────────────
  if (id === 'problemes') {
    const problemSlugs = getProblemSlugs()
    return [
      { url: `${SITE_URL}/problemes`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly' as const, priority: 0.7 },
      ...problemSlugs.map(slug => ({
        url: `${SITE_URL}/problemes/${slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  }

  // ── Problemes × city pages (batched) ──────────────────────────────
  if (id.startsWith('problemes-cities-')) {
    const batchIndex = parseInt(id.split('-').pop()!)
    const problemSlugs = getProblemSlugs()
    const allUrls: MetadataRoute.Sitemap = []
    for (const problem of problemSlugs) {
      for (const ville of villes) {
        allUrls.push({
          url: `${SITE_URL}/problemes/${problem}/${ville.slug}`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.4,
        })
      }
    }
    return allUrls.slice(batchIndex * 45000, (batchIndex + 1) * 45000)
  }

  // ── Dept × service pages (batched) ────────────────────────────────
  if (id.startsWith('dept-services-')) {
    const batchIndex = parseInt(id.split('-').pop()!)
    const tradeSlugs = getTradesSlugs()
    const allUrls: MetadataRoute.Sitemap = []
    for (const dept of departements) {
      for (const service of tradeSlugs) {
        allUrls.push({
          url: `${SITE_URL}/departements/${dept.slug}/${service}`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }
    return allUrls.slice(batchIndex * 45000, (batchIndex + 1) * 45000)
  }

  // ── Region × service pages ────────────────────────────────────────
  if (id === 'region-services') {
    const tradeSlugs = getTradesSlugs()
    return regions.flatMap(region =>
      tradeSlugs.map(service => ({
        url: `${SITE_URL}/regions/${region.slug}/${service}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
    )
  }

  // ── Guides hub + individual pages ─────────────────────────────────
  if (id === 'guides') {
    const guideSlugs = getGuideSlugs()
    return [
      { url: `${SITE_URL}/guides`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly' as const, priority: 0.7 },
      ...guideSlugs.map(slug => ({
        url: `${SITE_URL}/guides/${slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  }

  // ── Provider pages (batched) ────────────────────────────────────────
  if (id.startsWith('providers-')) {
    const batchIndex = parseInt(id.replace('providers-', ''), 10)
    const offset = batchIndex * PROVIDER_BATCH_SIZE

    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const supabase = createAdminClient()

      const serviceMap = new Map<string, string>()
      for (const s of services) {
        serviceMap.set(
          s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
          s.slug
        )
      }

      const villeMap = new Map<string, string>()
      for (const v of villes) {
        villeMap.set(
          v.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
          v.slug
        )
      }

      const specialtyToSlug: Record<string, string> = {
        'plombier': 'plombier',
        'electricien': 'electricien',
        'chauffagiste': 'chauffagiste',
        'menuisier': 'menuisier',
        'menuisier-metallique': 'menuisier',
        'carreleur': 'carreleur',
        'couvreur': 'couvreur',
        'macon': 'macon',
        'peintre': 'peintre-en-batiment',
        'charpentier': 'couvreur',
        'isolation': 'climaticien',
        'platrier': 'peintre-en-batiment',
        'finition': 'peintre-en-batiment',
      }

      type ProviderRow = {
        name: string | null
        slug: string | null
        stable_id: string | null
        specialty: string | null
        address_city: string | null
        updated_at: string | null
      }

      let allProviders: ProviderRow[] = []
      let from = offset
      const PAGE_SIZE = 1000
      const limit = offset + PROVIDER_BATCH_SIZE

      while (from < limit) {
        const { data, error } = await supabase
          .from('providers')
          .select('name, slug, stable_id, specialty, address_city, updated_at')
          .eq('is_active', true)
          .eq('noindex', false)
          .order('updated_at', { ascending: false })
          .range(from, Math.min(from + PAGE_SIZE - 1, limit - 1))

        if (error || !data || data.length === 0) break
        allProviders = allProviders.concat(data)
        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
      }

      const providerEntries: MetadataRoute.Sitemap = allProviders
        .filter((p) => p.name && (p.stable_id || p.slug) && p.specialty && p.address_city)
        .map((p) => {
          const normalizedSpecialty = p.specialty!.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
          const serviceSlug = serviceMap.get(normalizedSpecialty) || specialtyToSlug[p.specialty!.toLowerCase()]
          const normalizedCity = p.address_city!.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
          const locationSlug = villeMap.get(normalizedCity)
          const publicId = p.stable_id || p.slug

          if (!serviceSlug || !locationSlug || !publicId) return null

          return {
            url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            images: [getServiceImage(serviceSlug).src],
          }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

      return providerEntries
    } catch {
      // DB unavailable at build time — return empty
      return []
    }
  }

  // Fallback for unknown sitemap IDs
  return []
}
