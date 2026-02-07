import { MetadataRoute } from 'next'
import { villes, departements } from '@/lib/data/france'

const BASE_URL = 'https://servicesartisans.fr'

/**
 * Sitemap v2 — full coverage
 *
 * Sections:
 * 1. Static pages (12)
 * 2. Service pages (15 services from staticServices)
 * 3. Geo pages: villes (141+), départements (96+), régions (18)
 * 4. Service × Ville hub pages (top services × top cities)
 * 5. Blog pages
 * 6. Provider pages from DB (all active providers with slug)
 *
 * Logs provider count at generation time.
 */

const services = [
  'plombier', 'electricien', 'serrurier', 'chauffagiste',
  'peintre-en-batiment', 'menuisier', 'carreleur', 'couvreur',
  'macon', 'jardinier', 'vitrier', 'climaticien',
  'cuisiniste', 'solier', 'nettoyage',
]

const regions = [
  'ile-de-france', 'auvergne-rhone-alpes', 'provence-alpes-cote-azur',
  'occitanie', 'nouvelle-aquitaine', 'hauts-de-france', 'grand-est',
  'pays-de-la-loire', 'bretagne', 'normandie', 'bourgogne-franche-comte',
  'centre-val-de-loire', 'corse',
  'guadeloupe', 'martinique', 'guyane', 'la-reunion', 'mayotte',
]

const blogSlugs = [
  'comment-choisir-artisan',
  'devis-travaux-guide',
  'renovation-energetique-aides',
  'urgence-plomberie-que-faire',
]

// Top 10 cities for service×city matrix
const topCities = villes.slice(0, 10).map(v => v.slug)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ─── 1. Static pages ───
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/villes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/regions`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/departements`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/devis`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/comment-ca-marche`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/tarifs-artisans`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/inscription`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/inscription-artisan`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/connexion`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/accessibilite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // ─── 2. Service pages ───
  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE_URL}/services/${s}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // ─── 3. Service × Ville hub pages (top 10 cities × all services) ───
  const serviceVilleEntries: MetadataRoute.Sitemap = services.flatMap((s) =>
    topCities.map((city) => ({
      url: `${BASE_URL}/services/${s}/${city}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  // ─── 4. Geo pages: villes ───
  const villeEntries: MetadataRoute.Sitemap = villes.map((v) => ({
    url: `${BASE_URL}/villes/${v.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // ─── 5. Geo pages: départements ───
  const deptEntries: MetadataRoute.Sitemap = departements.map((d) => ({
    url: `${BASE_URL}/departements/${d.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  // ─── 6. Geo pages: régions ───
  const regionEntries: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${BASE_URL}/regions/${r}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // ─── 7. Blog pages ───
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // ─── 8. Provider pages from DB (all active providers with slug) ───
  let providerEntries: MetadataRoute.Sitemap = []
  let dbHubEntries: MetadataRoute.Sitemap = []

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Include ALL active providers (not just noindex=false)
    const { data: providers, error } = await supabase
      .from('providers')
      .select('slug, specialty, address_city, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000)

    if (error) {
      console.error('[Sitemap] DB error:', error.message)
    } else if (providers && providers.length > 0) {
      const hubs = new Set<string>()

      providerEntries = providers
        .filter((p) => p.slug && p.specialty && p.address_city)
        .map((p) => {
          const serviceSlug = slugify(p.specialty!)
          const locationSlug = slugify(p.address_city!)
          hubs.add(`${serviceSlug}/${locationSlug}`)

          return {
            url: `${BASE_URL}/services/${serviceSlug}/${locationSlug}/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          }
        })

      // Hub pages from DB (unique service × location combos)
      dbHubEntries = Array.from(hubs).map((hub) => ({
        url: `${BASE_URL}/services/${hub}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      // ─── METRICS LOG ───
      console.warn(`[Sitemap] Generated: ${staticEntries.length} static, ${serviceEntries.length} services, ${serviceVilleEntries.length} service×ville, ${villeEntries.length} villes, ${deptEntries.length} départements, ${regionEntries.length} régions, ${blogEntries.length} blog, ${providerEntries.length} providers (from ${providers.length} DB rows), ${dbHubEntries.length} DB hubs`)
    } else {
      console.warn('[Sitemap] No active providers found in DB — sitemap will have geo+static pages only')
    }
  } catch (err) {
    console.error('[Sitemap] DB error:', err)
  }

  const allEntries = [
    ...staticEntries,
    ...serviceEntries,
    ...serviceVilleEntries,
    ...villeEntries,
    ...deptEntries,
    ...regionEntries,
    ...blogEntries,
    ...dbHubEntries,
    ...providerEntries,
  ]

  console.warn(`[Sitemap] TOTAL URLs: ${allEntries.length}`)

  return allEntries
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
