import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Homepage
  const homepage: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  // Static pages
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
    lastModified: now,
    changeFrequency,
    priority,
  }))

  // Services index
  const servicesIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Individual service pages (15 services)
  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Service + city combination pages (15 services x 141 villes = 2,115 pages)
  const serviceCityPages: MetadataRoute.Sitemap = services.flatMap((service) =>
    villes.map((ville) => ({
      url: `${SITE_URL}/services/${service.slug}/${ville.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  )

  // Villes index
  const villesIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/villes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Individual ville pages (141 villes)
  const villePages: MetadataRoute.Sitemap = villes.map((ville) => ({
    url: `${SITE_URL}/villes/${ville.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Departements index
  const departementsIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/departements`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Individual departement pages
  const departementPages: MetadataRoute.Sitemap = departements.map((dept) => ({
    url: `${SITE_URL}/departements/${dept.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Regions index
  const regionsIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/regions`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Individual region pages
  const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
    url: `${SITE_URL}/regions/${region.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic provider entries from database
  let providerEntries: MetadataRoute.Sitemap = []

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
    let from = 0
    const PAGE_SIZE = 1000

    while (true) {
      const { data, error } = await supabase
        .from('providers')
        .select('name, slug, stable_id, specialty, address_city, updated_at')
        .eq('is_active', true)
        .eq('noindex', false)
        .order('updated_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (error || !data || data.length === 0) break
      allProviders = allProviders.concat(data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    providerEntries = allProviders
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
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
        return acc
      }, [])
  } catch {
    // DB unavailable at build time — return static entries only
  }

  return [
    ...homepage,
    ...staticPages,
    ...servicesIndex,
    ...servicePages,
    ...serviceCityPages,
    ...villesIndex,
    ...villePages,
    ...departementsIndex,
    ...departementPages,
    ...regionsIndex,
    ...regionPages,
    ...providerEntries,
  ]
}
