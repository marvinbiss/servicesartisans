import { describe, it, expect } from 'vitest'
import {
  fetchBySiren,
  formatTrancheEffectif,
  hitToEnrichment,
  yearsSinceIso,
  type RechercheEntreprisesHit,
} from '@/lib/insee/recherche-entreprises'

const sampleHit: RechercheEntreprisesHit = {
  siren: '494866502',
  nom_complet: 'DELTA FRANCE',
  nom_raison_sociale: 'DELTA FRANCE',
  sigle: null,
  nombre_etablissements: 3,
  nombre_etablissements_ouverts: 1,
  date_creation: '2007-03-23',
  etat_administratif: 'A',
  tranche_effectif_salarie: '03',
  annee_tranche_effectif_salarie: 2024,
  siege: {
    siret: '49486650200037',
    activite_principale: '43.29A',
    adresse: '78 AVENUE DES CHAMPS ELYSEES 75008 PARIS',
    code_postal: '75008',
    libelle_commune: 'PARIS',
    region: '11',
    date_creation: '2024-12-24',
    etat_administratif: 'A',
    liste_rge: ['8611M1D111', '8611M1D112', '8611M4D111'],
    tranche_effectif_salarie: '03',
    date_mise_a_jour_insee: '2025-12-06T01:55:06',
  },
}

describe('yearsSinceIso', () => {
  it('returns null on null input', () => {
    expect(yearsSinceIso(null)).toBeNull()
  })
  it('returns null on malformed input', () => {
    expect(yearsSinceIso('not-a-date')).toBeNull()
  })
  it('computes full years since a past ISO date', () => {
    const y = yearsSinceIso('2007-03-23')
    expect(y).toBe(new Date().getFullYear() - 2007)
  })
})

describe('formatTrancheEffectif', () => {
  it('maps known codes to a readable French label', () => {
    expect(formatTrancheEffectif('03')).toBe('6 à 9 salariés')
    expect(formatTrancheEffectif('NN')).toBe('unités non employeuses')
    expect(formatTrancheEffectif('53')).toBe('10 000 salariés et plus')
  })
  it('falls back when code is unknown', () => {
    expect(formatTrancheEffectif('XX')).toBe('code INSEE XX')
  })
  it('returns null for null input', () => {
    expect(formatTrancheEffectif(null)).toBeNull()
  })
})

describe('hitToEnrichment', () => {
  it('distills the key fields needed by the description pipeline', () => {
    const e = hitToEnrichment(sampleHit)
    expect(e.siren).toBe('494866502')
    expect(e.siret_siege).toBe('49486650200037')
    expect(e.tranche_effectif_label).toBe('6 à 9 salariés')
    expect(e.activite_principale_naf).toBe('43.29A')
    expect(e.etat_administratif).toBe('A')
    expect(e.liste_rge_codes).toHaveLength(3)
    expect(e.age_years).toBeGreaterThan(15)
  })
})

describe('fetchBySiren', () => {
  it('rejects identifiers that are not 9-14 digits', async () => {
    await expect(fetchBySiren('abc')).rejects.toThrow(/invalid identifier/)
    await expect(fetchBySiren('123')).rejects.toThrow(/invalid identifier/)
  })

  it('returns parsed hit on 200 response (mocked)', async () => {
    const mockFetch = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [sampleHit], total_results: 1 }),
    })) as unknown as typeof fetch
    const hit = await fetchBySiren('494866502', mockFetch)
    expect(hit?.siren).toBe('494866502')
  })

  it('returns null on empty result set', async () => {
    const mockFetch = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [], total_results: 0 }),
    })) as unknown as typeof fetch
    const hit = await fetchBySiren('000000000', mockFetch)
    expect(hit).toBeNull()
  })

  it('throws on HTTP 5xx', async () => {
    const mockFetch = (async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof fetch
    await expect(fetchBySiren('494866502', mockFetch)).rejects.toThrow(/HTTP 503/)
  })

  it('returns null on HTTP 404', async () => {
    const mockFetch = (async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    })) as unknown as typeof fetch
    const hit = await fetchBySiren('494866502', mockFetch)
    expect(hit).toBeNull()
  })
})
