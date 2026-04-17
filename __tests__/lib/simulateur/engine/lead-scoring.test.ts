import { describe, it, expect } from 'vitest'
import { computeLeadScore, type LeadScoringInput } from '@/lib/simulateur/engine/lead-scoring'

function makeInput(overrides: Partial<LeadScoringInput> = {}): LeadScoringInput {
  return {
    equipementActuel: 'gaz',
    categorieAnah: 'violet',
    parcours: 'geste',
    totalAidesHaut: 5_000,
    confidenceLevel: 'medium',
    uncertaintyDiscount: 0,
    urgenceProjet: null,
    ageChaudiere: null,
    ...overrides,
  }
}

describe('computeLeadScore', () => {
  it('returns score between 0 and 100', () => {
    const result = computeLeadScore(makeInput())
    expect(result.leadScore).toBeGreaterThanOrEqual(0)
    expect(result.leadScore).toBeLessThanOrEqual(100)
  })

  it('returns a valid segment', () => {
    const result = computeLeadScore(makeInput())
    expect(['hot', 'warm', 'cold']).toContain(result.leadSegment)
  })

  it('fioul gives a significant bonus', () => {
    const base = computeLeadScore(makeInput({ equipementActuel: 'gaz' }))
    const fioul = computeLeadScore(makeInput({ equipementActuel: 'fioul' }))
    expect(fioul.leadScore - base.leadScore).toBe(15)
  })

  it('bleu ANAH scores higher than rose', () => {
    const bleu = computeLeadScore(makeInput({ categorieAnah: 'bleu' }))
    const rose = computeLeadScore(makeInput({ categorieAnah: 'rose' }))
    expect(bleu.leadScore).toBeGreaterThan(rose.leadScore)
  })

  it('parcours accompagné scores higher than geste', () => {
    const accompagne = computeLeadScore(makeInput({ parcours: 'accompagne' }))
    const geste = computeLeadScore(makeInput({ parcours: 'geste' }))
    expect(accompagne.leadScore).toBeGreaterThan(geste.leadScore)
  })

  it('high aides give bonus over low aides', () => {
    const high = computeLeadScore(makeInput({ totalAidesHaut: 25_000 }))
    const low = computeLeadScore(makeInput({ totalAidesHaut: 1_000 }))
    expect(high.leadScore).toBeGreaterThan(low.leadScore)
  })

  it('high confidence gives bonus over low confidence', () => {
    const high = computeLeadScore(makeInput({ confidenceLevel: 'high' }))
    const low = computeLeadScore(makeInput({ confidenceLevel: 'low' }))
    expect(high.leadScore).toBeGreaterThan(low.leadScore)
  })

  it('high uncertainty gives malus', () => {
    const clean = computeLeadScore(makeInput({ uncertaintyDiscount: 0 }))
    const uncertain = computeLeadScore(makeInput({ uncertaintyDiscount: 0.35 }))
    expect(uncertain.leadScore).toBeLessThan(clean.leadScore)
  })

  // Phase 2 — urgence projet
  it('urgent_panne gives large bonus over je_me_renseigne', () => {
    const urgent = computeLeadScore(makeInput({ urgenceProjet: 'urgent_panne' }))
    const renseigne = computeLeadScore(makeInput({ urgenceProjet: 'je_me_renseigne' }))
    expect(urgent.leadScore - renseigne.leadScore).toBe(35)
  })

  it('sous_3_mois scores higher than sous_6_mois', () => {
    const trois = computeLeadScore(makeInput({ urgenceProjet: 'sous_3_mois' }))
    const six = computeLeadScore(makeInput({ urgenceProjet: 'sous_6_mois' }))
    expect(trois.leadScore).toBeGreaterThan(six.leadScore)
  })

  it('je_me_renseigne gives malus', () => {
    const noUrgence = computeLeadScore(makeInput({ urgenceProjet: null }))
    const renseigne = computeLeadScore(makeInput({ urgenceProjet: 'je_me_renseigne' }))
    expect(renseigne.leadScore).toBeLessThan(noUrgence.leadScore)
  })

  // Phase 2 — âge chaudière
  it('en_panne chaudière gives large bonus', () => {
    const panne = computeLeadScore(makeInput({ ageChaudiere: 'en_panne' }))
    const neuve = computeLeadScore(makeInput({ ageChaudiere: 'moins_5_ans' }))
    expect(panne.leadScore - neuve.leadScore).toBe(25)
  })

  it('plus_15_ans scores higher than 5_10_ans', () => {
    const vieille = computeLeadScore(makeInput({ ageChaudiere: 'plus_15_ans' }))
    const ok = computeLeadScore(makeInput({ ageChaudiere: '5_10_ans' }))
    expect(vieille.leadScore).toBeGreaterThan(ok.leadScore)
  })

  it('null urgence and ageChaudiere add no bonus', () => {
    const base = computeLeadScore(makeInput({ urgenceProjet: null, ageChaudiere: null }))
    const explicit = computeLeadScore(makeInput({ urgenceProjet: undefined, ageChaudiere: undefined }))
    expect(base.leadScore).toBe(explicit.leadScore)
  })

  // Composite — max and min
  it('maximum lead is HOT: urgent + en_panne + fioul + bleu + accompagné + 25k aides + high conf', () => {
    const result = computeLeadScore(makeInput({
      urgenceProjet: 'urgent_panne',
      ageChaudiere: 'en_panne',
      equipementActuel: 'fioul',
      categorieAnah: 'bleu',
      parcours: 'accompagne',
      totalAidesHaut: 25_000,
      confidenceLevel: 'high',
      uncertaintyDiscount: 0,
    }))
    expect(result.leadScore).toBe(100)
    expect(result.leadSegment).toBe('hot')
  })

  it('minimum lead is COLD: je_me_renseigne + moins_5_ans + rose + geste + low aides + low conf + uncertainty', () => {
    const result = computeLeadScore(makeInput({
      urgenceProjet: 'je_me_renseigne',
      ageChaudiere: 'moins_5_ans',
      equipementActuel: 'autre',
      categorieAnah: 'rose',
      parcours: 'geste',
      totalAidesHaut: 500,
      confidenceLevel: 'low',
      uncertaintyDiscount: 0.35,
    }))
    expect(result.leadScore).toBeLessThan(20)
    expect(result.leadSegment).toBe('cold')
  })

  it('segment thresholds: >=70 hot, 40-69 warm, <40 cold', () => {
    const hot = computeLeadScore(makeInput({
      urgenceProjet: 'urgent_panne',
      ageChaudiere: 'en_panne',
      equipementActuel: 'fioul',
      categorieAnah: 'bleu',
      parcours: 'accompagne',
      totalAidesHaut: 20_000,
      confidenceLevel: 'high',
    }))
    expect(hot.leadSegment).toBe('hot')

    const cold = computeLeadScore(makeInput({
      urgenceProjet: 'je_me_renseigne',
      equipementActuel: 'autre',
      categorieAnah: 'rose',
      parcours: 'geste',
      totalAidesHaut: 1_000,
      confidenceLevel: 'low',
      uncertaintyDiscount: 0.35,
    }))
    expect(cold.leadSegment).toBe('cold')
  })

  it('score never goes below 0', () => {
    const result = computeLeadScore(makeInput({
      urgenceProjet: 'je_me_renseigne',
      ageChaudiere: 'moins_5_ans',
      equipementActuel: 'autre',
      categorieAnah: 'rose',
      parcours: 'geste',
      totalAidesHaut: 0,
      confidenceLevel: 'low',
      uncertaintyDiscount: 0.40,
    }))
    expect(result.leadScore).toBeGreaterThanOrEqual(0)
  })

  it('score never exceeds 100', () => {
    const result = computeLeadScore(makeInput({
      urgenceProjet: 'urgent_panne',
      ageChaudiere: 'en_panne',
      equipementActuel: 'fioul',
      categorieAnah: 'bleu',
      parcours: 'accompagne',
      totalAidesHaut: 100_000,
      confidenceLevel: 'high',
      uncertaintyDiscount: 0,
    }))
    expect(result.leadScore).toBeLessThanOrEqual(100)
  })

  // Urgence is the strongest signal
  it('urgence has more weight than aides or categorie', () => {
    const urgentPoor = computeLeadScore(makeInput({
      urgenceProjet: 'urgent_panne',
      categorieAnah: 'rose',
      totalAidesHaut: 1_000,
    }))
    const calmRich = computeLeadScore(makeInput({
      urgenceProjet: 'je_me_renseigne',
      categorieAnah: 'bleu',
      totalAidesHaut: 25_000,
    }))
    expect(urgentPoor.leadScore).toBeGreaterThan(calmRich.leadScore)
  })
})
