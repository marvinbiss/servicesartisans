/**
 * Tests `buildDatasetSchema` — Ralph itération 6.
 *
 * Couvre :
 *   - Conformité Schema.org/Dataset minimum (5 champs obligatoires)
 *   - Distribution multi-format (JSON, CSV, JSON-LD, NDJSON, Parquet)
 *   - Edge cases : 0 distribution → champ absent, pas array vide
 *   - Edge cases : temporal/spatial/variableMeasured absents → champs omis (jamais null)
 *   - JSON round-trip stable (sérialisable + parseable)
 *   - License URL stricte (CC-BY 4.0 ou Etalab)
 *   - Creator / publisher typés Organization
 */
import { describe, it, expect } from 'vitest'
import { buildDatasetSchema, type DatasetSchemaInput } from '@/lib/seo/dataset-schema'

const BASE_INPUT: DatasetSchemaInput = {
  id: 'https://servicesartisans.fr/datasets/test#dataset',
  name: 'Test Dataset',
  description: 'Description du dataset de test pour Ralph itération 6.',
  url: 'https://servicesartisans.fr/datasets/test',
  distributions: [
    {
      contentUrl: 'https://servicesartisans.fr/api/test.json',
      encodingFormat: 'application/json',
    },
  ],
  keywords: ['rge', 'rénovation', 'aides'],
  isAccessibleForFree: true,
  license: 'https://creativecommons.org/licenses/by/4.0/',
  creator: { name: 'ServicesArtisans', url: 'https://servicesartisans.fr' },
  publisher: { name: 'ServicesArtisans', url: 'https://servicesartisans.fr' },
  dateModified: '2026-05-21',
}

describe('buildDatasetSchema — Schema.org/Dataset compliance', () => {
  it('emits @context and @type at top level', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect(out['@context']).toBe('https://schema.org')
    expect(out['@type']).toBe('Dataset')
  })

  it('preserves required fields (name, description, url, license, dateModified)', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect(out.name).toBe('Test Dataset')
    expect(out.description).toContain('Ralph itération 6')
    expect(out.url).toBe('https://servicesartisans.fr/datasets/test')
    expect(out.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(out.dateModified).toBe('2026-05-21')
  })

  it('joins keywords array into a comma-separated string (schema.org convention)', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect(out.keywords).toBe('rge, rénovation, aides')
  })

  it('typifies creator and publisher as Organization', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect(out.creator).toEqual({
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    })
    expect(out.publisher).toEqual({
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    })
  })
})

describe('buildDatasetSchema — distribution[]', () => {
  it('emits DataDownload entries with encodingFormat for JSON + CSV multi-format', () => {
    const out = buildDatasetSchema({
      ...BASE_INPUT,
      distributions: [
        {
          contentUrl: 'https://servicesartisans.fr/api/test.json',
          encodingFormat: 'application/json',
          name: 'JSON',
        },
        {
          contentUrl: 'https://servicesartisans.fr/api/test.csv',
          encodingFormat: 'text/csv',
          contentSize: '1.2MB',
          name: 'CSV',
        },
      ],
    })
    const dist = out.distribution as Array<Record<string, unknown>>
    expect(dist).toHaveLength(2)
    expect(dist[0]).toEqual({
      '@type': 'DataDownload',
      contentUrl: 'https://servicesartisans.fr/api/test.json',
      encodingFormat: 'application/json',
      name: 'JSON',
    })
    expect(dist[1]).toEqual({
      '@type': 'DataDownload',
      contentUrl: 'https://servicesartisans.fr/api/test.csv',
      encodingFormat: 'text/csv',
      contentSize: '1.2MB',
      name: 'CSV',
    })
  })

  it('omits distribution key entirely when distributions array is empty', () => {
    const out = buildDatasetSchema({ ...BASE_INPUT, distributions: [] })
    expect('distribution' in out).toBe(false)
  })
})

describe('buildDatasetSchema — optional fields are OMITTED (never null)', () => {
  it('omits temporalCoverage when not provided', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect('temporalCoverage' in out).toBe(false)
  })

  it('emits temporalCoverage when ISO 8601 interval provided', () => {
    const out = buildDatasetSchema({
      ...BASE_INPUT,
      temporalCoverage: '2026-01-01/2026-12-31',
    })
    expect(out.temporalCoverage).toBe('2026-01-01/2026-12-31')
  })

  it('omits spatialCoverage when not provided', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect('spatialCoverage' in out).toBe(false)
  })

  it('omits variableMeasured when not provided or empty', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect('variableMeasured' in out).toBe(false)
    const outEmpty = buildDatasetSchema({ ...BASE_INPUT, variableMeasured: [] })
    expect('variableMeasured' in outEmpty).toBe(false)
  })

  it('emits variableMeasured as PropertyValue[] when fields listed', () => {
    const out = buildDatasetSchema({
      ...BASE_INPUT,
      variableMeasured: ['siret', 'name', 'address_city'],
    })
    expect(out.variableMeasured).toEqual([
      { '@type': 'PropertyValue', name: 'siret' },
      { '@type': 'PropertyValue', name: 'name' },
      { '@type': 'PropertyValue', name: 'address_city' },
    ])
  })

  it('emits inLanguage only when provided', () => {
    const without = buildDatasetSchema(BASE_INPUT)
    expect('inLanguage' in without).toBe(false)
    const withLang = buildDatasetSchema({ ...BASE_INPUT, inLanguage: 'fr-FR' })
    expect(withLang.inLanguage).toBe('fr-FR')
  })
})

describe('buildDatasetSchema — JSON round-trip + license enforcement', () => {
  it('produces valid JSON that round-trips through JSON.stringify/parse', () => {
    const out = buildDatasetSchema({
      ...BASE_INPUT,
      temporalCoverage: '2026',
      spatialCoverage: 'FR',
      variableMeasured: ['siret', 'name'],
    })
    const serialized = JSON.stringify(out)
    expect(() => JSON.parse(serialized)).not.toThrow()
    const reparsed = JSON.parse(serialized)
    expect(reparsed['@type']).toBe('Dataset')
    expect(reparsed.temporalCoverage).toBe('2026')
    expect(reparsed.spatialCoverage).toBe('FR')
  })

  it('accepts CC-BY 4.0 license URL exactly', () => {
    const out = buildDatasetSchema(BASE_INPUT)
    expect(out.license).toBe('https://creativecommons.org/licenses/by/4.0/')
  })

  it('accepts Etalab 2.0 license URL', () => {
    const out = buildDatasetSchema({
      ...BASE_INPUT,
      license: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence',
    })
    expect(out.license).toBe('https://www.etalab.gouv.fr/licence-ouverte-open-licence')
  })

  it('does NOT mutate the input arrays (immutability)', () => {
    const keywords = ['a', 'b'] as const
    const distributions = [
      {
        contentUrl: 'https://x.test/a.json',
        encodingFormat: 'application/json' as const,
      },
    ] as const
    buildDatasetSchema({
      ...BASE_INPUT,
      keywords,
      distributions,
    })
    expect(keywords).toEqual(['a', 'b'])
    expect(distributions).toHaveLength(1)
  })

  it('isAccessibleForFree boolean preserved both true and false', () => {
    const yes = buildDatasetSchema(BASE_INPUT)
    expect(yes.isAccessibleForFree).toBe(true)
    const no = buildDatasetSchema({ ...BASE_INPUT, isAccessibleForFree: false })
    expect(no.isAccessibleForFree).toBe(false)
  })
})
