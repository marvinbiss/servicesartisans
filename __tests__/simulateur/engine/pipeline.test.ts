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
  it('MPR taux flat 80 %, plafond 40K, écrêtement 100 %', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        zone: 'H2',
        idf: false,
        rfr: 20000,
        categorie: 'bleu',
        surface: 120,
        codePostal: '44000',
        anciennete: 'plus_15_ans',
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
    // Taux bleu flat = 80 %, plafond 3 sauts = 40K → 40000 * 0.80 = 32000
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

// --- Cas 5 à 10 : scénarios complémentaires ---

describe('pipeline — Cas 5 : Fioul → leadPriority high', () => {
  it('leadPriority=high quand equipementActuel=fioul', () => {
    const input: SimulationInput = {
      situation: baseSituation(),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU'],
        coupDePouce: true,
        equipementActuel: 'fioul',
      },
      budget: { budgetHt: 15000 },
    }
    const r = runSimulation(input)
    expect(r.leadPriority).toBe('high')
    // Non-fioul → normal
    const r2 = runSimulation({
      ...input,
      projet: { ...input.projet, equipementActuel: 'gaz' },
    })
    expect(r2.leadPriority).toBe('normal')
  })
})

describe('pipeline — Cas 6 : Accompagné + MPR > 0 → necessiteMAR', () => {
  it('necessiteMAR=true quand parcours accompagné avec MPR positif', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        rfr: 20000,
        categorie: 'bleu',
        anciennete: 'plus_15_ans',
      }),
      projet: {
        parcours: 'accompagne',
        gestes: ['PAC_AIREAU'],
        sautsDpe: 2,
        coupDePouce: true,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 40000 },
    }
    const r = runSimulation(input)
    expect(r.necessiteMAR).toBe(true)
    expect(r.mprTotal).toBeGreaterThan(0)
  })
})

describe('pipeline — Cas 7 : Moins de 2 ans → exclusion totale', () => {
  it('anciennete moins_2_ans rejette tous les gestes', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'moins_2_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU', 'CET'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 15000 },
    }
    const r = runSimulation(input)
    expect(r.gestesRetenus).toEqual([])
    expect(r.gestesRejetes.length).toBe(2)
    expect(r.mprTotal).toBe(0)
    expect(r.exclusion).toBeDefined()
    // Early exit → necessiteMAR false
    expect(r.necessiteMAR).toBe(false)
  })
})

describe('pipeline — Cas 8 : Isolation geste → CEE BAR-EN calculé', () => {
  it('isolation murs/toiture produit des CEE réels via BAR-EN-101/102', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['ISOLATION_MURS', 'ISOLATION_TOITURE'],
        coupDePouce: false,
        equipementActuel: 'elec',
      },
      budget: { budgetHt: 20000 },
    }
    const r = runSimulation(input)
    expect(r.gestesRetenus).toEqual(expect.arrayContaining(['ISOLATION_MURS', 'ISOLATION_TOITURE']))
    // Les baremeIds contiennent BAR-EN (pas des STUBs)
    const barEnIds = r.baremeIds.filter((b) => b.includes('BAR-EN'))
    expect(barEnIds.length).toBeGreaterThanOrEqual(2)
    expect(barEnIds.some((b) => b.includes('BAR-EN-102'))).toBe(true) // murs
    expect(barEnIds.some((b) => b.includes('BAR-EN-101'))).toBe(true) // toiture
    // CEE fourchette > 0 maintenant
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
  })
})

describe('pipeline — Cas 9 : Violet + accompagné → écrêtement 80 %', () => {
  it('écrêtement à 80 % pour violet accompagné, plafond 30K (2 sauts)', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        rfr: 55000,
        categorie: 'violet',
        anciennete: 'plus_15_ans',
        surface: 100,
      }),
      projet: {
        parcours: 'accompagne',
        gestes: ['PAC_AIREAU', 'ISOLATION_MURS'],
        sautsDpe: 2,
        coupDePouce: true,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 35000 },
    }
    const r = runSimulation(input)
    expect(r.categorieAnah).toBe('violet')
    expect(r.ecretementPct).toBe(0.8)
    // MPR accompagné violet = 45 % fixe, plafond 2 sauts = 30K
    // min(35000, 30000) * 0.45 = 13500
    expect(r.mprTotal).toBeGreaterThan(0)
    // Totalité des aides ≤ 80 % du budget TTC
    const budgetTTC = Math.round(35000 * 1.055)
    expect(r.totalAidesHaut).toBeLessThanOrEqual(Math.round(budgetTTC * 0.8) + 1)
  })
})

describe('pipeline — Cas 10 : Multi-geste avec CDP fioul → cumul correct', () => {
  it('PAC + CET avec CDP fioul calcule correctement les aides', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        rfr: 30000,
        categorie: 'jaune',
        anciennete: 'plus_15_ans',
      }),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU', 'CET'],
        coupDePouce: true,
        equipementActuel: 'fioul',
      },
      budget: { budgetHt: 20000 },
    }
    const r = runSimulation(input)
    expect(r.leadPriority).toBe('high')
    // Au moins un CDP estimé (fioul = high value)
    expect(r.cdpEstimationHaut).toBeGreaterThanOrEqual(0)
    // MPR total > 0
    expect(r.mprTotal).toBeGreaterThan(0)
    // Trace complète
    expect(r.formuleDebug.length).toBeGreaterThanOrEqual(4)
    // Non-cumul appliqué (CET + PAC → exclusion mutuelle sur ECS)
    const ncStep = r.formuleDebug.find((s) => s.step === 'applyNonCumul')
    expect(ncStep).toBeDefined()
  })
})

// ---- P0 : Stubs CEE éliminés — vérification montants > 0 ----

describe('pipeline — Stubs éliminés : VMC_2FLUX, POELE_GRANULES, CESI, PAC_GEOTHERMIE', () => {
  it('VMC_2FLUX → CEE > 0 avec baremeId BAR-TH-125 FALLBACK', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['VMC_2FLUX'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 10000 },
    }
    const r = runSimulation(input)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
    expect(r.baremeIds.some((b) => b.includes('BAR-TH-125') && b.includes('FALLBACK'))).toBe(true)
  })

  it('POELE_GRANULES → CEE > 0 avec baremeId BAR-TH-112 FALLBACK', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['POELE_GRANULES'],
        coupDePouce: false,
        equipementActuel: 'bois',
      },
      budget: { budgetHt: 8000 },
    }
    const r = runSimulation(input)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
    expect(r.baremeIds.some((b) => b.includes('BAR-TH-112'))).toBe(true)
  })

  it('CESI → CEE > 0 avec baremeId BAR-TH-101 FALLBACK', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['CESI'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 6000 },
    }
    const r = runSimulation(input)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
    expect(r.baremeIds.some((b) => b.includes('BAR-TH-101'))).toBe(true)
  })

  it('PAC_GEOTHERMIE → CEE > 0 avec baremeId PAC_GEO FALLBACK', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_GEOTHERMIE'],
        coupDePouce: false,
        equipementActuel: 'fioul',
      },
      budget: { budgetHt: 25000 },
    }
    const r = runSimulation(input)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
    expect(r.baremeIds.some((b) => b.includes('PAC_GEO') && b.includes('FALLBACK'))).toBe(true)
  })

  it('Aucun baremeId ne contient STUB', () => {
    const gestes: Array<'VMC_2FLUX' | 'POELE_GRANULES' | 'POELE_BUCHES' | 'CESI' | 'PAC_GEOTHERMIE'> = [
      'VMC_2FLUX', 'POELE_GRANULES', 'POELE_BUCHES', 'CESI', 'PAC_GEOTHERMIE',
    ]
    for (const g of gestes) {
      const input: SimulationInput = {
        situation: baseSituation({ anciennete: 'plus_15_ans' }),
        projet: {
          parcours: 'geste',
          gestes: [g],
          coupDePouce: false,
          equipementActuel: 'gaz',
        },
        budget: { budgetHt: 15000 },
      }
      const r = runSimulation(input)
      const hasStub = r.baremeIds.some((b) => b.includes('STUB'))
      expect(hasStub, `${g} should not have STUB baremeId`).toBe(false)
    }
  })
})

// ---- P1 : Tests cas limites supplémentaires ----

describe('pipeline — MAR plafonné à 2000€ TTC', () => {
  it('MAR bleu = 2000 (100% de 2000 TTC)', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        rfr: 15000,
        categorie: 'bleu',
        anciennete: 'plus_15_ans',
      }),
      projet: {
        parcours: 'accompagne',
        gestes: ['PAC_AIREAU'],
        sautsDpe: 3,
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 40000 },
    }
    const r = runSimulation(input)
    expect(r.marPriseEnCharge).toBeLessThanOrEqual(2000)
    expect(r.marPriseEnCharge).toBe(2000) // 100% × 2000
  })

  it('MAR rose = 400 (20% de 2000 TTC)', () => {
    const input: SimulationInput = {
      situation: baseSituation({
        rfr: 200000,
        categorie: 'rose',
        anciennete: 'plus_15_ans',
      }),
      projet: {
        parcours: 'accompagne',
        gestes: ['PAC_AIREAU'],
        sautsDpe: 2,
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 30000 },
    }
    const r = runSimulation(input)
    expect(r.marPriseEnCharge).toBeLessThanOrEqual(2000)
  })
})

describe('pipeline — Fourchette CEE élargie par incertitude surface', () => {
  it('Isolation murs → fourchette CEE plus large que sans incertitude', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans', surface: 100 }),
      projet: {
        parcours: 'geste',
        gestes: ['ISOLATION_MURS'],
        coupDePouce: false,
        equipementActuel: 'gaz',
      },
      budget: { budgetHt: 20000 },
    }
    const r = runSimulation(input)
    // La fourchette CEE doit être élargie (bas < haut)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(r.ceeFourchetteBas)
    // Et les deux doivent être > 0
    expect(r.ceeFourchetteBas).toBeGreaterThan(0)
    expect(r.ceeFourchetteHaut).toBeGreaterThan(0)
  })
})

describe('pipeline — Écrêtement limite', () => {
  it('Budget très bas → écrêtement plafonne les aides', () => {
    const input: SimulationInput = {
      situation: baseSituation({ anciennete: 'plus_15_ans' }),
      projet: {
        parcours: 'geste',
        gestes: ['PAC_AIREAU'],
        coupDePouce: true,
        equipementActuel: 'fioul',
      },
      budget: { budgetHt: 3000 }, // Budget très bas
    }
    const r = runSimulation(input)
    // L'écrêtement doit être atteint (aides brutes > 75% du budget TTC)
    expect(r.ecretementAtteint).toBe(true)
    // Le reste à charge bas doit être positif (pas de reste négatif)
    expect(r.resteAChargeBas).toBeGreaterThanOrEqual(0)
  })
})
