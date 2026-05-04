import { describe, expect, it } from 'vitest'

import {
  CEE_REGIONAL_DATASET_LICENSE,
  CEE_REGIONAL_DATASET_PATH,
  getCeeRegionalAidsFlat,
  getCeeRegionalDatasetEntries,
  getCeeRegionalDatasetLastReviewedAt,
} from '../regional-aids-dataset'
import { CEE_REGIONAL_SLUGS } from '../regional-specifics'

/**
 * Sprint AI Wave G 2026-05-03 — verrou dataset CEE régional open-data.
 *
 * Garantit la stabilité du contrat data.gouv.fr publié :
 *   - Path canonique stable
 *   - Licence CC-BY 4.0 cohérente
 *   - Vue plate cohérente avec vue hiérarchique (count = sum aids)
 *   - Tous les sourceUrl https (pas d'URL cassée propagée à data.gouv.fr)
 *   - lastReviewedAt format ISO YYYY-MM-DD
 */

describe('Sprint AI Wave G — regional-aids-dataset', () => {
  it('chemin canonique stable (data.gouv.fr l’indexe)', () => {
    expect(CEE_REGIONAL_DATASET_PATH).toBe('/datasets/cee-regional-aids')
  })

  it('licence CC-BY 4.0 (interopérabilité licence ouverte data.gouv)', () => {
    expect(CEE_REGIONAL_DATASET_LICENSE).toBe('https://creativecommons.org/licenses/by/4.0/')
  })

  it('vue hiérarchique = même nombre d’entries que les régions Wave D', () => {
    const entries = getCeeRegionalDatasetEntries()
    expect(entries.length).toBe(CEE_REGIONAL_SLUGS.length)
  })

  it('vue plate = somme des aides de toutes les régions', () => {
    const entries = getCeeRegionalDatasetEntries()
    const flat = getCeeRegionalAidsFlat()
    const expectedRows = entries.reduce((sum, e) => sum + e.regional_aids.length, 0)
    expect(flat.length).toBe(expectedRows)
  })

  it('chaque ligne plate a un sourceUrl https valide (E-E-A-T)', () => {
    for (const row of getCeeRegionalAidsFlat()) {
      expect(row.aid_source_url).toMatch(/^https:\/\//)
    }
  })

  it('chaque entry hiérarchique a sourceUrl https sur chaque aid', () => {
    for (const entry of getCeeRegionalDatasetEntries()) {
      for (const aid of entry.regional_aids) {
        expect(aid.source_url).toMatch(/^https:\/\//)
      }
    }
  })

  it('lastReviewedAt format ISO YYYY-MM-DD', () => {
    expect(getCeeRegionalDatasetLastReviewedAt()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('housingMix percentages cohérents (0-100) sur la vue dataset', () => {
    for (const entry of getCeeRegionalDatasetEntries()) {
      expect(entry.housing_mix.pct_maisons_individuelles).toBeGreaterThanOrEqual(0)
      expect(entry.housing_mix.pct_maisons_individuelles).toBeLessThanOrEqual(100)
      expect(entry.housing_mix.pct_construction_pre_1975).toBeGreaterThanOrEqual(0)
      expect(entry.housing_mix.pct_construction_pre_1975).toBeLessThanOrEqual(100)
    }
  })

  it('zones climatiques RT2012 valides sur toutes les régions', () => {
    const VALID = new Set(['H1a', 'H1b', 'H1c', 'H2a', 'H2b', 'H2c', 'H2d', 'H3'])
    for (const entry of getCeeRegionalDatasetEntries()) {
      expect(VALID.has(entry.climate_zone)).toBe(true)
    }
  })
})
