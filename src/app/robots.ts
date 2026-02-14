import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'

const PRIVATE_DISALLOW = [
  // Private/auth routes
  '/admin/',
  '/api/',
  '/auth/',
  '/espace-client/',
  '/espace-artisan/',
  '/booking/',
  // Auth pages (no SEO value)
  '/connexion',
  '/inscription',
  '/inscription-artisan',
  '/mot-de-passe-oublie',
  // Query parameter variations (duplicate content)
  '/*?sort=',
  '/*?page=',
  '/*?filter=',
  '/*?q=',
  '/*?redirect=',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Googlebot: full access, no crawl-delay (Google ignores it)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: PRIVATE_DISALLOW,
      },
      // Bingbot: full access
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: PRIVATE_DISALLOW,
      },
      // All other legitimate bots
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_DISALLOW,
      },
      // Block aggressive SEO scrapers (consume resources, no SEO benefit)
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'PetalBot',
          'DataForSeoBot',
          'Bytespider',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
