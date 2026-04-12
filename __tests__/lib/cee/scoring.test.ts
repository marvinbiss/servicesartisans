/**
 * Tests unitaires — src/lib/cee/scoring.ts
 * ------------------------------------------
 * `computeCeeDossierScore` : calcul purement applicatif (pas de DB).
 * `extractScoreFromMetadata` : extraction depuis JSONB metadata.
 */

import { describe, it, expect } from 'vitest'
import {
  computeCeeDossierScore,
  extractScoreFromMetadata,
  type CeeDossierScoreInput,
} from '@/lib/cee/scoring'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInput(overrides: Partial<CeeDossierScoreInput> = {}): CeeDossierScoreInput {
  return {
    kwhcEstime: null,
    primeEstimeeEur: null,
    zoneClimatique: null,
    operationCode: 'BAR-TH-000',
    isPrecarite: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// computeCeeDossierScore
// ---------------------------------------------------------------------------

describe('computeCeeDossierScore', () => {
  it('dossier S-tier : gros kWhc, grosse prime, zone H1, PAC haute valeur, precarite', () => {
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 150_000,
        primeEstimeeEur: 3_000,
        zoneClimatique: 'H1',
        operationCode: 'BAR-TH-171',
        isPrecarite: true,
      })
    )
    // 40 (kWhc>100k) + 30 (prime>2k) + 10 (H1) + 10 (PAC) + 10 (preca) = 100
    expect(result.score).toBe(100)
    expect(result.tier).toBe('S')
    expect(result.factors.length).toBeGreaterThanOrEqual(4)
  })

  it('dossier C-tier : petit kWhc, petite prime, zone H3, operation standard', () => {
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 2_000,
        primeEstimeeEur: 100,
        zoneClimatique: 'H3',
        operationCode: 'BAR-TH-000',
        isPrecarite: false,
      })
    )
    // 5 (kWhc<=5000) + 5 (prime<=200) + 4 (H3) + 5 (standard) = 19
    expect(result.score).toBe(19)
    expect(result.tier).toBe('C')
  })

  it('dossier avec precarite bonus ajoute 10 points', () => {
    const base = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 10_000,
        primeEstimeeEur: 600,
        zoneClimatique: 'H2',
        operationCode: 'BAR-EN-101',
        isPrecarite: false,
      })
    )
    const withPreca = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 10_000,
        primeEstimeeEur: 600,
        zoneClimatique: 'H2',
        operationCode: 'BAR-EN-101',
        isPrecarite: true,
      })
    )
    expect(withPreca.score - base.score).toBe(10)
    expect(withPreca.factors).toContain('Menage precaire — cours CEE x2 (+10)')
  })

  it('score minimum : tous les champs au minimum donnent > 0 (fail-open plancher)', () => {
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: null,
        primeEstimeeEur: null,
        zoneClimatique: null,
        operationCode: 'UNKNOWN',
        isPrecarite: false,
      })
    )
    // 5 (kWhc inconnu) + 5 (prime inconnue) + 0 (zone inconnue) + 5 (standard) = 15
    expect(result.score).toBe(15)
    expect(result.tier).toBe('C')
  })

  it('score plafonne a 100 meme si les composantes depassent', () => {
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 200_000,
        primeEstimeeEur: 5_000,
        zoneClimatique: 'H1',
        operationCode: 'BAR-TH-171',
        isPrecarite: true,
      })
    )
    // 40 + 30 + 10 + 10 + 10 = 100 (pile, mais Math.min garantit le cap)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('tier S si score >= 80', () => {
    // 40 (kWhc>100k) + 30 (prime>2k) + 10 (H1) + 5 (standard) = 85
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 120_000,
        primeEstimeeEur: 2_500,
        zoneClimatique: 'H1',
        operationCode: 'BAR-TH-000',
        isPrecarite: false,
      })
    )
    expect(result.score).toBe(85)
    expect(result.tier).toBe('S')
  })

  it('tier A si score >= 60 et < 80', () => {
    // 30 (kWhc>50k) + 20 (prime>1k) + 7 (H2) + 5 (standard) = 62
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 60_000,
        primeEstimeeEur: 1_200,
        zoneClimatique: 'H2',
        operationCode: 'BAR-TH-000',
        isPrecarite: false,
      })
    )
    expect(result.score).toBe(62)
    expect(result.tier).toBe('A')
  })

  it('tier B si score >= 40 et < 60', () => {
    // 20 (kWhc>20k) + 10 (prime>200) + 7 (H2) + 5 (standard) = 42
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 25_000,
        primeEstimeeEur: 300,
        zoneClimatique: 'H2',
        operationCode: 'BAR-TH-000',
        isPrecarite: false,
      })
    )
    expect(result.score).toBe(42)
    expect(result.tier).toBe('B')
  })

  it('tier C si score < 40', () => {
    const result = computeCeeDossierScore(
      makeInput({
        kwhcEstime: 3_000,
        primeEstimeeEur: 150,
        zoneClimatique: 'H3',
        operationCode: 'BAR-TH-000',
        isPrecarite: false,
      })
    )
    // 5 + 5 + 4 + 5 = 19
    expect(result.score).toBeLessThan(40)
    expect(result.tier).toBe('C')
  })

  it('operations isolation (BAR-EN-10x) donnent 8 points', () => {
    for (const code of ['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103']) {
      const result = computeCeeDossierScore(makeInput({ operationCode: code }))
      // 5 + 5 + 0 + 8 = 18
      expect(result.score).toBe(18)
      expect(result.factors.some((f) => f.includes('isolation'))).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// extractScoreFromMetadata
// ---------------------------------------------------------------------------

describe('extractScoreFromMetadata', () => {
  it('extrait un score valide depuis metadata.priority_score', () => {
    const metadata = {
      priority_score: {
        score: 85,
        tier: 'S',
        factors: ['kWhc eleve', 'Zone H1'],
      },
    }
    const result = extractScoreFromMetadata(metadata)
    expect(result.score).toBe(85)
    expect(result.tier).toBe('S')
    expect(result.factors).toEqual(['kWhc eleve', 'Zone H1'])
  })

  it('retourne default score si metadata est null', () => {
    const result = extractScoreFromMetadata(null)
    expect(result.score).toBe(0)
    expect(result.tier).toBe('C')
    expect(result.factors).toEqual(['Scoring indisponible'])
  })

  it('retourne default score si metadata est undefined', () => {
    const result = extractScoreFromMetadata(undefined)
    expect(result.score).toBe(0)
    expect(result.tier).toBe('C')
    expect(result.factors).toEqual(['Scoring indisponible'])
  })

  it('retourne default score si metadata ne contient pas priority_score', () => {
    const result = extractScoreFromMetadata({ other_field: 42 })
    expect(result.score).toBe(0)
    expect(result.tier).toBe('C')
  })

  it('retourne default score si priority_score n est pas un objet', () => {
    const result = extractScoreFromMetadata({ priority_score: 'invalid' })
    expect(result.score).toBe(0)
    expect(result.tier).toBe('C')
  })

  it('gere un tier invalide en fallback C', () => {
    const metadata = {
      priority_score: {
        score: 50,
        tier: 'INVALID',
        factors: [],
      },
    }
    const result = extractScoreFromMetadata(metadata)
    expect(result.score).toBe(50)
    expect(result.tier).toBe('C')
  })

  it('gere un score non-numerique en fallback 0', () => {
    const metadata = {
      priority_score: {
        score: 'not-a-number',
        tier: 'A',
        factors: [],
      },
    }
    const result = extractScoreFromMetadata(metadata)
    expect(result.score).toBe(0)
    expect(result.tier).toBe('A')
  })
})
