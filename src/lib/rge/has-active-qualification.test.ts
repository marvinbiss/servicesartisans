import { describe, it, expect } from 'vitest'
import {
  hasActiveRgeQualification,
  type RgeQualification,
} from '@/lib/rge/has-active-qualification'

const futureDate = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
const pastDate = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()

const buildQualif = (overrides: Partial<RgeQualification> = {}): RgeQualification => ({
  code: 'QB-5911',
  nom: 'Qualibat 5911',
  organisme: 'Qualibat',
  domaine: null,
  meta_domaine: null,
  date_debut: '2024-01-01',
  date_fin: futureDate,
  url: null,
  ...overrides,
})

describe('hasActiveRgeQualification', () => {
  it('retourne true si au moins une qualif a date_fin > now', () => {
    expect(hasActiveRgeQualification([buildQualif()])).toBe(true)
  })

  it('retourne false si toutes les qualifs sont expirées', () => {
    expect(hasActiveRgeQualification([buildQualif({ date_fin: pastDate })])).toBe(false)
  })

  it('retourne true si une qualif sur deux est active', () => {
    expect(
      hasActiveRgeQualification([
        buildQualif({ date_fin: pastDate }),
        buildQualif({ date_fin: futureDate, code: 'QB-7131' }),
      ])
    ).toBe(true)
  })

  it('retourne false pour null / undefined / tableau vide', () => {
    expect(hasActiveRgeQualification(null)).toBe(false)
    expect(hasActiveRgeQualification(undefined)).toBe(false)
    expect(hasActiveRgeQualification([])).toBe(false)
  })

  it('rejette date_fin manquante ou non parsable', () => {
    expect(
      hasActiveRgeQualification([
        buildQualif({ date_fin: '' }),
        buildQualif({ date_fin: 'not-a-date' }),
      ])
    ).toBe(false)
  })

  it("accepte un argument 'now' explicite (testabilité)", () => {
    const fixedNow = Date.parse('2026-05-07T00:00:00Z')
    expect(hasActiveRgeQualification([buildQualif({ date_fin: '2027-01-01' })], fixedNow)).toBe(
      true
    )
    expect(hasActiveRgeQualification([buildQualif({ date_fin: '2024-01-01' })], fixedNow)).toBe(
      false
    )
  })
})
