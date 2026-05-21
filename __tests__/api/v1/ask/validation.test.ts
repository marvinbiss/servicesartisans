/**
 * Tests — validateAskRequest (`src/app/api/v1/ask/_validation.ts`).
 *
 * Coverage : structural rejects (null / array / non-object), query rules
 * (required, non-empty, max length), classification enum, aidesContext
 * enum + range, citedSources max + per-entry shape, optional traceId /
 * agentName typing.
 */
import { describe, it, expect } from 'vitest'

import { validateAskRequest } from '@/app/api/v1/ask/_validation'

describe('validateAskRequest — structural', () => {
  it('rejects null body', () => {
    const r = validateAskRequest(null)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0].field).toBe('_body')
  })

  it('rejects non-object body (string)', () => {
    const r = validateAskRequest('not an object')
    expect(r.ok).toBe(false)
  })

  it('rejects arrays as body', () => {
    const r = validateAskRequest([])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0].field).toBe('_body')
  })

  it('rejects undefined body', () => {
    const r = validateAskRequest(undefined)
    expect(r.ok).toBe(false)
  })
})

describe('validateAskRequest — query', () => {
  it('rejects missing query field', () => {
    const r = validateAskRequest({})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'query')).toBe(true)
  })

  it('rejects empty string query', () => {
    const r = validateAskRequest({ query: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'query')).toBe(true)
  })

  it('rejects whitespace-only query', () => {
    const r = validateAskRequest({ query: '   \t\n  ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'query')).toBe(true)
  })

  it('rejects query > 4000 chars', () => {
    const r = validateAskRequest({ query: 'a'.repeat(4001) })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      const err = r.errors.find((e) => e.field === 'query')
      expect(err?.message).toContain('4000')
    }
  })

  it('accepts valid minimal {query}', () => {
    const r = validateAskRequest({
      query: 'Quel est le bareme MaPrimeRenov pour une PAC air/eau ?',
    })
    expect(r.ok).toBe(true)
  })

  it('accepts query exactly 4000 chars', () => {
    const r = validateAskRequest({ query: 'a'.repeat(4000) })
    expect(r.ok).toBe(true)
  })
})

describe('validateAskRequest — classification', () => {
  it('rejects invalid classification', () => {
    const r = validateAskRequest({ query: 'q', classification: 'unknown_class' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'classification')).toBe(true)
  })

  it('accepts ymyl_aides classification', () => {
    const r = validateAskRequest({ query: 'q', classification: 'ymyl_aides' })
    expect(r.ok).toBe(true)
  })

  it('accepts generic classification', () => {
    const r = validateAskRequest({ query: 'q', classification: 'generic' })
    expect(r.ok).toBe(true)
  })
})

describe('validateAskRequest — aidesContext', () => {
  it('rejects non-object aidesContext', () => {
    const r = validateAskRequest({ query: 'q', aidesContext: 'oops' })
    expect(r.ok).toBe(false)
  })

  it('rejects invalid geste', () => {
    const r = validateAskRequest({ query: 'q', aidesContext: { geste: 'invalid_geste' } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'aidesContext.geste')).toBe(true)
  })

  it('rejects negative rfr', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: { geste: 'pac_air_eau', rfr: -100 },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'aidesContext.rfr')).toBe(true)
  })

  it('rejects nbPersonnes = 0', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: { geste: 'pac_air_eau', nbPersonnes: 0 },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'aidesContext.nbPersonnes')).toBe(true)
  })

  it('rejects non-integer nbPersonnes', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: { geste: 'pac_air_eau', nbPersonnes: 2.5 },
    })
    expect(r.ok).toBe(false)
  })

  it('rejects invalid zone', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: { geste: 'pac_air_eau', zone: 'us_west' },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'aidesContext.zone')).toBe(true)
  })

  it('rejects invalid menageCategorie', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: { geste: 'pac_air_eau', menageCategorie: 'pauvre' },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field === 'aidesContext.menageCategorie')).toBe(true)
  })

  it('accepts full valid aidesContext', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: {
        geste: 'pac_air_eau',
        menageCategorie: 'tres_modeste',
        rfr: 12000,
        nbPersonnes: 3,
        zone: 'hors_idf',
      },
    })
    expect(r.ok).toBe(true)
  })

  it('accepts zone idf', () => {
    const r = validateAskRequest({
      query: 'q',
      aidesContext: { geste: 'pac_air_eau', zone: 'idf' },
    })
    expect(r.ok).toBe(true)
  })
})

describe('validateAskRequest — citedSources', () => {
  it('rejects non-array citedSources', () => {
    const r = validateAskRequest({ query: 'q', citedSources: 'not an array' })
    expect(r.ok).toBe(false)
  })

  it('rejects > 20 entries', () => {
    const r = validateAskRequest({
      query: 'q',
      citedSources: Array.from({ length: 21 }, (_, i) => ({
        url: `https://x.fr/${i}`,
        title: 't',
        retrievedAt: '2026-01-01',
      })),
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      const err = r.errors.find((e) => e.field === 'citedSources')
      expect(err?.message).toContain('20')
    }
  })

  it('rejects entry missing url', () => {
    const r = validateAskRequest({
      query: 'q',
      citedSources: [{ title: 't', retrievedAt: '2026-01-01' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.field.includes('citedSources[0].url'))).toBe(true)
  })

  it('accepts up to 20 valid entries', () => {
    const r = validateAskRequest({
      query: 'q',
      citedSources: Array.from({ length: 20 }, (_, i) => ({
        url: `https://x.fr/${i}`,
        title: `t${i}`,
        retrievedAt: '2026-01-01',
      })),
    })
    expect(r.ok).toBe(true)
  })
})

describe('validateAskRequest — optional fields', () => {
  it('rejects traceId non-string', () => {
    const r = validateAskRequest({ query: 'q', traceId: 42 })
    expect(r.ok).toBe(false)
  })

  it('rejects agentName non-string', () => {
    const r = validateAskRequest({ query: 'q', agentName: { foo: 'bar' } })
    expect(r.ok).toBe(false)
  })

  it('accepts full valid body', () => {
    const r = validateAskRequest({
      query: 'Quel est le bareme MaPrimeRenov pour une PAC air/eau ?',
      classification: 'ymyl_aides',
      aidesContext: {
        geste: 'pac_air_eau',
        menageCategorie: 'modeste',
        rfr: 22000,
        nbPersonnes: 2,
        zone: 'idf',
      },
      citedSources: [
        {
          url: 'https://france-renov.gouv.fr/',
          title: 'France Rénov',
          retrievedAt: '2026-05-21',
        },
      ],
      traceId: 'trace-abc-123',
      agentName: 'doc-q-handler',
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.query).toContain('MaPrimeRenov')
  })

  it('aggregates multiple errors at once', () => {
    const r = validateAskRequest({
      query: '',
      classification: 'unknown',
      aidesContext: { geste: 'bad', rfr: -1, nbPersonnes: 0 },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(4)
  })
})
