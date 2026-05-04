import { describe, expect, it } from 'vitest'

import {
  getAidesRegionHubEntries,
  getAidesRegionHubLastReviewedAt,
  getAidesRegionHubTotalRegionalAids,
  isRegionHubFeaturedOpInSeed,
  REGION_HUB_FEATURED_OP_CODE,
} from '../region-hub-data'
import { CEE_REGIONAL_SLUGS } from '@/lib/cee/regional-specifics'
import { AIDES_INDEXED_DEPTS } from '@/lib/seo/aides-dept-whitelist'
import { CEE_OPERATION_CODES } from '@/lib/cee/operation-codes'

/**
 * Sprint AI Wave L 2026-05-03 — verrou data hub /aides/par-region.
 *
 * Garantit la cohérence entre :
 *   - CEE_REGIONAL_SLUGS (Wave D, 13 régions métropolitaines)
 *   - AIDES_INDEXED_DEPTS (Wave H, top 30 dépts indexés)
 *   - cross-link cards régionales (zone climat + aides régionales + top dépts)
 */

describe('Sprint AI Wave L — region-hub-data', () => {
  it('retourne exactement CEE_REGIONAL_SLUGS.length entrées (13 régions)', () => {
    const entries = getAidesRegionHubEntries()
    expect(entries.length).toBe(CEE_REGIONAL_SLUGS.length)
    for (const entry of entries) {
      expect(CEE_REGIONAL_SLUGS).toContain(entry.slug)
    }
  })

  it('chaque entrée a un nom + climat zone RT2012 + climateLabel non vide', () => {
    // Standard RT2012 : H1[abc] (climat continental/froid), H2[abcd] (océanique
    // tempéré), H3 (méditerranéen sec). H1d/H3a/H3d n'existent pas → regex strict.
    for (const e of getAidesRegionHubEntries()) {
      expect(e.name.length).toBeGreaterThan(0)
      expect(e.climateZone).toMatch(/^(H1[abc]|H2[abcd]|H3)$/)
      expect(e.climateLabel.length).toBeGreaterThan(20)
    }
  })

  it('regionalAids — chaque aide a un sourceUrl https valide (E-E-A-T)', () => {
    for (const e of getAidesRegionHubEntries()) {
      for (const aid of e.regionalAids) {
        expect(aid.sourceUrl).toMatch(/^https:\/\//)
        expect(aid.name.length).toBeGreaterThan(0)
        expect(aid.montant.length).toBeGreaterThan(0)
      }
    }
  })

  it('topIndexedDepts ⊂ AIDES_INDEXED_DEPTS (jamais de dept hors whitelist)', () => {
    for (const e of getAidesRegionHubEntries()) {
      for (const d of e.topIndexedDepts) {
        expect(AIDES_INDEXED_DEPTS.has(d.slug)).toBe(true)
        expect(d.code).toMatch(/^[0-9]{2,3}[AB]?$/)
      }
    }
  })

  it('topIndexedDepts ≤ 4 par région (cap UX-noisy)', () => {
    for (const e of getAidesRegionHubEntries()) {
      expect(e.topIndexedDepts.length).toBeLessThanOrEqual(4)
    }
  })

  it('Île-de-France contient au moins paris en topIndexedDepts (sanity check)', () => {
    const idf = getAidesRegionHubEntries().find((e) => e.slug === 'ile-de-france')
    expect(idf).toBeDefined()
    expect(idf!.topIndexedDepts.some((d) => d.slug === 'paris')).toBe(true)
  })

  it('getAidesRegionHubLastReviewedAt retourne une date YYYY-MM-DD valide', () => {
    const date = getAidesRegionHubLastReviewedAt()
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('getAidesRegionHubTotalRegionalAids = somme des regionalAids', () => {
    const total = getAidesRegionHubTotalRegionalAids()
    const expected = getAidesRegionHubEntries().reduce((acc, e) => acc + e.regionalAids.length, 0)
    expect(total).toBe(expected)
    expect(total).toBeGreaterThan(0)
  })

  it('REGION_HUB_FEATURED_OP_CODE est un code CEE actif (anti-404 sur 13 liens)', () => {
    // Garde-fou critique : si bar-th-171 disparaît de la seed, les 13 cards
    // régionales linkent vers /cee/<dead-code>/region/[slug] = 404 systémique.
    expect(CEE_OPERATION_CODES).toContain(REGION_HUB_FEATURED_OP_CODE)
    expect(isRegionHubFeaturedOpInSeed()).toBe(true)
  })
})
