import { describe, expect, it } from 'vitest'
import {
  formatHourlyRange,
  getSpecialtyHourlyRange,
  resolveProviderPricing,
} from './specialty-pricing'

// U+00A0 (NBSP) — see `formatHourlyRange` JSDoc. Built via fromCharCode to
// keep the source file free of irregular whitespace (eslint
// `no-irregular-whitespace`).
const NBSP = String.fromCharCode(0xa0)

describe('getSpecialtyHourlyRange', () => {
  it('returns the canonical plombier range', () => {
    expect(getSpecialtyHourlyRange('plombier')).toEqual({ min: 50, max: 70 })
  })

  it('is case-insensitive', () => {
    expect(getSpecialtyHourlyRange('PLOMBIER')).toEqual({ min: 50, max: 70 })
  })

  it('returns the default range for unknown specialties', () => {
    expect(getSpecialtyHourlyRange('astronaute')).toEqual({ min: 35, max: 60 })
  })

  it('returns the default range when input is empty / null', () => {
    expect(getSpecialtyHourlyRange('')).toEqual({ min: 35, max: 60 })
    expect(getSpecialtyHourlyRange(null)).toEqual({ min: 35, max: 60 })
    expect(getSpecialtyHourlyRange(undefined)).toEqual({ min: 35, max: 60 })
  })
})

describe('resolveProviderPricing', () => {
  it('uses the provider rates when both min and max are set', () => {
    expect(
      resolveProviderPricing({ hourlyRateMin: 55, hourlyRateMax: 75, specialty: 'plombier' })
    ).toEqual({ kind: 'provider', min: 55, max: 75 })
  })

  it('uses min as both bounds when only min is set', () => {
    expect(
      resolveProviderPricing({ hourlyRateMin: 60, hourlyRateMax: null, specialty: 'plombier' })
    ).toEqual({ kind: 'provider', min: 60, max: 60 })
  })

  it('falls back to specialty median when both are null', () => {
    expect(
      resolveProviderPricing({ hourlyRateMin: null, hourlyRateMax: null, specialty: 'electricien' })
    ).toEqual({ kind: 'specialty', min: 45, max: 65 })
  })

  it('ignores zero rates (treats them as unset)', () => {
    expect(
      resolveProviderPricing({ hourlyRateMin: 0, hourlyRateMax: 0, specialty: 'plombier' })
    ).toEqual({ kind: 'specialty', min: 50, max: 70 })
  })
})

describe('formatHourlyRange', () => {
  it('renders an en-dash range when min !== max', () => {
    expect(formatHourlyRange({ min: 50, max: 70 })).toBe(`50–70${NBSP}€/h`)
  })

  it('collapses to a single value when min === max', () => {
    expect(formatHourlyRange({ min: 50, max: 50 })).toBe(`50${NBSP}€/h`)
  })
})
