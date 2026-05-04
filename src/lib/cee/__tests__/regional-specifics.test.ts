import { describe, expect, it } from 'vitest'

import {
  CEE_REGIONAL_SLUGS,
  getAllCeeRegionalSpecifics,
  getCeeRegionalSpecifics,
  isCeeRegionalSlug,
} from '../regional-specifics'

/**
 * Sprint AI Wave D Ahrefs 2026-05-03 — verrou data régionale CEE.
 *
 * Garantit que :
 *   - 14 régions métropole+Corse couvertes (DOM/COM exclu = forfaits CEE
 *     différents via dispositif GUSE distinct)
 *   - Chaque région a une zone climatique valide RT2012
 *   - Chaque aide régionale a un sourceUrl https valide (intégrité E-E-A-T)
 *   - Les housingMix percentages sont cohérents (0-100)
 *   - lastReviewedAt format ISO YYYY-MM-DD
 */

const VALID_ZONES = new Set(['H1a', 'H1b', 'H1c', 'H2a', 'H2b', 'H2c', 'H2d', 'H3'])

describe('Sprint AI Wave D — regional-specifics CEE', () => {
  it('couvre 12 régions métropole + Corse (13 total)', () => {
    expect(CEE_REGIONAL_SLUGS.length).toBe(13)
  })

  it.each(CEE_REGIONAL_SLUGS)('région %s — zone climatique valide RT2012', (slug) => {
    const reg = getCeeRegionalSpecifics(slug)
    expect(reg).not.toBeNull()
    expect(VALID_ZONES.has(reg!.climateZone)).toBe(true)
  })

  it.each(CEE_REGIONAL_SLUGS)('région %s — climateLabel mentionne la zone climatique', (slug) => {
    const reg = getCeeRegionalSpecifics(slug)
    expect(reg).not.toBeNull()
    // Cohérence éditoriale : la zone climatique RT2012 doit apparaître dans le label.
    expect(reg!.climateLabel).toContain(reg!.climateZone)
  })

  it.each(CEE_REGIONAL_SLUGS)(
    'région %s — chaque aide régionale a sourceUrl https + montant + detail',
    (slug) => {
      const reg = getCeeRegionalSpecifics(slug)
      expect(reg).not.toBeNull()
      for (const aid of reg!.regionalAids) {
        expect(aid.sourceUrl).toMatch(/^https:\/\//)
        expect(aid.montant.length).toBeGreaterThan(0)
        expect(aid.detail.length).toBeGreaterThan(20)
      }
    }
  )

  it.each(CEE_REGIONAL_SLUGS)('région %s — housingMix percentages cohérents (0-100)', (slug) => {
    const reg = getCeeRegionalSpecifics(slug)
    expect(reg).not.toBeNull()
    expect(reg!.housingMix.pctMaisonsIndividuelles).toBeGreaterThanOrEqual(0)
    expect(reg!.housingMix.pctMaisonsIndividuelles).toBeLessThanOrEqual(100)
    expect(reg!.housingMix.pctConstructionPre1975).toBeGreaterThanOrEqual(0)
    expect(reg!.housingMix.pctConstructionPre1975).toBeLessThanOrEqual(100)
  })

  it.each(CEE_REGIONAL_SLUGS)('région %s — lastReviewedAt au format YYYY-MM-DD', (slug) => {
    const reg = getCeeRegionalSpecifics(slug)
    expect(reg).not.toBeNull()
    expect(reg!.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('isCeeRegionalSlug — accepte les régions valides, rejette les autres', () => {
    expect(isCeeRegionalSlug('ile-de-france')).toBe(true)
    expect(isCeeRegionalSlug('bretagne')).toBe(true)
    expect(isCeeRegionalSlug('corse')).toBe(true)
    expect(isCeeRegionalSlug('martinique')).toBe(false) // outre-mer exclu
    expect(isCeeRegionalSlug('inexistant')).toBe(false)
    expect(isCeeRegionalSlug('')).toBe(false)
  })

  it('getAllCeeRegionalSpecifics — retourne 13 entries triées par insertion', () => {
    const all = getAllCeeRegionalSpecifics()
    expect(all.length).toBe(13)
    // Île-de-France en premier (cohérence éditoriale).
    expect(all[0].slug).toBe('ile-de-france')
  })

  it('exclut les régions outre-mer (forfaits CEE distincts via GUSE)', () => {
    expect(CEE_REGIONAL_SLUGS).not.toContain('guadeloupe')
    expect(CEE_REGIONAL_SLUGS).not.toContain('martinique')
    expect(CEE_REGIONAL_SLUGS).not.toContain('guyane')
    expect(CEE_REGIONAL_SLUGS).not.toContain('la-reunion')
    expect(CEE_REGIONAL_SLUGS).not.toContain('mayotte')
  })
})
