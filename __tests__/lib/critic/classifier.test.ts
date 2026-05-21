/**
 * Tests — src/lib/critic/classifier.ts
 *
 * Pure function: no mocks needed. We exercise the cross product of
 * (classification × agentName × userQuery) signals that callers actually
 * encounter in production.
 */

import { describe, it, expect } from 'vitest'
import { isYMYL } from '@/lib/critic/classifier'

describe('isYMYL — classification hard rules', () => {
  it('classifies ymyl_aides as YMYL with default aide_amount sub-context', () => {
    const result = isYMYL({ classification: 'ymyl_aides' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('aide_amount')
  })

  it('classifies contract_legal as YMYL with legal_contract sub-context', () => {
    const result = isYMYL({ classification: 'contract_legal' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('legal_contract')
  })

  it('classifies critic_ymyl as YMYL (recursive critic of critic)', () => {
    const result = isYMYL({ classification: 'critic_ymyl', userQuery: 'éligibilité' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('aide_eligibility')
  })

  it('returns isYMYL=false for rag_public without agentName hint', () => {
    const result = isYMYL({ classification: 'rag_public' })
    expect(result.isYMYL).toBe(false)
    expect(result.context).toBeUndefined()
  })

  it('returns isYMYL=false for generic without agentName hint', () => {
    const result = isYMYL({ classification: 'generic' })
    expect(result.isYMYL).toBe(false)
  })
})

describe('isYMYL — agentName heuristics', () => {
  it('detects simulateur-aides-mpr as aide_amount', () => {
    const result = isYMYL({ classification: 'generic', agentName: 'simulateur-aides-mpr' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('aide_amount')
  })

  it('detects devis-estimator as devis_estimation', () => {
    const result = isYMYL({ classification: 'generic', agentName: 'devis-estimator' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('devis_estimation')
  })

  it('detects eligibilite-checker as aide_eligibility', () => {
    const result = isYMYL({ classification: 'generic', agentName: 'eligibilite-checker' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('aide_eligibility')
  })

  it('detects rge-qualif-verifier as rge_qualification', () => {
    const result = isYMYL({ classification: 'generic', agentName: 'rge-qualif-verifier' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('rge_qualification')
  })

  it('detects cee-mandataire agent as YMYL aide_amount', () => {
    const result = isYMYL({ classification: 'rag_public', agentName: 'cee-mandataire-bot' })
    expect(result.isYMYL).toBe(true)
    expect(result.context).toBe('aide_amount')
  })
})

describe('isYMYL — user query sub-context detection', () => {
  it('detects eligibility question via "Suis-je éligible"', () => {
    const result = isYMYL({
      classification: 'ymyl_aides',
      userQuery: 'Suis-je éligible à MaPrimeRénov ?',
    })
    expect(result.context).toBe('aide_eligibility')
  })

  it('detects plafond question via "plafond revenus"', () => {
    const result = isYMYL({
      classification: 'ymyl_aides',
      userQuery: 'Quel plafond de revenus modeste pour MPR ?',
    })
    expect(result.context).toBe('plafond_revenus')
  })

  it('detects amount question via "combien"', () => {
    const result = isYMYL({
      classification: 'ymyl_aides',
      userQuery: 'Combien pour une PAC air/eau ?',
    })
    expect(result.context).toBe('aide_amount')
  })

  it('detects cumul question as aide_amount', () => {
    const result = isYMYL({
      classification: 'ymyl_aides',
      userQuery: 'Puis-je cumuler MPR et CEE ?',
    })
    expect(result.context).toBe('aide_eligibility')
  })

  it('falls back to aide_amount when query is undefined', () => {
    const result = isYMYL({ classification: 'ymyl_aides' })
    expect(result.context).toBe('aide_amount')
  })
})
