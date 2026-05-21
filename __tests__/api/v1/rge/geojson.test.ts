import { describe, expect, it } from 'vitest'

import type { RgeQualification } from '@/lib/rge/has-active-qualification'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'

const fixedNow = Date.parse('2026-05-21T00:00:00Z')

function qualif(over: Partial<RgeQualification> = {}): RgeQualification {
  return {
    code: 'QualiPAC',
    nom: 'QualiPAC Module Air/Eau',
    organisme: "Qualit'EnR",
    domaine: 'PAC',
    meta_domaine: 'CHA',
    date_debut: '2025-01-01',
    date_fin: '2027-01-01',
    url: null,
    ...over,
  }
}

describe('/api/v1/rge/geojson — active qualif filter', () => {
  it('keeps providers with at least one future-dated qualification', () => {
    expect(hasActiveRgeQualification([qualif({ date_fin: '2027-01-01' })], fixedNow)).toBe(true)
  })

  it('excludes providers whose only qualif expired', () => {
    expect(hasActiveRgeQualification([qualif({ date_fin: '2024-12-31' })], fixedNow)).toBe(false)
  })

  it('excludes providers with missing date_fin', () => {
    expect(
      hasActiveRgeQualification([qualif({ date_fin: '' as unknown as string })], fixedNow)
    ).toBe(false)
  })

  it('handles null/empty qualifications array gracefully', () => {
    expect(hasActiveRgeQualification(null, fixedNow)).toBe(false)
    expect(hasActiveRgeQualification([], fixedNow)).toBe(false)
  })

  it('keeps providers if any one qualif is active even if others expired', () => {
    expect(
      hasActiveRgeQualification(
        [qualif({ date_fin: '2024-12-31' }), qualif({ date_fin: '2027-01-01' })],
        fixedNow
      )
    ).toBe(true)
  })
})
