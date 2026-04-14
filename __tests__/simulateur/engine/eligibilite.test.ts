import { describe, it, expect } from 'vitest'
import { filtrerGestesEligibles } from '@/lib/simulateur/engine/eligibilite'
import type { Situation } from '@/lib/simulateur/types'

const baseSituation = (over: Partial<Situation> = {}): Situation => ({
  typeLogement: 'maison',
  residencePrincipale: true,
  anciennete: '2_a_15_ans',
  surface: 100,
  codePostal: '75001',
  zone: 'H2',
  idf: true,
  foyer: 3,
  rfr: 25000,
  categorie: 'jaune',
  ...over,
})

describe('eligibilite — règles globales', () => {
  it('ancienneté < 2 ans → tous rejetés', () => {
    const r = filtrerGestesEligibles(
      ['PAC_AIREAU', 'VMC_SF'],
      baseSituation({ anciennete: 'moins_2_ans' }),
      'geste'
    )
    expect(r.retenus).toEqual([])
    expect(r.rejets).toHaveLength(2)
    expect(r.rejets[0].raison).toMatch(/moins de 2 ans/)
  })

  it('Rose + parcours geste → tous rejetés', () => {
    const r = filtrerGestesEligibles(['PAC_AIREAU'], baseSituation({ categorie: 'rose' }), 'geste')
    expect(r.retenus).toEqual([])
    expect(r.rejets[0].raison).toMatch(/Rose/)
  })

  it('résidence non principale + parcours accompagné → tous rejetés', () => {
    const r = filtrerGestesEligibles(
      ['PAC_AIREAU'],
      baseSituation({ residencePrincipale: false }),
      'accompagne'
    )
    expect(r.retenus).toEqual([])
    expect(r.rejets[0].raison).toMatch(/résidence principale/)
  })
})

describe('eligibilite — règles par geste', () => {
  it('SSC exige maison individuelle', () => {
    const r = filtrerGestesEligibles(
      ['SSC'],
      baseSituation({ typeLogement: 'appartement' }),
      'geste'
    )
    expect(r.retenus).toEqual([])
    expect(r.rejets[0].raison).toMatch(/SSC/)
  })

  it('BIOMASSE exige maison individuelle', () => {
    const r = filtrerGestesEligibles(
      ['BIOMASSE'],
      baseSituation({ typeLogement: 'appartement' }),
      'geste'
    )
    expect(r.retenus).toEqual([])
    expect(r.rejets[0].raison).toMatch(/BIOMASSE/)
  })

  it('SSC accepté en maison', () => {
    const r = filtrerGestesEligibles(['SSC'], baseSituation({ typeLogement: 'maison' }), 'geste')
    expect(r.retenus).toEqual(['SSC'])
  })

  it('résidence non principale + parcours geste → rejet MPR', () => {
    const r = filtrerGestesEligibles(
      ['PAC_AIREAU'],
      baseSituation({ residencePrincipale: false }),
      'geste'
    )
    expect(r.retenus).toEqual([])
    expect(r.rejets[0].raison).toMatch(/résidence principale/)
  })

  it('cas normal Jaune + maison + PAC → retenu', () => {
    const r = filtrerGestesEligibles(['PAC_AIREAU'], baseSituation(), 'geste')
    expect(r.retenus).toEqual(['PAC_AIREAU'])
    expect(r.rejets).toEqual([])
  })
})
