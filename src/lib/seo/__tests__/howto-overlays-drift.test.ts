import { describe, expect, it } from 'vitest'

import { getHowToOverlay, getHowToOverlaySectionIds } from '../deep-sections-howto-overlays'
import {
  getDeepSections,
  getDeepSectionsTradeSlugs,
  getRgeOnlyDeepSectionsSlugs,
} from '../trade-deep-sections'

const ALL_SECTION_IDS = new Set<string>()
for (const slug of [...getDeepSectionsTradeSlugs(), ...getRgeOnlyDeepSectionsSlugs()]) {
  for (const s of getDeepSections(slug)) {
    ALL_SECTION_IDS.add(s.id)
  }
}

const OVERLAY_IDS = getHowToOverlaySectionIds()

describe('deep-sections-howto-overlays — Sprint G Ahrefs 2026-05-03', () => {
  it('expose au moins 5 overlays HowTo (sections décisionnelles ciblées)', () => {
    expect(OVERLAY_IDS.length).toBeGreaterThanOrEqual(5)
  })

  it('chaque overlay cible une section qui existe dans DEEP_SECTIONS ou RGE_ONLY (drift)', () => {
    for (const id of OVERLAY_IDS) {
      expect(
        ALL_SECTION_IDS.has(id),
        `Overlay HowTo "${id}" ne correspond à aucune section deep — drift à corriger`
      ).toBe(true)
    }
  })

  it('chaque overlay a un name ≤ 100 chars + description ≤ 200 chars', () => {
    for (const id of OVERLAY_IDS) {
      const o = getHowToOverlay(id)
      expect(o).not.toBeNull()
      expect(o!.name.length, `Overlay "${id}" name trop long`).toBeLessThanOrEqual(100)
      expect(o!.description.length, `Overlay "${id}" description trop long`).toBeLessThanOrEqual(
        200
      )
    }
  })

  it('chaque overlay a entre 3 et 6 steps', () => {
    for (const id of OVERLAY_IDS) {
      const o = getHowToOverlay(id)!
      expect(o.steps.length, `Overlay "${id}" doit avoir 3-6 steps`).toBeGreaterThanOrEqual(3)
      expect(o.steps.length).toBeLessThanOrEqual(6)
    }
  })

  it('chaque step a name ≤ 80 chars + text 100-500 chars', () => {
    for (const id of OVERLAY_IDS) {
      const o = getHowToOverlay(id)!
      o.steps.forEach((s, i) => {
        expect(
          s.name.length,
          `Overlay "${id}" step ${i + 1} : name trop long (${s.name.length} > 80)`
        ).toBeLessThanOrEqual(80)
        expect(
          s.text.length,
          `Overlay "${id}" step ${i + 1} : text trop court (${s.text.length} < 100)`
        ).toBeGreaterThanOrEqual(100)
        expect(
          s.text.length,
          `Overlay "${id}" step ${i + 1} : text trop long (${s.text.length} > 500)`
        ).toBeLessThanOrEqual(500)
      })
    }
  })

  it('totalTime quand présent est au format ISO 8601 duration (PTxxM ou PTxxH)', () => {
    const isoDurationRe = /^PT\d+[HM]$/
    for (const id of OVERLAY_IDS) {
      const o = getHowToOverlay(id)!
      if (o.totalTime) {
        expect(
          isoDurationRe.test(o.totalTime),
          `Overlay "${id}" totalTime "${o.totalTime}" n'est pas ISO 8601`
        ).toBe(true)
      }
    }
  })

  it('getHowToOverlay renvoie null pour un id inconnu (safe)', () => {
    expect(getHowToOverlay('section-id-qui-existe-pas')).toBeNull()
  })

  it('cible bien les 6 sections décisionnelles principales', () => {
    expect(OVERLAY_IDS).toContain('pompe-a-chaleur-air-eau-vs-air-air')
    expect(OVERLAY_IDS).toContain('choisir-isolant-thermique')
    expect(OVERLAY_IDS).toContain('cet-air-ambiant-vs-air-exterieur')
    expect(OVERLAY_IDS).toContain('vmc-simple-flux-vs-double-flux')
    expect(OVERLAY_IDS).toContain('fenetre-pvc-alu-bois')
    expect(OVERLAY_IDS).toContain('borne-recharge-irve-niveau-p1-p2-p3')
  })
})
