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
          '/departements/',
          '/regions/',
          '/blog/',
          '/devis',
          '/faq',
          '/tarifs-artisans',
          '/a-propos',
          '/contact',
          '/comment-ca-marche',
          '/urgence',
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
          '/debug/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
