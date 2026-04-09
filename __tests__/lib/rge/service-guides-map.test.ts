/**
 * Tests — service-guides-map
 * --------------------------
 * Vérifie le cross-linking service RGE → guides qualif + guides CEE.
 */

import { describe, it, expect } from 'vitest'
import { getRgeGuidesForService, getCeeGuidesForService } from '@/lib/rge/service-guides-map'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import {
  RGE_QUALIFICATION_GUIDES,
  RGE_QUALIFICATIONS_WITH_GUIDE,
  getRgeQualificationGuide,
} from '@/lib/rge/qualification-guides-content'

describe('getRgeGuidesForService', () => {
  it('retourne un tableau (vide ou plein) pour un service valide', () => {
    const res = getRgeGuidesForService('pompe-a-chaleur')
    expect(Array.isArray(res)).toBe(true)
  })

  it('retourne un tableau vide pour un service inconnu', () => {
    const res = getRgeGuidesForService('service-inexistant-xyz')
    expect(res).toEqual([])
  })

  it('chaque guide retourné a les champs slug/name/organisme/lede', () => {
    const res = getRgeGuidesForService('pompe-a-chaleur')
    for (const g of res) {
      expect(typeof g.slug).toBe('string')
      expect(g.slug.length).toBeGreaterThan(0)
      expect(typeof g.name).toBe('string')
      expect(typeof g.organisme).toBe('string')
      expect(typeof g.lede).toBe('string')
    }
  })

  it('déduplique implicitement par slug (pas de doublon)', () => {
    const res = getRgeGuidesForService('pompe-a-chaleur')
    const slugs = res.map((g) => g.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })
})

describe('getCeeGuidesForService', () => {
  it('ne retourne que des codes CEE qui ont un guide publié', () => {
    const published = new Set(CEE_OPERATIONS_WITH_GUIDE)
    const res = getCeeGuidesForService('pompe-a-chaleur')
    for (const g of res) {
      expect(published.has(g.code)).toBe(true)
    }
  })

  it('retourne un tableau vide pour un service non couvert', () => {
    const res = getCeeGuidesForService('service-inexistant-xyz')
    expect(res).toEqual([])
  })

  it('pompe-a-chaleur inclut BAR-TH-171 (PAC air/eau) s\u2019il est publié', () => {
    const res = getCeeGuidesForService('pompe-a-chaleur')
    const codes = res.map((g) => g.code)
    if (CEE_OPERATIONS_WITH_GUIDE.includes('BAR-TH-171')) {
      expect(codes).toContain('BAR-TH-171')
    }
  })

  it('isolation-thermique inclut BAR-EN-101 (combles) s\u2019il est publié', () => {
    const res = getCeeGuidesForService('isolation-thermique')
    const codes = res.map((g) => g.code)
    if (CEE_OPERATIONS_WITH_GUIDE.includes('BAR-EN-101')) {
      expect(codes).toContain('BAR-EN-101')
    }
  })

  it('menuisier inclut BAR-EN-104 (fenêtres) s\u2019il est publié', () => {
    const res = getCeeGuidesForService('menuisier')
    const codes = res.map((g) => g.code)
    if (CEE_OPERATIONS_WITH_GUIDE.includes('BAR-EN-104')) {
      expect(codes).toContain('BAR-EN-104')
    }
  })

  it('chaque guide retourné a un libellé non vide', () => {
    const res = getCeeGuidesForService('chauffagiste')
    for (const g of res) {
      expect(g.label.length).toBeGreaterThan(0)
    }
  })

  it('déduplique par code', () => {
    const res = getCeeGuidesForService('chauffagiste')
    const codes = res.map((g) => g.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })
})

describe('RGE_QUALIFICATION_GUIDES — hub labels Qualit\u2019EnR et Éco Artisan', () => {
  it('expose un guide hub qualit-enr pointant vers Qualit\u2019EnR', () => {
    expect(RGE_QUALIFICATIONS_WITH_GUIDE).toContain('qualit-enr')
    const guide = getRgeQualificationGuide('qualit-enr')
    expect(guide).not.toBeNull()
    expect(guide?.slug).toBe('qualit-enr')
    expect(guide?.organisme).toBe("Qualit'EnR")
    expect(RGE_QUALIFICATION_GUIDES['qualit-enr']).toBeDefined()
  })

  it('expose un guide eco-artisan rattaché au label FFB via Qualibat', () => {
    expect(RGE_QUALIFICATIONS_WITH_GUIDE).toContain('eco-artisan')
    const guide = getRgeQualificationGuide('eco-artisan')
    expect(guide).not.toBeNull()
    expect(guide?.slug).toBe('eco-artisan')
    expect(guide?.organisme).toContain('Qualibat')
    expect(guide?.linkedRgeService).toBe('renovation-energetique')
  })
})
