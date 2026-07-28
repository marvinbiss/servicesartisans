/**
 * Tests — src/lib/ads/google-ads-oci.ts
 *
 * Le format de `conversionDateTime` est la source d'erreur n°1 de l'Offline
 * Conversion Import : un décalage horaire faux fait rejeter la conversion, ou
 * la rattache au mauvais jour (et donc à la mauvaise enchère).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  formatConversionDateTime,
  getAdsConfig,
  isGoogleAdsConfigured,
  getEnabledActionKeys,
} from '@/lib/ads/google-ads-oci'

const REQUIRED_ENV = [
  'GOOGLE_ADS_CUSTOMER_ID',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_REFRESH_TOKEN',
] as const

describe('formatConversionDateTime', () => {
  it('formate en heure de Paris avec offset hiver (+01:00)', () => {
    // 2026-01-15 12:00:00 UTC -> 13:00 à Paris (CET)
    const result = formatConversionDateTime(new Date('2026-01-15T12:00:00Z'))
    expect(result).toBe('2026-01-15 13:00:00+01:00')
  })

  it('gère le passage à l heure d été (+02:00)', () => {
    // 2026-07-15 12:00:00 UTC -> 14:00 à Paris (CEST)
    const result = formatConversionDateTime(new Date('2026-07-15T12:00:00Z'))
    expect(result).toBe('2026-07-15 14:00:00+02:00')
  })

  it('rend minuit comme 00 et non 24', () => {
    // 2026-01-14 23:00:00 UTC -> 2026-01-15 00:00 à Paris
    const result = formatConversionDateTime(new Date('2026-01-14T23:00:00Z'))
    expect(result).toBe('2026-01-15 00:00:00+01:00')
  })

  it('respecte le format exigé par l API Ads', () => {
    const result = formatConversionDateTime(new Date('2026-03-02T08:30:45Z'))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
  })
})

describe('getAdsConfig', () => {
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const key of REQUIRED_ENV) {
      saved[key] = process.env[key]
      delete process.env[key]
    }
    saved.GOOGLE_ADS_CONVERSION_ACTION_LEAD_DISPATCHED =
      process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_DISPATCHED
    saved.GOOGLE_ADS_CONVERSION_ACTION_LEAD_QUOTED =
      process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_QUOTED
    delete process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_DISPATCHED
    delete process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_QUOTED
  })

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })

  it('retourne null si la config est incomplète (no-op propre)', () => {
    expect(getAdsConfig()).toBeNull()
    expect(isGoogleAdsConfigured()).toBe(false)
  })

  it('retourne null dès qu une seule variable requise manque', () => {
    for (const key of REQUIRED_ENV) process.env[key] = 'x'
    delete process.env.GOOGLE_ADS_REFRESH_TOKEN
    expect(getAdsConfig()).toBeNull()
  })

  it('normalise le customer ID en retirant les tirets', () => {
    for (const key of REQUIRED_ENV) process.env[key] = 'x'
    process.env.GOOGLE_ADS_CUSTOMER_ID = '123-456-7890'
    expect(getAdsConfig()?.customerId).toBe('1234567890')
  })

  it('n active que les actions dont le resource name est renseigné', () => {
    for (const key of REQUIRED_ENV) process.env[key] = 'x'
    process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_DISPATCHED =
      'customers/1234567890/conversionActions/1'

    const cfg = getAdsConfig()
    expect(cfg).not.toBeNull()
    expect(getEnabledActionKeys(cfg!)).toEqual(['lead_dispatched'])
  })

  it('ignore une valeur € non numérique au lieu de propager NaN', () => {
    for (const key of REQUIRED_ENV) process.env[key] = 'x'
    const previous = process.env.GOOGLE_ADS_VALUE_LEAD_DISPATCHED_EUR
    process.env.GOOGLE_ADS_VALUE_LEAD_DISPATCHED_EUR = 'quarante'
    expect(getAdsConfig()?.values.lead_dispatched).toBeUndefined()
    if (previous === undefined) delete process.env.GOOGLE_ADS_VALUE_LEAD_DISPATCHED_EUR
    else process.env.GOOGLE_ADS_VALUE_LEAD_DISPATCHED_EUR = previous
  })
})
