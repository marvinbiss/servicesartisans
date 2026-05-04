import { SITE_URL } from '@/lib/seo/config'
import { getAuthorByName, getReviewerForAuthor } from '@/lib/data/authors'
import { getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { getAuthorityCitations } from '@/lib/seo/authoritative-citations'

/**
 * Tier 20 — auto-résolution des citations autorité depuis category + tags.
 * Permet aux ~110 articles blog d'émettre des `citation` Schema.org sans
 * édition par page : si le tag matche un topic connu (maprimerenov, cee,
 * rge, eco-ptz, pac, isolation, coup-de-pouce, tva), les URLs autorité
 * correspondantes sont injectées dans le payload Article.
 */
function resolveCitationsForBlogArticle(category: string, tags: readonly string[]): string[] {
  const haystack = [category, ...tags].join(' ').toLowerCase()
  const topics: string[] = []
  if (/maprimer[ée]nov/.test(haystack)) topics.push('maprimerenov')
  if (/\bcee\b|certificat.*[ée]conomie/.test(haystack)) topics.push('cee')
  if (/\brge\b|qualibat|qualipac|qualibois|qualifelec|qualisol/.test(haystack)) topics.push('rge')
  if (/[ée]co[ -]ptz|prêt à taux z[eé]ro/.test(haystack)) topics.push('eco-ptz')
  if (/tva.*5,?5|tva r[eé]duite/.test(haystack)) topics.push('tva')
  if (/pompe à chaleur|\bpac\b/.test(haystack)) topics.push('pac')
  if (/coup de pouce/.test(haystack)) topics.push('coup-de-pouce')
  if (/isolation|\bite\b|\biti\b/.test(haystack)) topics.push('isolation')
  return getAuthorityCitations(topics)
}

/**
 * Generate the Article + FAQ JSON-LD schemas for a blog post.
 * Returns an array of schema objects to be rendered via the JsonLd component.
 */
export function getBlogArticleSchema(
  article: {
    title: string
    excerpt: string
    content: string[]
    author: string
    date: string
    updatedDate?: string
    category: string
    tags: string[]
  },
  slug: string,
  imageUrl?: string
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = []

  // Article schema — image always present (Google requires it for rich results)
  const articleImage = imageUrl || `${SITE_URL}/opengraph-image`
  const isRecent =
    article.date && Date.now() - new Date(article.date).getTime() < 48 * 60 * 60 * 1000
  const articleType = isRecent ? 'NewsArticle' : 'Article'
  const articleAuthorProfile =
    article.author === 'ServicesArtisans' ? undefined : getAuthorByName(article.author)
  const articleReviewer = getReviewerForAuthor(articleAuthorProfile)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': articleType,
    headline: article.title,
    description: article.excerpt,
    image: articleImage,
    ...(articleReviewer && { reviewedBy: getReviewedByPersonSchema(articleReviewer) }),
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
        const personNode: Record<string, unknown> = {
          '@type': 'Person',
          '@id': `${SITE_URL}/equipe/${authorProfile.slug}#person`,
          url: `${SITE_URL}/equipe/${authorProfile.slug}`,
          name: authorProfile.name,
          jobTitle: authorProfile.role,
          description: authorProfile.bio,
          image: `${SITE_URL}${authorProfile.image}`,
          knowsAbout: authorProfile.expertise,
          worksFor: {
            '@type': 'Organization',
            '@id': `${SITE_URL}#organization`,
            name: 'ServicesArtisans',
          },
          // No hasCredential / sameAs : see flagship-schema.ts for rationale.
          // Staff writers are not the RGE-certified artisans their articles cite.
        }
        if (authorProfile.methodology && authorProfile.methodology.length > 0) {
          personNode.skills = authorProfile.methodology
        }
        if (authorProfile.yearsExperience > 0 || authorProfile.credentialsBasis) {
          personNode.hasOccupation = {
            '@type': 'Occupation',
            name: authorProfile.role,
            occupationLocation: { '@type': 'Country', name: 'France' },
            experienceRequirements: authorProfile.credentialsBasis
              ? `${authorProfile.yearsExperience} ans — ${authorProfile.credentialsBasis}`
              : `${authorProfile.yearsExperience} ans`,
          }
        }
        return personNode
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
      ...article.tags.slice(0, 5).map((tag) => ({ '@type': 'Thing', name: tag })),
    ],
    ...(() => {
      const citations = resolveCitationsForBlogArticle(article.category, article.tags)
      return citations.length > 0 ? { citation: citations } : {}
    })(),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: [
        'h1',
        '[data-speakable="true"]',
        '.article-excerpt',
        '.faq-question',
        '.faq-answer',
      ],
    },
  })

  // FAQPage schema is generated separately in the blog page component via getFAQSchema()

  return schemas
}
