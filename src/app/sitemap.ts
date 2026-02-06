import { MetadataRoute } from 'next'

/**
 * Sitemap v2 stub — will be replaced by wave-based dynamic sitemap
 * using stable_id (HMAC) once the supabase-v2 schema is in place.
 *
 * For now: only static pages are indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://servicesartisans.fr'
  const now = new Date()

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/comment-ca-marche`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/tarifs-artisans`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/accessibilite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
