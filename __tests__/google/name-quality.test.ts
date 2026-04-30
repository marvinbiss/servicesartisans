/**
 * Tests unitaires pour le module name-quality utilisé par
 * `scripts/audit-google-places-eligibility.ts` (preflight Google Places).
 *
 * Pure logique déterministe — pas de mocks DB / Next.js requis.
 */
import { describe, it, expect } from 'vitest'

import {
  classifyProviderConfidence,
  estimateBackfillCostUsd,
  estimateMatchRate,
  extractDistinctiveTokens,
  normalizeProviderName,
} from '@/lib/google/name-quality'

describe('normalizeProviderName', () => {
  it('strips accents, casing, ponctuation, formes juridiques', () => {
    expect(normalizeProviderName('SARL Plomberie Dupont & Fils (95)')).toBe('plomberie dupont fils')
  })

  it('vide les chaînes 100% formes juridiques + ponctuation', () => {
    expect(normalizeProviderName('SAS Etablissements (M.)')).toBe('')
  })

  it('gère les noms en MAJUSCULES avec ponctuation diverse (accents + tirets)', () => {
    // NB : la regex LEGAL_FORMS_RE attend `m\.` collé à un word boundary qui
    // suit la ponctuation. Quand le `.` est suivi d'un espace (`M. JEAN`),
    // `\b` après `\.` ne trouve pas de boundary → le `m` reste en sortie.
    // C'est aligné avec `enrich-google-all.ts` original (cohérence des stats).
    const out = normalizeProviderName('M. JEAN-PIERRE LEROY ÉLECTRICITÉ')
    expect(out).toContain('jean pierre leroy electricite')
    expect(out).not.toContain('é')
  })
})

describe('extractDistinctiveTokens', () => {
  it('exclut les stop-words métier génériques', () => {
    const t = extractDistinctiveTokens('SARL Plomberie Chauffage Dupont Pro')
    expect(t).toEqual(['dupont'])
  })

  it('exclut les tokens purement numériques (CP, n° voie)', () => {
    const t = extractDistinctiveTokens('Maçonnerie 95 Lefevre 42')
    expect(t).toEqual(['lefevre'])
  })

  it('retourne plusieurs tokens si nom riche', () => {
    const t = extractDistinctiveTokens('Couverture Bertrand & Associés Toulouse Sud')
    expect(t).toContain('bertrand')
    expect(t).toContain('associes')
    expect(t).toContain('toulouse')
    expect(t).not.toContain('couverture')
    expect(t).not.toContain('sud')
  })

  it('retourne [] pour un nom 100% générique', () => {
    expect(extractDistinctiveTokens('Entreprise Generale Batiment Pro Plus')).toEqual([])
  })
})

describe('classifyProviderConfidence', () => {
  it('skip si SIRET absent', () => {
    expect(
      classifyProviderConfidence({ name: 'Dupont SARL', siret: null, postalCode: '75001' })
    ).toBe('skip')
  })

  it('skip si SIRET mal formé (13 chiffres)', () => {
    expect(
      classifyProviderConfidence({
        name: 'Dupont SARL',
        siret: '1234567890123',
        postalCode: '75001',
      })
    ).toBe('skip')
  })

  it('high si ≥2 tokens distinctifs + SIRET valide + CP valide', () => {
    expect(
      classifyProviderConfidence({
        name: 'Couverture Bertrand Associés',
        siret: '12345678901234',
        postalCode: '31000',
      })
    ).toBe('high')
  })

  it('medium si 1 token distinctif + CP', () => {
    expect(
      classifyProviderConfidence({
        name: 'Plomberie Dupont',
        siret: '12345678901234',
        postalCode: '75001',
      })
    ).toBe('medium')
  })

  it('medium si ≥2 tokens distinctifs sans CP', () => {
    expect(
      classifyProviderConfidence({
        name: 'Couverture Bertrand Associés',
        siret: '12345678901234',
        postalCode: null,
      })
    ).toBe('medium')
  })

  it('low si nom 100% générique même avec SIRET + CP', () => {
    expect(
      classifyProviderConfidence({
        name: 'Entreprise Generale Batiment',
        siret: '12345678901234',
        postalCode: '75001',
      })
    ).toBe('low')
  })

  it('low si 1 token + pas de CP', () => {
    expect(
      classifyProviderConfidence({
        name: 'Plomberie Dupont',
        siret: '12345678901234',
        postalCode: null,
      })
    ).toBe('low')
  })

  it('rejette CP non-français (4 chiffres)', () => {
    expect(
      classifyProviderConfidence({
        name: 'Couverture Bertrand Associés',
        siret: '12345678901234',
        postalCode: '7500',
      })
    ).toBe('medium')
  })
})

describe('estimateBackfillCostUsd', () => {
  it('compte high + medium + low (skip exclu)', () => {
    const cost = estimateBackfillCostUsd({ high: 1000, medium: 500, low: 200, skip: 5000 })
    expect(cost).toBeCloseTo(1700 * 0.032, 2)
  })

  it('retourne 0 si tous skip', () => {
    expect(estimateBackfillCostUsd({ high: 0, medium: 0, low: 0, skip: 10000 })).toBe(0)
  })

  it('arrondit au cent près', () => {
    const cost = estimateBackfillCostUsd({ high: 1, medium: 0, low: 0, skip: 0 })
    expect(cost).toBe(0.03)
  })
})

describe('estimateMatchRate', () => {
  it('100% high → ~90%', () => {
    expect(estimateMatchRate({ high: 100, medium: 0, low: 0, skip: 0 })).toBeCloseTo(0.9, 2)
  })

  it('100% low → ~20%', () => {
    expect(estimateMatchRate({ high: 0, medium: 0, low: 100, skip: 0 })).toBeCloseTo(0.2, 2)
  })

  it('mix proportionnel : 50/50 high/low', () => {
    expect(estimateMatchRate({ high: 50, medium: 0, low: 50, skip: 0 })).toBeCloseTo(0.55, 2)
  })

  it('retourne 0 si callable=0', () => {
    expect(estimateMatchRate({ high: 0, medium: 0, low: 0, skip: 100 })).toBe(0)
  })
})
