import { SITE_URL } from '@/lib/seo/config'
import { getAuthorByName, getReviewerForAuthor, type Author } from '@/lib/data/authors'
import { getAuthorityCitations } from '@/lib/seo/authoritative-citations'

/**
 * Tier 20 — auto-résolution des citations autorité depuis section + keywords.
 * Évite ~141 callers d'avoir à passer `citation` explicitement. Override
 * possible via `input.citation` (ex. guide qui cite des sources spécifiques
 * d'une opération CEE précise).
 */
function resolveCitationsForFlagship(section: string, keywords: readonly string[]): string[] {
  const haystack = [section, ...keywords].join(' ').toLowerCase()
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
  /** Custom CSS selectors for SpeakableSpecification. Defaults target
   * h1 + [data-speakable] + .flagship-lede + .faq-question + .faq-answer. */
  speakableCssSelectors?: string[]
  /** Opt out of Speakable if a guide should not be surfaced to voice
   * (e.g., highly procedural content where voice cards misread steps). */
  disableSpeakable?: boolean
  /** Tier 20 — URLs autorité (.gouv.fr, ANAH, ADEME, Légifrance) émises
   * comme `citation` Schema.org. Signal QRG section 3.4 trustworthiness :
   * Google + AI Overviews valorisent les pages YMYL qui sourcent leurs
   * affirmations sur des publications publiques officielles plutôt que sur
   * du contenu auto-référencé. Cf. `lib/seo/authoritative-citations.ts`
   * pour les listes par topic (MAPRIMERENOV / CEE / RGE / éco-PTZ etc.). */
  citation?: readonly string[]
}

function buildPersonNode(profile: Author): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@type': 'Person',
    '@id': `${SITE_URL}/equipe/${profile.slug}#person`,
    url: `${SITE_URL}/equipe/${profile.slug}`,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    image: `${SITE_URL}${profile.image}`,
    knowsAbout: profile.expertise,
    worksFor: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
    },
    // Intentionally no hasCredential / sameAs : staff writers do not hold
    // the RGE/Qualibat/Qualifelec/OPQTECC certifications of the artisans
    // their guides cite. Claiming them would be fraud under Google QRG.
    // E-E-A-T signals here : worksFor (Organization authority) + knowsAbout
    // (topic areas, verifiable via articles attributed to the author) +
    // skills (editorial methodology) + hasOccupation.experienceRequirements
    // (yearsExperience + credentialsBasis, both factual and defensible).
  }
  if (profile.methodology && profile.methodology.length > 0) {
    node.skills = profile.methodology
  }
  if (profile.yearsExperience > 0 || profile.credentialsBasis) {
    node.hasOccupation = {
      '@type': 'Occupation',
      name: profile.role,
      occupationLocation: { '@type': 'Country', name: 'France' },
      experienceRequirements: profile.credentialsBasis
        ? `${profile.yearsExperience} ans — ${profile.credentialsBasis}`
        : `${profile.yearsExperience} ans`,
    }
  }
  return node
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

  // Reviewer resolution priority :
  //   1. Explicit `reviewerName` passed by the caller (legacy + override path).
  //   2. Auto-derive from the author's `reviewerSlug` (peer cross-review map
  //      defined in `@/lib/data/authors`). Couvre 141 callers d'un seul édit.
  // Garde-fou : pas de self-review (déjà filtré dans getReviewerForAuthor).
  const reviewerProfile = (() => {
    if (input.reviewerName) return getAuthorByName(input.reviewerName)
    if (input.author.type !== 'person') return undefined
    const authorProfile = getAuthorByName(input.author.name)
    return getReviewerForAuthor(authorProfile)
  })()

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical}#article`,
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
    ...(() => {
      // Override caller > auto-résolution. La liste auto est mergée avec
      // l'override pour ne pas perdre les sources spécifiques que le caller
      // a choisi de citer en plus.
      const auto = resolveCitationsForFlagship(input.section, input.keywords)
      const override = input.citation ?? []
      const merged = Array.from(new Set<string>([...override, ...auto]))
      return merged.length > 0 ? { citation: merged } : {}
    })(),
  }
  if (!input.disableSpeakable) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: input.speakableCssSelectors || [
        'h1',
        '[data-speakable="true"]',
        '.flagship-lede',
        '.faq-question',
        '.faq-answer',
      ],
    }
  }
  return schema
}
