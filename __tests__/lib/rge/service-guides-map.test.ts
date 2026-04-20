/**
 * Tests — service-guides-map
 * --------------------------
 * Vérifie le cross-linking service RGE → guides qualif + guides CEE.
 */

import { describe, it, expect } from 'vitest'
import {
  getRgeGuidesForService,
  getCeeGuidesForService,
  getCeeOpsForRgeService,
  getRgeServicesForCeeOp,
  __internal as SERVICE_GUIDES_INTERNAL,
} from '@/lib/rge/service-guides-map'
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

describe('getCeeOpsForRgeService (fiche artisan → CEE primes)', () => {
  it('inclut tous les codes mappés pour un service, même sans guide éditorial', () => {
    const res = getCeeOpsForRgeService('pompe-a-chaleur')
    const codes = res.map((g) => g.code)
    expect(codes).toContain('BAR-TH-171')
    expect(codes).toContain('BAR-TH-172')
    expect(codes).toContain('BAR-TH-129')
    expect(codes).toContain('BAR-TH-148')
    expect(codes).toContain('BAR-TH-159')
  })

  it('chaque code retourné a un label et un code string non vides', () => {
    const res = getCeeOpsForRgeService('isolation-thermique')
    expect(res.length).toBeGreaterThan(0)
    for (const g of res) {
      expect(typeof g.code).toBe('string')
      expect(g.code.length).toBeGreaterThan(0)
      expect(typeof g.label).toBe('string')
      expect(g.label.length).toBeGreaterThan(0)
    }
  })

  it('retourne [] pour un service inconnu', () => {
    expect(getCeeOpsForRgeService('garbage-service-zzz')).toEqual([])
  })

  it('menuisier inclut BAR-EN-104 (fenêtres) et BAR-EN-108 (volets)', () => {
    const codes = getCeeOpsForRgeService('menuisier').map((g) => g.code)
    expect(codes).toContain('BAR-EN-104')
    expect(codes).toContain('BAR-EN-108')
  })

  it('panneaux-solaires inclut BAR-TH-143 (système solaire combiné)', () => {
    const codes = getCeeOpsForRgeService('panneaux-solaires').map((g) => g.code)
    expect(codes).toContain('BAR-TH-143')
  })

  it('renovation-energetique inclut BAR-TH-174 (rénovation d\u2019ampleur)', () => {
    const codes = getCeeOpsForRgeService('renovation-energetique').map((g) => g.code)
    expect(codes).toContain('BAR-TH-174')
  })
})

describe('getRgeServicesForCeeOp (page CEE → artisans RGE)', () => {
  it('BAR-TH-171 pointe vers pompe-a-chaleur et chauffagiste', () => {
    const services = getRgeServicesForCeeOp('BAR-TH-171')
    expect(services).toContain('pompe-a-chaleur')
    expect(services).toContain('chauffagiste')
  })

  it('case-insensitive sur le code CEE', () => {
    const upper = getRgeServicesForCeeOp('BAR-EN-101')
    const lower = getRgeServicesForCeeOp('bar-en-101')
    expect(lower).toEqual(upper)
  })

  it('retourne tableau vide pour un code inconnu', () => {
    expect(getRgeServicesForCeeOp('BAR-ZZ-999')).toEqual([])
  })

  it('BAR-EN-102 (isolation murs) inclut isolation-thermique + facadier + platrier', () => {
    const services = getRgeServicesForCeeOp('BAR-EN-102')
    expect(services).toContain('isolation-thermique')
    expect(services).toContain('facadier')
    expect(services).toContain('platrier')
  })
})

describe('invariants du mapping CEE → RGE', () => {
  it('tous les codes avec guide publié ont un mapping service RGE', () => {
    const mapped = new Set(Object.keys(SERVICE_GUIDES_INTERNAL.CEE_CODE_TO_RGE_SERVICES))
    for (const code of CEE_OPERATIONS_WITH_GUIDE) {
      expect(mapped.has(code)).toBe(true)
    }
  })

  it('tous les codes mappés ont un libellé court', () => {
    for (const code of Object.keys(SERVICE_GUIDES_INTERNAL.CEE_CODE_TO_RGE_SERVICES)) {
      expect(SERVICE_GUIDES_INTERNAL.CEE_SHORT_LABELS[code]).toBeTruthy()
    }
  })

  it('aucun service mappé vide (chaque code pointe vers >= 1 service)', () => {
    for (const [code, services] of Object.entries(
      SERVICE_GUIDES_INTERNAL.CEE_CODE_TO_RGE_SERVICES
    )) {
      expect(services.length).toBeGreaterThan(0)
      expect(code).toMatch(/^BAR-(EN|TH|SE)-\d+$/)
    }
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
