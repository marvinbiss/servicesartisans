import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'

// Provider batch size — well under the 50,000 URL sitemap limit
const PROVIDER_BATCH_SIZE = 40_000

/**
 * Generate sitemap index entries.
 * Next.js 14 calls this to produce /sitemap/[id].xml and a sitemap index.
 */
export async function generateSitemaps() {
  const sitemaps: { id: string }[] = [
    { id: 'static' },           // homepage, static pages, services index, individual services
    { id: 'service-cities' },   // service + city combination pages
    { id: 'cities' },           // villes index + individual city pages
    { id: 'geo' },              // departements + regions (index + individual)
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

    const staticPages: MetadataRoute.Sitemap = [
      { path: '/a-propos', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
      { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/comment-ca-marche', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/tarifs-artisans', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/urgence', changeFrequency: 'weekly' as const, priority: 0.9 },
      { path: '/devis', changeFrequency: 'monthly' as const, priority: 0.8 },
      { path: '/inscription-artisan', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/recherche', changeFrequency: 'weekly' as const, priority: 0.8 },
      { path: '/mentions-legales', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/confidentialite', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/cgv', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/accessibilite', changeFrequency: 'yearly' as const, priority: 0.3 },
      { path: '/notre-processus-de-verification', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/politique-avis', changeFrequency: 'monthly' as const, priority: 0.5 },
      { path: '/mediation', changeFrequency: 'yearly' as const, priority: 0.4 },
      { path: '/blog/comment-choisir-plombier', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/blog/renovation-energetique-2026', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/blog/urgence-plomberie-que-faire', changeFrequency: 'monthly' as const, priority: 0.6 },
      { path: '/blog/tendances-decoration-2026', changeFrequency: 'monthly' as const, priority: 0.6 },
    ].map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency,
      priority,
    }))

    const servicesIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/services`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
    ]

    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...homepage, ...staticPages, ...servicesIndex, ...servicePages]
  }

  // ── Service + city combination pages ────────────────────────────────
  if (id === 'service-cities') {
    return services.flatMap((service) =>
      villes.map((ville) => ({
        url: `${SITE_URL}/services/${service.slug}/${ville.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    )
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

    const villePages: MetadataRoute.Sitemap = villes.map((ville) => ({
      url: `${SITE_URL}/villes/${ville.slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

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
    }))

    return [...departementsIndex, ...departementPages, ...regionsIndex, ...regionPages]
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

      return allProviders
        .filter((p) => p.name && (p.stable_id || p.slug) && p.specialty && p.address_city)
        .reduce<MetadataRoute.Sitemap>((acc, p) => {
          const normalizedSpecialty = p.specialty!.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
          const serviceSlug = serviceMap.get(normalizedSpecialty) || specialtyToSlug[p.specialty!.toLowerCase()]
          const normalizedCity = p.address_city!.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
          const locationSlug = villeMap.get(normalizedCity)

          if (!serviceSlug || !locationSlug) return acc

          const publicId = p.stable_id || p.slug
          if (!publicId) return acc

          acc.push({
            url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          })
          return acc
        }, [])
    } catch {
      // DB unavailable at build time — return empty
      return []
    }
  }

  // Fallback for unknown sitemap IDs
  return []
}
