import { describe, it, expect } from 'vitest'
import {
  situationSchema,
  projetSchema,
  projetCrossSituationSchema,
  budgetSchema,
  coordonneesSchema,
} from '@/lib/simulateur/schemas'

describe('situationSchema', () => {
  const valid = {
    typeLogement: 'maison' as const,
    residencePrincipale: true,
    anciennete: 'plus_15_ans' as const,
    surface: 100,
    codePostal: '75001',
    foyer: 3,
    rfr: 35000,
  }

  it('accepte une situation valide', () => {
    expect(situationSchema.safeParse(valid).success).toBe(true)
  })

  it('rejette surface < 15', () => {
    const r = situationSchema.safeParse({ ...valid, surface: 10 })
    expect(r.success).toBe(false)
  })

  it('rejette surface > 500', () => {
    const r = situationSchema.safeParse({ ...valid, surface: 600 })
    expect(r.success).toBe(false)
  })

  it('rejette CP non 5 chiffres', () => {
    expect(situationSchema.safeParse({ ...valid, codePostal: '750' }).success).toBe(false)
    expect(situationSchema.safeParse({ ...valid, codePostal: 'abcde' }).success).toBe(false)
  })

  it('rejette foyer < 1 ou > 10', () => {
    expect(situationSchema.safeParse({ ...valid, foyer: 0 }).success).toBe(false)
    expect(situationSchema.safeParse({ ...valid, foyer: 11 }).success).toBe(false)
  })

  it('accepte RFR = 0 (foyer non imposable)', () => {
    expect(situationSchema.safeParse({ ...valid, rfr: 0 }).success).toBe(true)
  })

  it('rejette RFR < 0', () => {
    expect(situationSchema.safeParse({ ...valid, rfr: -1000 }).success).toBe(false)
  })
})

describe('projetSchema', () => {
  it('accepte un parcours geste avec 1 geste', () => {
    const r = projetSchema.safeParse({
      parcours: 'geste',
      gestes: ['PAC_AIREAU'],
      coupDePouce: false,
      equipementActuel: 'gaz',
    })
    expect(r.success).toBe(true)
  })

  it('rejette un parcours accompagné sans 2 gestes isolation', () => {
    const r = projetSchema.safeParse({
      parcours: 'accompagne',
      gestes: ['PAC_AIREAU', 'ISOLATION_MURS'],
      coupDePouce: false,
      equipementActuel: 'gaz',
    })
    expect(r.success).toBe(false)
  })

  it('accepte un parcours accompagné avec 2 gestes isolation', () => {
    const r = projetSchema.safeParse({
      parcours: 'accompagne',
      gestes: ['ISOLATION_MURS', 'ISOLATION_TOITURE'],
      coupDePouce: false,
      equipementActuel: 'fioul',
    })
    expect(r.success).toBe(true)
  })

  it('rejette une liste de gestes vide', () => {
    const r = projetSchema.safeParse({
      parcours: 'geste',
      gestes: [],
      coupDePouce: false,
      equipementActuel: 'gaz',
    })
    expect(r.success).toBe(false)
  })
})

describe('projetCrossSituationSchema', () => {
  it('bloque accompagne + CDP + residence secondaire', () => {
    const schema = projetCrossSituationSchema(false)
    const r = schema.safeParse({
      parcours: 'accompagne',
      gestes: ['ISOLATION_MURS', 'ISOLATION_TOITURE', 'ISOLATION_PLANCHER'],
      coupDePouce: true,
      equipementActuel: 'gaz',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('coupDePouce'))).toBe(true)
    }
  })

  it('autorise accompagne + CDP + residence principale', () => {
    const schema = projetCrossSituationSchema(true)
    const r = schema.safeParse({
      parcours: 'accompagne',
      gestes: ['ISOLATION_MURS', 'ISOLATION_TOITURE'],
      coupDePouce: true,
      equipementActuel: 'fioul',
    })
    expect(r.success).toBe(true)
  })

  it('autorise geste + CDP + residence secondaire (CDP non-ampleur)', () => {
    const schema = projetCrossSituationSchema(false)
    const r = schema.safeParse({
      parcours: 'geste',
      gestes: ['PAC_AIREAU'],
      coupDePouce: true,
      equipementActuel: 'fioul',
    })
    expect(r.success).toBe(true)
  })
})

describe('budgetSchema', () => {
  it('rejette budget < 1000', () => {
    expect(budgetSchema.safeParse({ budgetHt: 500 }).success).toBe(false)
  })

  it('accepte budget >= 1000', () => {
    expect(budgetSchema.safeParse({ budgetHt: 1000 }).success).toBe(true)
    expect(budgetSchema.safeParse({ budgetHt: 15000 }).success).toBe(true)
  })

  it('accepte dépenses par geste optionnelles', () => {
    const r = budgetSchema.safeParse({
      budgetHt: 10000,
      depensesParGeste: { PAC_AIREAU: 9000 },
    })
    expect(r.success).toBe(true)
  })
})

describe('coordonneesSchema', () => {
  const valid = {
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean.dupont@example.com',
    telephone: '0612345678',
    consentRgpd: true as const,
    consentMajorite: true as const,
    consentDemarchage: false,
  }

  it('accepte des coordonnées valides', () => {
    const r = coordonneesSchema.safeParse(valid)
    expect(r.success).toBe(true)
  })

  it('accepte le format E.164 +33', () => {
    const r = coordonneesSchema.safeParse({ ...valid, telephone: '+33612345678' })
    expect(r.success).toBe(true)
  })

  it('rejette un email invalide', () => {
    const r = coordonneesSchema.safeParse({ ...valid, email: 'pas-un-email' })
    expect(r.success).toBe(false)
  })

  it('rejette un téléphone invalide', () => {
    expect(coordonneesSchema.safeParse({ ...valid, telephone: '0012345678' }).success).toBe(false)
    expect(coordonneesSchema.safeParse({ ...valid, telephone: '12345' }).success).toBe(false)
    expect(coordonneesSchema.safeParse({ ...valid, telephone: '+4412345678' }).success).toBe(false)
  })

  it('rejette consentRgpd = false', () => {
    const r = coordonneesSchema.safeParse({ ...valid, consentRgpd: false })
    expect(r.success).toBe(false)
  })

  it('rejette consentMajorite = false', () => {
    const r = coordonneesSchema.safeParse({ ...valid, consentMajorite: false })
    expect(r.success).toBe(false)
  })

  it('normalise l’email en minuscules', () => {
    const r = coordonneesSchema.safeParse({ ...valid, email: 'Jean.DUPONT@Example.COM' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe('jean.dupont@example.com')
  })
})
