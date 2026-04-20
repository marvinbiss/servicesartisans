/**
 * Tests shared-labels — single source of truth pour libellés CEE.
 */

import { describe, it, expect } from 'vitest'
import { CEE_SHORT_LABELS, getCeeShortLabel } from '@/lib/cee/shared-labels'
import { __internal as SERVICE_GUIDES_INTERNAL } from '@/lib/rge/service-guides-map'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'

describe('CEE_SHORT_LABELS — single source of truth', () => {
  it('couvre les 15 codes publiés avec guide', () => {
    expect(Object.keys(CEE_SHORT_LABELS).length).toBeGreaterThanOrEqual(15)
  })

  it('est frozen (immuable)', () => {
    expect(Object.isFrozen(CEE_SHORT_LABELS)).toBe(true)
  })

  it('tous les codes publiés dans CEE_OPERATIONS_WITH_GUIDE ont un libellé', () => {
    for (const code of CEE_OPERATIONS_WITH_GUIDE) {
      expect(CEE_SHORT_LABELS[code], `missing label for ${code}`).toBeTruthy()
      expect(CEE_SHORT_LABELS[code].length).toBeGreaterThan(5)
    }
  })

  it('aucun libellé vide ou placeholder', () => {
    for (const [code, label] of Object.entries(CEE_SHORT_LABELS)) {
      expect(label, `empty label for ${code}`).toBeTruthy()
      expect(label.toLowerCase()).not.toContain('todo')
      expect(label.toLowerCase()).not.toContain('undefined')
    }
  })

  it('les codes respectent le pattern BAR-(EN|TH|SE)-NNN', () => {
    for (const code of Object.keys(CEE_SHORT_LABELS)) {
      expect(code).toMatch(/^BAR-(EN|TH|SE)-\d{3}$/)
    }
  })
})

describe('getCeeShortLabel — fail-open', () => {
  it('retourne le libellé pour un code valide', () => {
    expect(getCeeShortLabel('BAR-TH-171')).toBe('Pompe à chaleur air/eau haute performance')
  })

  it('case-insensitive', () => {
    expect(getCeeShortLabel('bar-th-171')).toBe(getCeeShortLabel('BAR-TH-171'))
    expect(getCeeShortLabel('Bar-Th-171')).toBe(getCeeShortLabel('BAR-TH-171'))
  })

  it('fallback = code en majuscules si pas de libellé (fail-open, jamais undefined)', () => {
    expect(getCeeShortLabel('BAR-XX-999')).toBe('BAR-XX-999')
    expect(getCeeShortLabel('bar-xx-999')).toBe('BAR-XX-999')
  })
})

describe('Single source — cohérence cross-module', () => {
  it('service-guides-map.__internal.CEE_SHORT_LABELS est identique à shared-labels', () => {
    // Tous les codes de CEE_SHORT_LABELS doivent être présents dans
    // __internal.CEE_SHORT_LABELS (qui ré-exporte la même ref).
    for (const code of Object.keys(CEE_SHORT_LABELS)) {
      expect(SERVICE_GUIDES_INTERNAL.CEE_SHORT_LABELS[code]).toBe(CEE_SHORT_LABELS[code])
    }
  })

  it('tous les codes mappés dans CEE_CODE_TO_RGE_SERVICES ont un libellé court', () => {
    for (const code of Object.keys(SERVICE_GUIDES_INTERNAL.CEE_CODE_TO_RGE_SERVICES)) {
      expect(CEE_SHORT_LABELS[code], `missing label for mapped code ${code}`).toBeTruthy()
    }
  })
})
