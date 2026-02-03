/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://servicesartisans.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,

  // Exclude paths that shouldn't be indexed
  exclude: [
    '/api/*',
    '/admin/*',
    '/dashboard/*',
    '/auth/*',
    '/account/*',
    '/settings/*',
    '/messages/*',
    '/reservations/*',
    '/erreur',
    '/500',
    '/404',
  ],

  // Custom transformation for dynamic routes
  transform: async (config, path) => {
    // High priority pages
    const highPriorityPages = ['/', '/services', '/carte', '/inscription', '/connexion']
    const isHighPriority = highPriorityPages.includes(path)

    // Service category pages
    const isServicePage = path.startsWith('/services/')

    // Provider profile pages
    const isProviderPage = path.startsWith('/artisan/')

    // Blog/guide pages
    const isBlogPage = path.startsWith('/blog/') || path.startsWith('/guide/')

    return {
      loc: path,
      changefreq: isHighPriority ? 'daily' : isProviderPage ? 'weekly' : config.changefreq,
      priority: isHighPriority ? 1.0 : isServicePage ? 0.9 : isProviderPage ? 0.8 : isBlogPage ? 0.7 : config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },

  // Additional paths to include (dynamic routes)
  additionalPaths: async (config) => {
    const result = []

    // Service categories
    const services = [
      'plomberie',
      'electricite',
      'menuiserie',
      'peinture',
      'maconnerie',
      'carrelage',
      'chauffage',
      'climatisation',
      'serrurerie',
      'jardinage',
      'nettoyage',
      'demenagement',
      'renovation',
      'isolation',
      'toiture',
    ]

    for (const service of services) {
      result.push({
        loc: `/services/${service}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      })
    }

    // Major French cities
    const cities = [
      'paris',
      'marseille',
      'lyon',
      'toulouse',
      'nice',
      'nantes',
      'strasbourg',
      'montpellier',
      'bordeaux',
      'lille',
      'rennes',
      'reims',
      'saint-etienne',
      'toulon',
      'le-havre',
      'grenoble',
      'dijon',
      'angers',
      'nimes',
      'villeurbanne',
    ]

    for (const city of cities) {
      result.push({
        loc: `/artisans/${city}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      })

      // Combine services with cities for long-tail SEO
      for (const service of services.slice(0, 5)) {
        result.push({
          loc: `/artisans/${city}/${service}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: new Date().toISOString(),
        })
      }
    }

    return result
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/account/',
          '/settings/',
          '/messages/',
          '/reservations/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    additionalSitemaps: [
      // Add additional sitemaps if needed in the future
      // `${process.env.SITE_URL || 'https://servicesartisans.fr'}/sitemap-providers.xml`,
    ],
  },
}
