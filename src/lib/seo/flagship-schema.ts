import { SITE_URL } from '@/lib/seo/config'
import { getAuthorByName, type Author } from '@/lib/data/authors'

type FlagshipAuthor = { type: 'person'; name: string } | { type: 'organization' }

export type FlagshipArticleInput = {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
  author: FlagshipAuthor
  reviewerName?: string
  section: string
  keywords: string[]
  image?: string
}

function buildPersonNode(profile: Author) {
  return {
    '@type': 'Person' as const,
    '@id': `${SITE_URL}/equipe/${profile.slug}#person`,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    image: `${SITE_URL}${profile.image}`,
    knowsAbout: profile.expertise,
    worksFor: {
      '@type': 'Organization' as const,
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
    },
    hasCredential: profile.certifications.map((cert) => ({
      '@type': 'EducationalOccupationalCredential' as const,
      credentialCategory: 'certification',
      name: cert,
    })),
    ...(profile.yearsExperience > 0 && {
      hasOccupation: {
        '@type': 'Occupation' as const,
        name: profile.role,
        experienceRequirements: `${profile.yearsExperience}+ ans d'expérience`,
      },
    }),
    ...(profile.social?.linkedin && {
      sameAs: [profile.social.linkedin],
    }),
  }
}

/**
 * Build the Article schema for a flagship /guides/* page.
 * Uses author profile from `@/lib/data/authors` when available; falls back to the
 * organizational author for generic editorial content.
 */
export function getFlagshipArticleSchema(input: FlagshipArticleInput): Record<string, unknown> {
  const canonical = `${SITE_URL}/guides/${input.slug}`
  const articleImage = input.image || `${SITE_URL}/opengraph-image`

  const authorNode = (() => {
    if (input.author.type === 'organization') {
      return {
        '@type': 'Organization' as const,
        '@id': `${SITE_URL}#organization`,
        name: 'Équipe éditoriale ServicesArtisans',
        url: `${SITE_URL}/a-propos`,
      }
    }
    const profile = getAuthorByName(input.author.name)
    if (profile) return buildPersonNode(profile)
    return { '@type': 'Person' as const, name: input.author.name }
  })()

  const reviewerProfile = input.reviewerName ? getAuthorByName(input.reviewerName) : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: articleImage,
    author: authorNode,
    ...(reviewerProfile && {
      reviewedBy: buildPersonNode(reviewerProfile),
    }),
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      '@id': `${SITE_URL}#organization`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`,
      },
    },
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    url: canonical,
    articleSection: input.section,
    keywords: input.keywords.join(', '),
    inLanguage: 'fr-FR',
    about: [
      { '@type': 'Thing', name: input.section },
      ...input.keywords.slice(0, 5).map((tag) => ({ '@type': 'Thing', name: tag })),
    ],
  }
}
