import { describe, expect, it } from 'vitest'
import type { CommuneData } from '@/lib/data/commune-data'
import { buildCommuneSnippetData } from '../snippet-helpers'

/**
 * Sprint AI Wave F 2026-05-03 — verrou anti-padding sur communes data-sparse.
 * Les communes pauvres en data NE DOIVENT PAS afficher EnBref/Tldr (sinon
 * Google détecte du contenu boilerplate sur 35K URLs INSEE).
 */

function makeCommune(overrides: Partial<CommuneData> = {}): CommuneData {
  return {
    code_insee: '75056',
    name: 'Paris',
    slug: 'paris',
    code_postal: '75001',
    departement_code: '75',
    departement_name: 'Paris',
    region_name: 'Île-de-France',
    latitude: null,
    longitude: null,
    altitude_moyenne: null,
    superficie_km2: null,
    population: 0,
    densite_population: null,
    revenu_median: null,
    prix_m2_moyen: null,
    nb_logements: null,
    part_maisons_pct: null,
    climat_zone: null,
    nb_entreprises_artisanales: null,
    gentile: null,
    description: null,
    provider_count: 0,
    nb_artisans_btp: null,
    nb_artisans_rge: null,
    pct_passoires_dpe: null,
    nb_dpe_total: null,
    jours_gel_annuels: null,
    precipitation_annuelle: null,
    mois_travaux_ext_debut: null,
    mois_travaux_ext_fin: null,
    temperature_moyenne_hiver: null,
    temperature_moyenne_ete: null,
    nb_transactions_annuelles: null,
    prix_m2_maison: null,
    prix_m2_appartement: null,
    nb_maprimerenov_annuel: null,
    ...overrides,
  } as CommuneData
}

describe('buildCommuneSnippetData', () => {
  it('retourne null si <3 signaux data réels (anti-padding)', () => {
    const sparse = makeCommune({ population: 1200 })
    expect(buildCommuneSnippetData(sparse)).toBeNull()
  })

  it('retourne null si 2 signaux seulement', () => {
    const sparse = makeCommune({ population: 1200, climat_zone: 'H1c' })
    expect(buildCommuneSnippetData(sparse)).toBeNull()
  })

  it('retourne summary + bullets si ≥3 signaux', () => {
    const rich = makeCommune({
      population: 50_000,
      nb_artisans_btp: 320,
      nb_artisans_rge: 45,
      climat_zone: 'H2a',
      jours_gel_annuels: 18,
    })
    const out = buildCommuneSnippetData(rich)
    expect(out).not.toBeNull()
    expect(out!.bullets.length).toBeGreaterThanOrEqual(3)
    expect(out!.bullets.length).toBeLessThanOrEqual(5)
    expect(out!.summary).toContain('Paris')
  })

  it('cap à 5 bullets max (lisibilité Featured Snippets)', () => {
    const veryRich = makeCommune({
      population: 50_000,
      densite_population: 2000,
      nb_artisans_btp: 320,
      nb_artisans_rge: 45,
      climat_zone: 'H2a',
      jours_gel_annuels: 18,
      pct_passoires_dpe: 23.4,
      prix_m2_moyen: 4200,
      nb_maprimerenov_annuel: 180,
    })
    const out = buildCommuneSnippetData(veryRich)
    expect(out).not.toBeNull()
    expect(out!.bullets.length).toBe(5)
  })

  it('combine artisans BTP + RGE dans un seul bullet quand les deux sont présents', () => {
    const c = makeCommune({
      population: 5000,
      nb_artisans_btp: 50,
      nb_artisans_rge: 12,
      climat_zone: 'H2b',
    })
    const out = buildCommuneSnippetData(c)
    expect(out).not.toBeNull()
    const artisanBullet = out!.bullets.find((b) => b.includes('artisans BTP'))
    expect(artisanBullet).toBeDefined()
    expect(artisanBullet).toContain('certifiés RGE')
  })
})
