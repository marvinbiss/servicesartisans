import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for fetching dynamic data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const services = [
  'plombier',
  'electricien',
  'serrurier',
  'chauffagiste',
  'peintre',
  'menuisier',
  'carreleur',
  'maconnerie',
  'couvreur',
  'jardinier',
  'climatisation',
  'demenagement',
]

const villes = [
  'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes',
  'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes',
  'reims', 'le-havre', 'saint-etienne', 'toulon', 'grenoble',
  'dijon', 'angers', 'nimes', 'villeurbanne', 'clermont-ferrand',
  'le-mans', 'aix-en-provence', 'brest', 'tours', 'amiens',
]

const regions = [
  'ile-de-france', 'provence-alpes-cote-d-azur', 'auvergne-rhone-alpes',
  'nouvelle-aquitaine', 'occitanie', 'hauts-de-france', 'grand-est',
  'pays-de-la-loire', 'bretagne', 'normandie', 'bourgogne-franche-comte',
  'centre-val-de-loire', 'corse',
]

const departements = [
  'ain', 'aisne', 'allier', 'alpes-de-haute-provence', 'hautes-alpes',
  'alpes-maritimes', 'ardeche', 'ardennes', 'ariege', 'aube', 'aude',
  'aveyron', 'bouches-du-rhone', 'calvados', 'cantal', 'charente',
  'charente-maritime', 'cher', 'correze', 'corse-du-sud', 'haute-corse',
  'cote-d-or', 'cotes-d-armor', 'creuse', 'dordogne', 'doubs', 'drome',
  'eure', 'eure-et-loir', 'finistere', 'gard', 'haute-garonne', 'gers',
  'gironde', 'herault', 'ille-et-vilaine', 'indre', 'indre-et-loire',
  'isere', 'jura', 'landes', 'loir-et-cher', 'loire', 'haute-loire',
  'loire-atlantique', 'loiret', 'lot', 'lot-et-garonne', 'lozere',
  'maine-et-loire', 'manche', 'marne', 'haute-marne', 'mayenne',
  'meurthe-et-moselle', 'meuse', 'morbihan', 'moselle', 'nievre',
  'nord', 'oise', 'orne', 'pas-de-calais', 'puy-de-dome', 'pyrenees-atlantiques',
  'hautes-pyrenees', 'pyrenees-orientales', 'bas-rhin', 'haut-rhin',
  'rhone', 'haute-saone', 'saone-et-loire', 'sarthe', 'savoie',
  'haute-savoie', 'paris', 'seine-maritime', 'seine-et-marne', 'yvelines',
  'deux-sevres', 'somme', 'tarn', 'tarn-et-garonne', 'var', 'vaucluse',
  'vendee', 'vienne', 'haute-vienne', 'vosges', 'yonne', 'territoire-de-belfort',
  'essonne', 'hauts-de-seine', 'seine-saint-denis', 'val-de-marne', 'val-d-oise',
]

const blogSlugs = [
  'comment-choisir-plombier',
  'renovation-energetique-2024',
  'urgence-plomberie-que-faire',
  'tendances-decoration-2024',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  const currentDate = new Date()

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/villes`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/regions`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/departements`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/devis`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/comment-ca-marche`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tarifs-artisans`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/inscription`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/inscription-artisan`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/connexion`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Pages de services
  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Pages services + villes principales
  const serviceVillePages: MetadataRoute.Sitemap = services.flatMap((service) =>
    villes.slice(0, 10).map((ville) => ({
      url: `${baseUrl}/services/${service}/${ville}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  // Pages régions
  const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
    url: `${baseUrl}/regions/${region}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Pages départements
  const departementPages: MetadataRoute.Sitemap = departements.map((dept) => ({
    url: `${baseUrl}/departements/${dept}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  // Pages blog
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Fetch verified artisans dynamically
  let artisanPages: MetadataRoute.Sitemap = []
  try {
    const { data: artisans } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('user_type', 'artisan')
      .eq('is_verified', true)
      .in('subscription_plan', ['pro', 'premium'])
      .limit(1000)

    artisanPages = (artisans || []).map((artisan) => ({
      url: `${baseUrl}/artisan/${artisan.id}`,
      lastModified: artisan.updated_at ? new Date(artisan.updated_at) : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error fetching artisans for sitemap:', error)
  }

  return [
    ...staticPages,
    ...servicePages,
    ...serviceVillePages,
    ...regionPages,
    ...departementPages,
    ...blogPages,
    ...artisanPages,
  ]
}
