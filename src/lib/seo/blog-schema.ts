import { SITE_URL } from '@/lib/seo/config'
import { getAuthorByName } from '@/lib/data/authors'

/**
 * Generate the Article + FAQ JSON-LD schemas for a blog post.
 * Returns an array of schema objects to be rendered via the JsonLd component.
 */
export function getBlogArticleSchema(article: {
  title: string
  excerpt: string
  content: string[]
  author: string
  date: string
  updatedDate?: string
  category: string
  tags: string[]
}, slug: string, imageUrl?: string): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = []

  // Article schema — image always present (Google requires it for rich results)
  const articleImage = imageUrl || `${SITE_URL}/opengraph-image`
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: articleImage,
    author: (() => {
      if (article.author === 'ServicesArtisans') {
        return {
          '@type': 'Organization' as const,
          name: 'Équipe éditoriale ServicesArtisans',
          url: `${SITE_URL}/a-propos`,
          '@id': `${SITE_URL}#organization`,
        }
      }
      const authorProfile = getAuthorByName(article.author)
      if (authorProfile) {
        return {
          '@type': 'Person' as const,
          name: authorProfile.name,
          jobTitle: authorProfile.role,
          description: authorProfile.bio,
          knowsAbout: authorProfile.expertise,
          hasCredential: authorProfile.certifications.map(cert => ({
            '@type': 'EducationalOccupationalCredential' as const,
            credentialCategory: 'certification',
            name: cert,
          })),
        }
      }
      return {
        '@type': 'Person' as const,
        name: article.author,
      }
    })(),
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      '@id': `${SITE_URL}#organization`,
    },
    datePublished: article.date,
    dateModified: article.updatedDate || article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    articleSection: article.category,
    keywords: article.tags.join(', '),
    inLanguage: 'fr-FR',
    about: [
      { '@type': 'Thing', name: article.category },
      ...article.tags.slice(0, 5).map(tag => ({ '@type': 'Thing', name: tag })),
    ],
  })

  // FAQPage schema is generated separately in the blog page component via getFAQSchema()

  return schemas
}
