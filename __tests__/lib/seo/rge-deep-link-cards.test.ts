import { describe, expect, it } from 'vitest'

import { CANONICAL_SERVICE_SLUGS_SET } from '@/lib/services/canonical-slugs'
import { getDeepSections } from '@/lib/seo/trade-deep-sections'
import {
  RGE_DEEP_LINK_CARDS,
  getRgeDeepLinkTotalVolume,
  hasDeepLinkCardForAnchor,
} from '@/lib/seo/rge-deep-link-cards'

describe('RGE Deep-Link Cards — Action #3 Bloc 4-5 Ahrefs 2026-05-03', () => {
  it('au moins 6 cards exposées', () => {
    expect(RGE_DEEP_LINK_CARDS.length).toBeGreaterThanOrEqual(6)
  })

  it('chaque serviceSlug est un slug canonical (zéro broken link)', () => {
    for (const card of RGE_DEEP_LINK_CARDS) {
      expect(
        CANONICAL_SERVICE_SLUGS_SET.has(card.serviceSlug),
        `Card "${card.label}" : serviceSlug "${card.serviceSlug}" absent de canonical-slugs`
      ).toBe(true)
    }
  })

  it('chaque anchorId existe dans trade-deep-sections (anchor stability)', () => {
    for (const card of RGE_DEEP_LINK_CARDS) {
      const sections = getDeepSections(card.serviceSlug)
      const ids = sections.map((s) => s.id)
      expect(
        ids,
        `Card "${card.label}" : anchorId "${card.anchorId}" introuvable dans deep-sections de "${card.serviceSlug}". Anchors disponibles : ${ids.join(', ')}`
      ).toContain(card.anchorId)
    }
  })

  it('chaque card a label ≤ 50 chars et hint ≤ 130 chars', () => {
    for (const card of RGE_DEEP_LINK_CARDS) {
      expect(
        card.label.length,
        `Card "${card.label}" : label trop long (${card.label.length} > 50)`
      ).toBeLessThanOrEqual(50)
      expect(
        card.hint.length,
        `Card "${card.label}" : hint trop long (${card.hint.length} > 130)`
      ).toBeLessThanOrEqual(130)
    }
  })

  it('couples (serviceSlug, anchorId) uniques (pas de doublon)', () => {
    const keys = RGE_DEEP_LINK_CARDS.map((c) => `${c.serviceSlug}#${c.anchorId}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('volume mensuel cumulé ≥ 40 000 (cible Bloc 4-5)', () => {
    expect(getRgeDeepLinkTotalVolume()).toBeGreaterThanOrEqual(40000)
  })

  it('hasDeepLinkCardForAnchor retourne true pour anchor exposé', () => {
    expect(hasDeepLinkCardForAnchor('pompe-a-chaleur-air-eau')).toBe(true)
    expect(hasDeepLinkCardForAnchor('isolation-par-exterieur-ite')).toBe(true)
    expect(hasDeepLinkCardForAnchor('anchor-qui-existe-pas')).toBe(false)
  })

  it('couvre les 3 trades pillars haute volume (PAC + isolation + PV)', () => {
    const slugs = new Set(RGE_DEEP_LINK_CARDS.map((c) => c.serviceSlug))
    expect(slugs.has('pompe-a-chaleur')).toBe(true)
    expect(slugs.has('isolation-thermique')).toBe(true)
    expect(slugs.has('panneaux-solaires')).toBe(true)
  })
})
