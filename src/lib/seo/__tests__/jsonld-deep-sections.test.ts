import { describe, it, expect } from 'vitest'

import {
  getDeepSectionsFAQPageSchema,
  getDeepSectionsHowToSchemas,
  getDeepSectionsTechArticleSchema,
} from '../jsonld'
import { SITE_URL } from '../config'

const SAMPLE_SECTIONS = [
  {
    id: 'pompe-a-chaleur-air-eau',
    h2: 'Pompe à chaleur air/eau : fonctionnement, prix et aides',
    body: [
      "La PAC air/eau capte les calories de l'air extérieur et chauffe le circuit central. " +
        'COP 3,5 à 4,5 selon modèle. Solution n°1 pour remplacer fioul ou gaz.',
      'Comptez 10 000 à 18 000 € pose comprise pour 8-14 kW.',
    ],
  },
  {
    id: 'pompe-a-chaleur-geothermique',
    h2: 'Pompe à chaleur géothermique : performance maximale',
    body: ['Capte calories du sol, COP 4-5 stable. Coût 15-25 k€.'],
  },
] as const

describe('getDeepSectionsTechArticleSchema — Sprint F Ahrefs 2026-05-03', () => {
  const pageUrl = `${SITE_URL}/services/pompe-a-chaleur`
  const baseParams = {
    pageUrl,
    topic: 'Pompe à chaleur',
    sections: SAMPLE_SECTIONS,
    image: `${SITE_URL}/og-image.jpg`,
    datePublished: '2026-05-03T00:00:00+02:00',
    dateModified: '2026-05-03T00:00:00+02:00',
    authorName: 'la rédaction ServicesArtisans',
    publisherName: 'ServicesArtisans',
  }

  it('returns null when sections is empty', () => {
    expect(
      getDeepSectionsTechArticleSchema({
        ...baseParams,
        sections: [],
      })
    ).toBeNull()
  })

  it('emits @context https://schema.org and @type TechArticle', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    expect(s).not.toBeNull()
    expect(s?.['@context']).toBe('https://schema.org')
    expect(s?.['@type']).toBe('TechArticle')
  })

  it('exposes a stable @id anchored to pageUrl#techarticle-deep', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    expect(s?.['@id']).toBe(`${pageUrl}#techarticle-deep`)
  })

  it('headline includes the topic and "guide approfondi"', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    expect(s?.headline).toBe('Pompe à chaleur : guide approfondi')
  })

  it('declares fr-FR + free + Beginner proficiency', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    expect(s?.inLanguage).toBe('fr-FR')
    expect(s?.isAccessibleForFree).toBe(true)
    expect(s?.proficiencyLevel).toBe('Beginner')
  })

  it('articleSection lists every section H2 in order', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    expect(s?.articleSection).toEqual(SAMPLE_SECTIONS.map((sec) => sec.h2))
  })

  it('hasPart emits one WebPageElement per section with cssSelector and stable @id', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    const parts = s?.hasPart as Array<Record<string, unknown>>
    expect(parts).toHaveLength(SAMPLE_SECTIONS.length)
    parts.forEach((part, i) => {
      expect(part['@type']).toBe('WebPageElement')
      expect(part['@id']).toBe(`${pageUrl}#${SAMPLE_SECTIONS[i].id}`)
      expect(part.name).toBe(SAMPLE_SECTIONS[i].h2)
      expect(part.cssSelector).toBe(`#${SAMPLE_SECTIONS[i].id}`)
    })
  })

  it('hasPart description is the truncated first paragraph (≤ 250 chars)', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    const parts = s?.hasPart as Array<Record<string, unknown>>
    SAMPLE_SECTIONS.forEach((section, i) => {
      const description = parts[i].description as string | undefined
      expect(description).toBeDefined()
      expect(description?.length).toBeLessThanOrEqual(250)
      expect(description).toBe(section.body[0]?.slice(0, 250))
    })
  })

  it('speakable targets #deep-sections H3 + data-speakable', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    const speakable = s?.speakable as Record<string, unknown>
    expect(speakable['@type']).toBe('SpeakableSpecification')
    expect(speakable.cssSelector).toEqual([
      '#deep-sections h3',
      '#deep-sections [data-speakable="true"]',
    ])
  })

  it('mainEntityOfPage points to pageUrl', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    const mainEntity = s?.mainEntityOfPage as Record<string, unknown>
    expect(mainEntity['@type']).toBe('WebPage')
    expect(mainEntity['@id']).toBe(pageUrl)
  })

  it('author + publisher are required Schema.org Article fields and emitted', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    const author = s?.author as Record<string, unknown>
    const publisher = s?.publisher as Record<string, unknown>
    expect(author['@type']).toBe('Person')
    expect(author.name).toBe('la rédaction ServicesArtisans')
    expect(publisher['@type']).toBe('Organization')
    expect(publisher.name).toBe('ServicesArtisans')
  })

  it('emits image + datePublished + dateModified (Schema.org Article required)', () => {
    const s = getDeepSectionsTechArticleSchema(baseParams)
    expect(s?.image).toEqual([`${SITE_URL}/og-image.jpg`])
    expect(s?.datePublished).toBe('2026-05-03T00:00:00+02:00')
    expect(s?.dateModified).toBe('2026-05-03T00:00:00+02:00')
  })

  // Tier 12 — enrichissement Person profile + reviewedBy + keywords + about
  describe('Tier 12 enrichments', () => {
    it('falls back to flat Person node when authorName does not match a profile', () => {
      const s = getDeepSectionsTechArticleSchema(baseParams)
      const author = s?.author as Record<string, unknown>
      expect(author['@type']).toBe('Person')
      expect(author.name).toBe('la rédaction ServicesArtisans')
      expect(author['@id']).toBeUndefined()
      expect(s?.reviewedBy).toBeUndefined()
    })

    it('emits rich Person node + reviewedBy when authorName matches a real Author', () => {
      const s = getDeepSectionsTechArticleSchema({
        ...baseParams,
        authorName: 'Sophie Martin',
      })
      const author = s?.author as Record<string, unknown>
      expect(author['@type']).toBe('Person')
      expect(author.name).toBe('Sophie Martin')
      expect(typeof author['@id']).toBe('string')
      expect(author.jobTitle).toBeDefined()
      expect(author.url).toBeDefined()
      expect(s?.reviewedBy).toBeDefined()
      const reviewer = s?.reviewedBy as Record<string, unknown>
      expect(reviewer['@type']).toBe('Person')
    })

    it('emits keywords (topic + section H2s) and about[] for topical matching', () => {
      const s = getDeepSectionsTechArticleSchema(baseParams)
      expect(typeof s?.keywords).toBe('string')
      expect((s?.keywords as string).startsWith('Pompe à chaleur')).toBe(true)
      const about = s?.about as Array<Record<string, unknown>>
      expect(Array.isArray(about)).toBe(true)
      expect(about.length).toBeGreaterThanOrEqual(2)
      expect(about[0]).toEqual({ '@type': 'Thing', name: 'Pompe à chaleur' })
    })

    it('emits canonical url field on the TechArticle', () => {
      const s = getDeepSectionsTechArticleSchema(baseParams)
      expect(s?.url).toBe(pageUrl)
    })

    it('publisher carries @id + name (Organization de-dup with global Org node)', () => {
      const s = getDeepSectionsTechArticleSchema(baseParams)
      const publisher = s?.publisher as Record<string, unknown>
      expect(publisher['@id']).toBe(`${SITE_URL}#organization`)
      expect(publisher.name).toBe('ServicesArtisans')
    })
  })
})

describe('getDeepSectionsFAQPageSchema — Sprint H Ahrefs 2026-05-03', () => {
  const pageUrl = `${SITE_URL}/services/pompe-a-chaleur`
  const baseParams = {
    pageUrl,
    sections: SAMPLE_SECTIONS,
  }

  it('returns null when sections is empty', () => {
    expect(
      getDeepSectionsFAQPageSchema({
        pageUrl,
        sections: [],
      })
    ).toBeNull()
  })

  it('emits @context schema.org and @type FAQPage with stable @id', () => {
    const s = getDeepSectionsFAQPageSchema(baseParams)
    expect(s?.['@context']).toBe('https://schema.org')
    expect(s?.['@type']).toBe('FAQPage')
    expect(s?.['@id']).toBe(`${pageUrl}#faq-deep`)
  })

  it('mainEntity has one Question per section with stable @id and url anchor', () => {
    const s = getDeepSectionsFAQPageSchema(baseParams)
    const entities = s?.mainEntity as Array<Record<string, unknown>>
    expect(entities).toHaveLength(SAMPLE_SECTIONS.length)
    entities.forEach((q, i) => {
      expect(q['@type']).toBe('Question')
      expect(q['@id']).toBe(`${pageUrl}#faq-${SAMPLE_SECTIONS[i].id}`)
      expect(q.name).toBe(SAMPLE_SECTIONS[i].h2)
      const answer = q.acceptedAnswer as Record<string, unknown>
      expect(answer['@type']).toBe('Answer')
      expect(answer.url).toBe(`${pageUrl}#${SAMPLE_SECTIONS[i].id}`)
      expect(answer.text).toBe(SAMPLE_SECTIONS[i].body[0])
    })
  })

  it('truncates answer text to default 500 chars', () => {
    const longBody = 'x'.repeat(700)
    const s = getDeepSectionsFAQPageSchema({
      pageUrl,
      sections: [{ id: 'long', h2: 'Long ?', body: [longBody] }],
    })
    const entity = (s?.mainEntity as Array<Record<string, unknown>>)[0]
    const answer = entity.acceptedAnswer as Record<string, unknown>
    expect((answer.text as string).length).toBe(500)
  })

  it('honors answerMaxChars override (e.g. 250 for compact PAA)', () => {
    const longBody = 'y'.repeat(700)
    const s = getDeepSectionsFAQPageSchema({
      pageUrl,
      sections: [{ id: 'long', h2: 'Long ?', body: [longBody] }],
      answerMaxChars: 250,
    })
    const entity = (s?.mainEntity as Array<Record<string, unknown>>)[0]
    const answer = entity.acceptedAnswer as Record<string, unknown>
    expect((answer.text as string).length).toBe(250)
  })

  it('handles section with empty body[] gracefully (answer text empty string)', () => {
    const s = getDeepSectionsFAQPageSchema({
      pageUrl,
      sections: [{ id: 'empty', h2: 'Empty ?', body: [] }],
    })
    const entity = (s?.mainEntity as Array<Record<string, unknown>>)[0]
    const answer = entity.acceptedAnswer as Record<string, unknown>
    expect(answer.text).toBe('')
  })
})

describe('getDeepSectionsHowToSchemas — Sprint G Ahrefs 2026-05-03', () => {
  const pageUrl = `${SITE_URL}/services/pompe-a-chaleur`

  it('returns empty array when no section has an overlay', () => {
    const result = getDeepSectionsHowToSchemas({
      pageUrl,
      sections: [{ id: 'no-overlay-id' }],
      overlayLookup: () => null,
    })
    expect(result).toEqual([])
  })

  it('emits one HowTo Schema per section that has an overlay', () => {
    const result = getDeepSectionsHowToSchemas({
      pageUrl,
      sections: [{ id: 'a' }, { id: 'b' }, { id: 'no-overlay' }],
      overlayLookup: (id) =>
        id === 'a' || id === 'b'
          ? {
              name: `Comment X pour ${id}`,
              description: `Description ${id}`,
              totalTime: 'PT15M',
              steps: [
                { name: 'Step 1', text: 'Long enough text content for step 1.' },
                { name: 'Step 2', text: 'Long enough text content for step 2.' },
                { name: 'Step 3', text: 'Long enough text content for step 3.' },
              ],
            }
          : null,
    })
    expect(result).toHaveLength(2)
    expect(result[0]['@id']).toBe(`${pageUrl}#howto-a`)
    expect(result[1]['@id']).toBe(`${pageUrl}#howto-b`)
  })

  it('HowTo Schema declares correct shape : @context, @type, mainEntityOfPage, ordered steps', () => {
    const result = getDeepSectionsHowToSchemas({
      pageUrl,
      sections: [{ id: 'comp' }],
      overlayLookup: () => ({
        name: 'Comment choisir',
        description: 'Test desc',
        totalTime: 'PT20M',
        steps: [
          { name: 'Step A', text: 'A long enough description for step A content.' },
          { name: 'Step B', text: 'A long enough description for step B content.' },
          { name: 'Step C', text: 'A long enough description for step C content.' },
        ],
      }),
    })
    const schema = result[0]
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('HowTo')
    expect(schema.name).toBe('Comment choisir')
    expect(schema.totalTime).toBe('PT20M')
    const mainEntity = schema.mainEntityOfPage as Record<string, unknown>
    expect(mainEntity['@type']).toBe('WebPage')
    expect(mainEntity['@id']).toBe(pageUrl)
    const steps = schema.step as Array<Record<string, unknown>>
    expect(steps).toHaveLength(3)
    steps.forEach((s, i) => {
      expect(s['@type']).toBe('HowToStep')
      expect(s.position).toBe(i + 1)
      expect(s.url).toBe(`${pageUrl}#comp`)
    })
  })

  it('omits totalTime when overlay does not provide it', () => {
    const result = getDeepSectionsHowToSchemas({
      pageUrl,
      sections: [{ id: 'no-time' }],
      overlayLookup: () => ({
        name: 'X',
        description: 'Y',
        steps: [
          { name: 'S1', text: 'A long enough description for step S1 content.' },
          { name: 'S2', text: 'A long enough description for step S2 content.' },
          { name: 'S3', text: 'A long enough description for step S3 content.' },
        ],
      }),
    })
    expect(result[0].totalTime).toBeUndefined()
  })
})
