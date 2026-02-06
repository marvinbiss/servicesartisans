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
          '/_next/',
          '/auth/',
          '/connexion',
          '/inscription',
          '/inscription-artisan',
          '/mot-de-passe-oublie',
          '/booking/',
          '/avis/',
          '/devis',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
