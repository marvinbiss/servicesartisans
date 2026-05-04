/**
 * Regression guard for the reviewedBy plumbing introduced 2026-05-04.
 *
 * Couvre :
 *   - authors.getReviewerForAuthor (lookup + self-review guard + missing slug)
 *   - jsonld.getReviewedByPersonSchema (shape minimale + @id stable)
 *   - flagship-schema.getFlagshipArticleSchema (auto-resolution + override)
 *   - blog-schema.getBlogArticleSchema (Person author → reviewedBy émis)
 *
 * Critique : ces helpers couvrent ~65K URLs (Tier 1+2+3). Si quelqu'un
 * casse le shape Schema.org, c'est le crawl Google qui régresse en silence.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
  SITE_NAME: 'ServicesArtisans',
}))

vi.mock('@/lib/config/company-identity', () => ({
  companyIdentity: {
    email: 'contact@servicesartisans.fr',
    phone: '07 56 87 27 87',
    legalName: null,
    address: null,
    foundingDate: null,
    tvaIntracom: null,
  },
  isCompanyRegistered: vi.fn(() => false),
  getSocialLinks: vi.fn(() => []),
}))

vi.mock('@/lib/seo/location-content', () => ({
  hashCode: (s: string) => {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i)
      hash |= 0
    }
    return hash
  },
}))

import { authors, getReviewerForAuthor, type Author } from '@/lib/data/authors'
import { getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getBlogArticleSchema } from '@/lib/seo/blog-schema'

describe('authors.getReviewerForAuthor', () => {
  it('returns the peer reviewer when reviewerSlug is set', () => {
    const claire = authors['claire-dubois']
    const reviewer = getReviewerForAuthor(claire)
    expect(reviewer).toBeDefined()
    expect(reviewer?.slug).toBe('sophie-martin')
    expect(reviewer?.name).toBe('Sophie Martin')
  })

  it('returns undefined when author is undefined', () => {
    expect(getReviewerForAuthor(undefined)).toBeUndefined()
  })

  it('returns undefined when reviewerSlug is missing', () => {
    const noReviewer: Author = {
      slug: 'ghost',
      name: 'Ghost',
      role: 'role',
      bio: '',
      expertise: [],
      methodology: [],
      credentialsBasis: '',
      yearsExperience: 0,
      image: '',
    }
    expect(getReviewerForAuthor(noReviewer)).toBeUndefined()
  })

  it('refuses self-review (reviewerSlug pointing to self)', () => {
    const selfReview: Author = {
      ...authors['sophie-martin'],
      reviewerSlug: 'sophie-martin',
    }
    expect(getReviewerForAuthor(selfReview)).toBeUndefined()
  })

  it('returns undefined when reviewerSlug points to unknown author', () => {
    const broken: Author = {
      ...authors['sophie-martin'],
      reviewerSlug: 'does-not-exist',
    }
    expect(getReviewerForAuthor(broken)).toBeUndefined()
  })

  it('every staff author defines a peer reviewer (E-E-A-T contract)', () => {
    for (const author of Object.values(authors)) {
      const reviewer = getReviewerForAuthor(author)
      expect(reviewer, `${author.slug} doit avoir un reviewer peer`).toBeDefined()
      expect(reviewer?.slug).not.toBe(author.slug)
    }
  })
})

describe('jsonld.getReviewedByPersonSchema', () => {
  it('emits a minimal Person ref with stable @id', () => {
    const schema = getReviewedByPersonSchema({
      slug: 'sophie-martin',
      name: 'Sophie Martin',
      role: 'Rédactrice',
    })
    expect(schema['@type']).toBe('Person')
    expect(schema['@id']).toBe('https://servicesartisans.fr/equipe/sophie-martin#person')
    expect(schema.url).toBe('https://servicesartisans.fr/equipe/sophie-martin')
    expect(schema.name).toBe('Sophie Martin')
    expect(schema.jobTitle).toBe('Rédactrice')
  })

  it('does NOT leak unrelated Person fields (knowsAbout, hasOccupation)', () => {
    const schema = getReviewedByPersonSchema({
      slug: 'claire-dubois',
      name: 'Claire Dubois',
      role: 'Rédactrice prix',
    })
    expect(schema).not.toHaveProperty('knowsAbout')
    expect(schema).not.toHaveProperty('hasOccupation')
    expect(schema).not.toHaveProperty('worksFor')
  })
})

describe('flagship-schema.getFlagshipArticleSchema reviewedBy', () => {
  const baseInput = {
    title: 'Guide test',
    description: 'desc',
    slug: 'guide-test',
    datePublished: '2026-01-01',
    section: 'Test',
    keywords: ['kw1'],
  }

  it('auto-derives reviewedBy from author.reviewerSlug when reviewerName absent', () => {
    const schema = getFlagshipArticleSchema({
      ...baseInput,
      author: { type: 'person', name: 'Sophie Martin' },
    })
    expect(schema.reviewedBy).toBeDefined()
    const reviewedBy = schema.reviewedBy as Record<string, unknown>
    expect(reviewedBy['@type']).toBe('Person')
    expect(reviewedBy['@id']).toContain('claire-dubois')
  })

  it('explicit reviewerName overrides auto-resolution', () => {
    const schema = getFlagshipArticleSchema({
      ...baseInput,
      author: { type: 'person', name: 'Sophie Martin' },
      reviewerName: 'Marc Lefebvre',
    })
    const reviewedBy = schema.reviewedBy as Record<string, unknown>
    expect(reviewedBy['@id']).toContain('marc-lefebvre')
  })

  it('does NOT emit reviewedBy when author is Organization', () => {
    const schema = getFlagshipArticleSchema({
      ...baseInput,
      author: { type: 'organization' },
    })
    expect(schema.reviewedBy).toBeUndefined()
  })

  it('does NOT emit reviewedBy when author Person has no profile match', () => {
    const schema = getFlagshipArticleSchema({
      ...baseInput,
      author: { type: 'person', name: 'Inconnu Externe' },
    })
    expect(schema.reviewedBy).toBeUndefined()
  })
})

describe('blog-schema.getBlogArticleSchema reviewedBy', () => {
  const baseArticle = {
    title: 'Test',
    excerpt: 'excerpt',
    content: ['p1'],
    date: '2026-01-01',
    category: 'Renovation',
    tags: ['t1'],
  }

  it('emits reviewedBy when blog author maps to a profile with reviewerSlug', () => {
    const [schema] = getBlogArticleSchema(
      { ...baseArticle, author: 'Claire Dubois' },
      'test-slug',
      'https://example.com/img.jpg'
    )
    expect(schema.reviewedBy).toBeDefined()
    const reviewedBy = schema.reviewedBy as Record<string, unknown>
    expect(reviewedBy['@id']).toContain('sophie-martin')
  })

  it('does NOT emit reviewedBy for ServicesArtisans organizational author', () => {
    const [schema] = getBlogArticleSchema(
      { ...baseArticle, author: 'ServicesArtisans' },
      'test-slug'
    )
    expect(schema.reviewedBy).toBeUndefined()
  })

  it('does NOT emit reviewedBy for unknown human author', () => {
    const [schema] = getBlogArticleSchema({ ...baseArticle, author: 'Auteur Inconnu' }, 'test-slug')
    expect(schema.reviewedBy).toBeUndefined()
  })
})
