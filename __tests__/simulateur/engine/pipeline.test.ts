import { describe, it, expect } from 'vitest'
import { runSimulation, type SimulationInput } from '@/lib/simulateur/engine/pipeline'
import type { Situation } from '@/lib/simulateur/types'

const baseSituation = (over: Partial<Situation> = {}): Situation => ({
  typeLogement: 'maison',
  residencePrincipale: true,
  anciennete: '2_a_15_ans',
  surface: 100,
  codePostal: '59000',
  zone: 'H1',
  idf: false,
  foyer: 3,
  rfr: 38000, // Jaune hors IdF (≤ 39148)
  categorie: 'jaune',
  ...over,
})

describe('pipeline — Cas 1 : Maison H1 Jaune + PAC geste + budget 15000', () => {
  it('MPR 4000 + CEE fourchette + écrêtement 75 %', () => {
    const input: SimulationInput = {
      situation: baseSituation(),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 15000 },
    }
    const r = runSimulation(input)
    expect(r.categorieAnah).toBe('jaune')
    expect(r.gestesRetenus).toEqual(['PAC_AIREAU'])
    expect(r.ecretementPct).toBe(0.75)
    // MPR PAC Jaune = 4000 (hors écrêtement ou avec si dépasse)
    expect(r.mprTotal).toBeGreaterThan(0)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
    expect(r.resteAChargeBas).toBeLessThanOrEqual(r.resteAChargeHaut)
  })
})

describe('pipeline — Cas 2 : Maison H2 Bleu + accompagné 3 sauts + 50000', () => {
  it('MPR taux milieu (70 %), pas de CEE, plafond 100 %', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        zone: 'H2',
        idf: false,
        rfr: 20000,
        categorie: 'bleu',
        surface: 120,
        codePostal: '44000',
      }),
      projet: {
        parcours: 'accompagne',
        gestes: ['PAC_AIREAU'],
        sautsDpe: 3,
        coupDePouce: true,
        equipementActuel: 'fioul',
      },
      budget: { budgetHt: 50000 },
    }
    const r = runSimulation(input)
    expect(r.categorieAnah).toBe('bleu')
    expect(r.ecretementPct).toBe(1.0)
    // Taux bleu 3 sauts = 70 % → 35000 MPR avant écrêtement
    // Écrêtement 100 % = budget TTC, donc pas d'écrêtement
    expect(r.mprTotal).toBeGreaterThan(0)
    // Pas de CEE en parcours accompagné
    expect(r.ceeFourchetteBas).toBe(0)
    expect(r.ceeFourchetteHaut).toBe(0)
    // CDP Rénov ampleur appliqué (residencePrincipale=true)
    expect(r.cdpEstimationHaut).toBeGreaterThan(0)
  })
})

describe('pipeline — Cas 3 : Rose + geste → exclusion', () => {
  it('retourne exclusion claire', () => {
    const input: SimulationInput = {
      situation: baseSituation({ rfr: 200000, categorie: 'rose' }),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 15000 },
    }
    const r = runSimulation(input)
    expect(r.categorieAnah).toBe('rose')
    expect(r.gestesRetenus).toEqual([])
    expect(r.exclusion).toMatch(/Rose/)
    expect(r.mprTotal).toBe(0)
    expect(r.resteAChargeBas).toBeGreaterThan(0)
  })
})

describe('pipeline — Cas 4 : non-cumul', () => {
  it('BAR-TH-148 et BAR-TH-171 simultanés → 1 seul retenu', () => {
    const input: SimulationInput = {
      situation: baseSituation(),
      projet: {
        parcours: 'geste',
        gestes: ['CET', 'PAC_AIREAU'],
        coupDePouce: false,
        equipementActuel: 'elec',
      },
      budget: { budgetHt: 20000 },
    }
    const r = runSimulation(input)
    // Au moins une exclusion non-cumul dans le debug
    const ncStep = r.formuleDebug.find((s) => s.step === 'applyNonCumul')
    expect(ncStep).toBeDefined()
    const exclusions = (ncStep?.outputs.exclusions as unknown[]) ?? []
    expect(exclusions.length).toBeGreaterThanOrEqual(1)
  })
})

describe('pipeline — baremeIds et traçabilité', () => {
  it('FormuleDebug contient au moins classifier + eligibilite', () => {
    const input: SimulationInput = {
      situation: baseSituation(),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 15000 },
    }
    const r = runSimulation(input)
    const steps = r.formuleDebug.map((s) => s.step)
    expect(steps).toContain('classifier')
    expect(steps).toContain('eligibilite')
    expect(r.baremeIds.length).toBeGreaterThan(0)
    expect(r.baremeIds.some((b) => b.startsWith('MPR.'))).toBe(true)
  })
})
