import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://servicesartisans.fr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/services/',
          '/villes/',
          '/regions/',
          '/departements/',
          '/faq',
          '/tarifs-artisans',
          '/a-propos',
          '/contact',
          '/blog/',
        ],
        disallow: [
          '/api/',
          '/espace-client/',
          '/espace-artisan/',
          '/admin/',
          '/pro/',
          '/_next/',
          '/auth/',
          '/callback/',
          '/confirmation/',
          '/mot-de-passe-oublie',
          '/booking/',
          '/avis/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/espace-client/',
          '/espace-artisan/',
          '/admin/',
          '/pro/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
