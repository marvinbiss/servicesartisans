/**
 * Tests — src/lib/answer-engine/context-builder.ts
 *
 * Pure tests, no mocks: the builder calls into the real deterministic
 * MaPrimeRénov calculator (Ralph 12) on purpose so a regression there
 * surfaces here too. Verified figures come from the same source-of-truth
 * Ralph 7 gold cases that bareme-mpr-2026.test.ts exercises.
 */

import { describe, it, expect } from 'vitest'
import { buildGroundTruthBlock } from '@/lib/answer-engine/context-builder'
import type { AnswerRequest } from '@/lib/answer-engine/types'

function reqWith(aidesContext?: AnswerRequest['aidesContext']): AnswerRequest {
  return {
    query: 'Combien pour une PAC air/eau ?',
    aidesContext,
  }
}

describe('buildGroundTruthBlock — aidesContext absent', () => {
  it('returns injected:false when aidesContext is undefined', () => {
    const block = buildGroundTruthBlock({ query: 'hello' })
    expect(block.injected).toBe(false)
    expect(block.systemSegment).toBe('')
    expect(block.detail).toBeUndefined()
  })
})

describe('buildGroundTruthBlock — full params (eligible case)', () => {
  it('injects ground-truth for PAC air/eau très modeste (5000 EUR)', () => {
    const block = buildGroundTruthBlock(
      reqWith({
        geste: 'pac_air_eau',
        rfr: 15_000,
        nbPersonnes: 2,
        zone: 'hors_idf',
      })
    )
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('GROUND TRUTH')
    expect(block.systemSegment).toContain('5000EUR')
    expect(block.systemSegment).toContain('pac_air_eau')
    expect(block.systemSegment).toContain('tres_modeste')
    expect(block.systemSegment).toContain('anah.gouv.fr')
    expect(block.detail).toContain('5000')
  })

  it('injects ground-truth for ITE intermédiaire hors IDF', () => {
    const block = buildGroundTruthBlock(
      reqWith({
        geste: 'isolation_ite',
        rfr: 40_000,
        nbPersonnes: 3,
        zone: 'hors_idf',
      })
    )
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('isolation_ite')
    expect(block.detail).toBeDefined()
  })
})

describe('buildGroundTruthBlock — full params (non-eligible cases)', () => {
  it('injects non-eligibility for pac_air_air (MPR exclu)', () => {
    const block = buildGroundTruthBlock(
      reqWith({
        geste: 'pac_air_air',
        rfr: 15_000,
        nbPersonnes: 2,
        zone: 'hors_idf',
      })
    )
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('non éligible')
    expect(block.detail).toContain('non éligible')
  })

  it('injects non-eligibility when RFR puts ménage in supérieur (excluded)', () => {
    const block = buildGroundTruthBlock(
      reqWith({
        geste: 'pac_air_eau',
        rfr: 250_000,
        nbPersonnes: 2,
        zone: 'hors_idf',
      })
    )
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('non éligible')
    expect(block.systemSegment).toContain('superieur')
  })
})

describe('buildGroundTruthBlock — partial context', () => {
  it('falls back to partial-context when rfr missing', () => {
    const block = buildGroundTruthBlock(
      reqWith({
        geste: 'pac_air_eau',
        nbPersonnes: 2,
        zone: 'hors_idf',
      })
    )
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('CONTEXTE PARTIEL')
    expect(block.systemSegment).toContain('pac_air_eau')
    expect(block.systemSegment).toContain('anah.gouv.fr')
    expect(block.detail).toContain('partial-context')
  })

  it('falls back to partial-context with only menageCategorie hint', () => {
    const block = buildGroundTruthBlock(
      reqWith({
        geste: 'isolation_combles',
        menageCategorie: 'modeste',
      })
    )
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('CONTEXTE PARTIEL')
    expect(block.systemSegment).toContain('isolation_combles')
  })

  it('falls back to partial-context with only zone hint', () => {
    const block = buildGroundTruthBlock(reqWith({ geste: 'vmc_double_flux', zone: 'idf' }))
    expect(block.injected).toBe(true)
    expect(block.systemSegment).toContain('CONTEXTE PARTIEL')
  })
})

describe('buildGroundTruthBlock — geste alone', () => {
  it('returns injected:false when only geste is provided (not enough signal)', () => {
    const block = buildGroundTruthBlock(reqWith({ geste: 'pac_air_eau' }))
    expect(block.injected).toBe(false)
    expect(block.systemSegment).toBe('')
  })
})
