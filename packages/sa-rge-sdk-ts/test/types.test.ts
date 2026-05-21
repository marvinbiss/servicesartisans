import { describe, expect, expectTypeOf, it } from 'vitest'

import type {
  AskInput,
  CeeBaremeInput,
  Geste,
  MenageCategorie,
  MprBaremeInput,
  TypeLogement,
  ZoneClimatique,
  ZoneRGE,
} from '../src/types.js'

const ALL_GESTES = [
  'pac_air_eau',
  'pac_geothermique',
  'pac_air_air',
  'chauffe_eau_thermo',
  'isolation_combles',
  'isolation_ite',
  'isolation_planchers_bas',
  'vmc_double_flux',
  'chaudiere_biomasse',
  'audit_energetique',
] as const satisfies ReadonlyArray<Geste>

const ALL_MENAGE: ReadonlyArray<MenageCategorie> = [
  'tres_modeste',
  'modeste',
  'intermediaire',
  'superieur',
] as const

const ALL_ZONE_RGE: ReadonlyArray<ZoneRGE> = ['idf', 'hors_idf'] as const
const ALL_ZONE_CLIMATIQUE: ReadonlyArray<ZoneClimatique> = ['H1', 'H2', 'H3'] as const
const ALL_TYPE_LOGEMENT: ReadonlyArray<TypeLogement> = [
  'maison_individuelle',
  'appartement',
] as const

describe('Geste closed-set union', () => {
  it('contains the 10 documented gestes', () => {
    expect(ALL_GESTES).toHaveLength(10)
    expect(new Set(ALL_GESTES).size).toBe(10)
    expectTypeOf<(typeof ALL_GESTES)[number]>().toEqualTypeOf<Geste>()
  })
})

describe('MenageCategorie closed-set union', () => {
  it('contains the 4 documented categories', () => {
    expect(ALL_MENAGE).toHaveLength(4)
    expect(new Set(ALL_MENAGE).size).toBe(4)
    expectTypeOf<(typeof ALL_MENAGE)[number]>().toEqualTypeOf<MenageCategorie>()
  })
})

describe('Zone and logement closed-set unions', () => {
  it('ZoneRGE has 2 values', () => {
    expect(ALL_ZONE_RGE).toHaveLength(2)
    expect(new Set(ALL_ZONE_RGE).size).toBe(2)
    expectTypeOf<(typeof ALL_ZONE_RGE)[number]>().toEqualTypeOf<ZoneRGE>()
  })

  it('ZoneClimatique has 3 values', () => {
    expect(ALL_ZONE_CLIMATIQUE).toHaveLength(3)
    expect(new Set(ALL_ZONE_CLIMATIQUE).size).toBe(3)
    expectTypeOf<(typeof ALL_ZONE_CLIMATIQUE)[number]>().toEqualTypeOf<ZoneClimatique>()
  })

  it('TypeLogement has 2 values', () => {
    expect(ALL_TYPE_LOGEMENT).toHaveLength(2)
    expect(new Set(ALL_TYPE_LOGEMENT).size).toBe(2)
    expectTypeOf<(typeof ALL_TYPE_LOGEMENT)[number]>().toEqualTypeOf<TypeLogement>()
  })
})

describe('Input shapes match the documented API surface', () => {
  it('MprBaremeInput requires geste + menageCategorie + zone + rfr + nbPersonnes', () => {
    const sample: MprBaremeInput = {
      geste: 'pac_air_eau',
      menageCategorie: 'modeste',
      zone: 'idf',
      rfr: 22_000,
      nbPersonnes: 3,
    }
    expect(sample.geste).toBe('pac_air_eau')
    expect(sample.rfr).toBe(22_000)
    expectTypeOf(sample).toMatchTypeOf<{
      geste: Geste
      menageCategorie: MenageCategorie
      zone: ZoneRGE
      rfr: number
      nbPersonnes: number
    }>()
  })

  it('CeeBaremeInput requires geste + zoneClimatique + typeLogement + menageCategorie', () => {
    const sample: CeeBaremeInput = {
      geste: 'isolation_combles',
      zoneClimatique: 'H2',
      typeLogement: 'maison_individuelle',
      menageCategorie: 'tres_modeste',
    }
    expect(sample.zoneClimatique).toBe('H2')
    expectTypeOf(sample).toMatchTypeOf<{
      geste: Geste
      zoneClimatique: ZoneClimatique
      typeLogement: TypeLogement
      menageCategorie: MenageCategorie
    }>()
  })

  it('AskInput requires query and accepts optional classification + aidesContext + citedSources', () => {
    const minimal: AskInput = { query: 'Comment marche MaPrimeRenov ?' }
    expect(minimal.query).toContain('MaPrimeRenov')
    expectTypeOf(minimal.query).toBeString()

    const full: AskInput = {
      query: 'Combien ma PAC ?',
      classification: 'NUMERIC',
      aidesContext: {
        geste: 'pac_air_eau',
        menageCategorie: 'modeste',
        rfr: 22_000,
        nbPersonnes: 3,
        zone: 'idf',
      },
      citedSources: [{ url: 'https://example.fr/x', title: 'Source X', retrievedAt: '2026-05-21' }],
    }
    expect(full.aidesContext?.geste).toBe('pac_air_eau')
    expectTypeOf(full).toMatchTypeOf<AskInput>()
  })
})
