import { MetadataRoute } from 'next'
import { services, villes } from '@/lib/data/france'

const BASE_URL = 'https://servicesartisans.fr'

/** Normalize a string for matching: lowercase, strip diacritics, trim. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Sitemap wave 1 — controlled activation via `noindex` column.
 *
 * Only providers with noindex=false are included.
 * Hub pages (service × location) are included if they have at least one
 * indexable provider.
 *
 * Static pages are always included.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages (always indexed)
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/comment-ca-marche`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tarifs-artisans`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/accessibilite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/notre-processus-de-verification`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/politique-avis`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/mediation`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ]

  // Build lookup maps: normalized name → static slug
  const serviceMap = new Map<string, string>()
  for (const s of services) {
    serviceMap.set(normalize(s.name), s.slug)
  }

  const villeMap = new Map<string, string>()
  for (const v of villes) {
    villeMap.set(normalize(v.name), v.slug)
  }

  // Dynamic entries: only providers with noindex=false
  let providerEntries: MetadataRoute.Sitemap = []
  let hubEntries: MetadataRoute.Sitemap = []

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Fetch all indexable providers with pagination
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

    if (allProviders.length === 0) {
      return staticEntries
    }

    // Track unique hub pages (service × location)
    const hubs = new Set<string>()

    providerEntries = allProviders
      .filter((p) => p.name && p.stable_id && p.specialty && p.address_city)
      .reduce<MetadataRoute.Sitemap>((acc, p) => {
        const serviceSlug = serviceMap.get(normalize(p.specialty!))
        const locationSlug = villeMap.get(normalize(p.address_city!))

        // Only include providers whose service AND city exist in static data
        if (!serviceSlug || !locationSlug) return acc

        hubs.add(`${serviceSlug}/${locationSlug}`)

        acc.push({
          url: `${BASE_URL}/services/${serviceSlug}/${locationSlug}/${p.stable_id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
        return acc
      }, [])

    // Hub pages for each unique service × location with indexable providers
    hubEntries = Array.from(hubs).map((hub) => ({
      url: `${BASE_URL}/services/${hub}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (err) {
    console.error('Sitemap DB error', err)
    return staticEntries
  }

  return [...staticEntries, ...hubEntries, ...providerEntries]
}
