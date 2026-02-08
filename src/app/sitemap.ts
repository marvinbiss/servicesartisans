import { MetadataRoute } from 'next'

const BASE_URL = 'https://servicesartisans.fr'

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
  ]

  // Dynamic entries: only providers with noindex=false
  let providerEntries: MetadataRoute.Sitemap = []
  let hubEntries: MetadataRoute.Sitemap = []

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Fetch all indexable providers (noindex=false)
    // TODO: paginate when provider count exceeds Supabase default limit
    const { data: providers, error } = await supabase
      .from('providers')
      .select('name, slug, stable_id, specialty, address_city, updated_at')
      .eq('is_active', true)
      .eq('noindex', false)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Sitemap DB error', error)
      return staticEntries
    }

    if (!providers || providers.length === 0) {
      return staticEntries
    }

    // Track unique hub pages (service × location)
    const hubs = new Set<string>()

    providerEntries = providers
      .filter((p) => p.name && p.stable_id && p.specialty && p.address_city)
      .map((p) => {
        const serviceSlug = slugify(p.specialty!)
        const locationSlug = slugify(p.address_city!)
        hubs.add(`${serviceSlug}/${locationSlug}`)

        return {
          url: `${BASE_URL}/services/${serviceSlug}/${locationSlug}/${p.stable_id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      })

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

/** Simple French-safe slugifier */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
