/**
 * Tests — src/lib/critic/rubric.ts
 *
 * Pure scoring: deterministic, no LLM, no I/O. We exercise both the
 * passing paths (so we know `approve` ever reaches the LLM) and the
 * blocking paths (so we know the pre-LLM short-circuit ever fires).
 */

import { describe, it, expect } from 'vitest'
import {
  scoreSourcePresent,
  scoreMathCheck,
  scoreHallucinationRisk,
  combineRubricScores,
} from '@/lib/critic/rubric'

describe('scoreSourcePresent', () => {
  it('returns 1.0 when both URL and authoritative reference are present', () => {
    const r = scoreSourcePresent(
      '5000€ via MPR — source https://anah.gouv.fr/foo (ANAH décret 2026).'
    )
    expect(r.score).toBe(1.0)
    expect(r.reasons).toHaveLength(0)
  })

  it('returns 0.5 when reference is present without URL', () => {
    const r = scoreSourcePresent('5000€ via MPR selon barème ANAH')
    expect(r.score).toBe(0.5)
    expect(r.reasons.length).toBeGreaterThan(0)
    expect(r.reasons[0].severity).toBe('warn')
  })

  it('returns 0.0 when output has no source or reference, with block severity', () => {
    const r = scoreSourcePresent('5000€ pour ta pompe à chaleur, va y direct.')
    expect(r.score).toBe(0)
    expect(r.reasons[0].severity).toBe('block')
    expect(r.reasons[0].dimension).toBe('source_present')
  })

  it('detects French rénov spelling variants (France Rénov)', () => {
    const r = scoreSourcePresent("Selon France Rénov, l'aide est calculée par ménage.")
    expect(r.score).toBeGreaterThanOrEqual(0.5)
  })

  it('detects Légifrance with accent', () => {
    const r = scoreSourcePresent('Voir Légifrance article L. 232-1.')
    expect(r.score).toBeGreaterThanOrEqual(0.5)
  })
})

describe('scoreMathCheck', () => {
  it('passes correct additions', () => {
    const r = scoreMathCheck('1000€ + 2000€ = 3000€ au total.')
    expect(r.score).toBe(1.0)
    expect(r.reasons).toHaveLength(0)
  })

  it('blocks on a wrong addition', () => {
    const r = scoreMathCheck('1000€ + 2000€ = 5000€ au total.')
    expect(r.score).toBe(0)
    expect(r.reasons[0].severity).toBe('block')
    expect(r.reasons[0].dimension).toBe('math_check')
    expect(r.reasons[0].evidence).toContain('5000')
  })

  it('returns 1.0 for outputs without arithmetic expressions', () => {
    const r = scoreMathCheck('Pas de chiffres ici.')
    expect(r.score).toBe(1.0)
  })

  it('detects multiple wrong additions in the same output', () => {
    const r = scoreMathCheck('1+1=3. 2+2=5.')
    expect(r.score).toBe(0)
    expect(r.reasons.length).toBeGreaterThanOrEqual(2)
  })
})

describe('scoreHallucinationRisk', () => {
  it('blocks on "100 % de prise en charge"', () => {
    const r = scoreHallucinationRisk('Bénéficiez de 100% de prise en charge avec MPR.')
    expect(r.score).toBe(0)
    expect(r.reasons[0].severity).toBe('block')
    expect(r.reasons[0].dimension).toBe('hallucination_risk')
  })

  it('blocks on "aide illimitée"', () => {
    const r = scoreHallucinationRisk('Aide illimitée pour les passoires thermiques.')
    expect(r.score).toBe(0)
  })

  it('blocks on "sans plafond"', () => {
    const r = scoreHallucinationRisk('Cumul sans plafond, profitez-en.')
    expect(r.score).toBe(0)
  })

  it('blocks on "intégralement remboursé"', () => {
    const r = scoreHallucinationRisk('Votre PAC sera intégralement remboursée par MPR.')
    expect(r.score).toBe(0)
  })

  it('passes safe phrasing referencing a bareme', () => {
    const r = scoreHallucinationRisk('5000€ remboursé selon barème 2026.')
    expect(r.score).toBe(1.0)
    expect(r.reasons).toHaveLength(0)
  })
})

describe('combineRubricScores', () => {
  it('returns 0 overall + blockingReasons populated when any score has a block reason', () => {
    const combined = combineRubricScores([
      scoreSourcePresent('Pas de source.'),
      scoreMathCheck('1+1=2'),
      scoreHallucinationRisk('100% de prise en charge.'),
    ])
    expect(combined.overallScore).toBe(0)
    expect(combined.blockingReasons.length).toBeGreaterThanOrEqual(1)
  })

  it('averages scores when all pass', () => {
    const combined = combineRubricScores([
      scoreSourcePresent('https://anah.gouv.fr — décret 2026.'),
      scoreMathCheck('1+1=2'),
      scoreHallucinationRisk('Selon barème.'),
    ])
    expect(combined.overallScore).toBe(1)
    expect(combined.blockingReasons).toHaveLength(0)
  })

  it('handles empty score array deterministically (0 overall, empty reasons)', () => {
    const combined = combineRubricScores([])
    expect(combined.overallScore).toBe(0)
    expect(combined.blockingReasons).toHaveLength(0)
    expect(combined.allReasons).toHaveLength(0)
  })

  it('exposes all warn-level reasons in allReasons even when not blocking', () => {
    const combined = combineRubricScores([
      scoreSourcePresent('Selon ANAH, voici la réponse.'),
      scoreMathCheck('1+1=2'),
      scoreHallucinationRisk('selon barème'),
    ])
    expect(combined.blockingReasons).toHaveLength(0)
    expect(combined.allReasons.length).toBeGreaterThanOrEqual(1)
    expect(combined.allReasons[0].severity).toBe('warn')
  })
})
