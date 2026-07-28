/**
 * Tests — src/lib/ads/click-ids.ts
 *
 * Enjeu : un click-ID perdu = une conversion hors ligne impossible à remonter,
 * donc un Smart Bidding aveugle. Un click-ID mal formé accepté = un appel API
 * Google Ads rejeté. Les deux se testent ici.
 */

import { describe, it, expect } from 'vitest'
import { parseAdsAttribution, hasClickId } from '@/lib/ads/click-ids'

describe('parseAdsAttribution', () => {
  it('extrait un gclid standard', () => {
    const result = parseAdsAttribution('?gclid=Cj0KCQjw_abc-123.def_456')
    expect(result.gclid).toBe('Cj0KCQjw_abc-123.def_456')
  })

  it('extrait gbraid et wbraid (parcours iOS sans cookie tiers)', () => {
    expect(parseAdsAttribution('?gbraid=abc123').gbraid).toBe('abc123')
    expect(parseAdsAttribution('?wbraid=xyz789').wbraid).toBe('xyz789')
  })

  it('accepte une query string sans le "?" initial', () => {
    expect(parseAdsAttribution('gclid=abc123').gclid).toBe('abc123')
  })

  it('extrait les paramètres utm', () => {
    const result = parseAdsAttribution(
      '?utm_source=google&utm_medium=cpc&utm_campaign=pac-aides&utm_term=pompe+a+chaleur'
    )
    expect(result.utm_source).toBe('google')
    expect(result.utm_medium).toBe('cpc')
    expect(result.utm_campaign).toBe('pac-aides')
    expect(result.utm_term).toBe('pompe a chaleur')
  })

  it('rejette un click-ID contenant des caractères hors charset', () => {
    // Une injection ne doit jamais atteindre le payload API Google Ads.
    expect(parseAdsAttribution('?gclid=<script>alert(1)</script>').gclid).toBeUndefined()
    expect(parseAdsAttribution("?gclid=abc'; DROP TABLE--").gclid).toBeUndefined()
  })

  it('rejette un click-ID au-delà de 512 caractères', () => {
    expect(parseAdsAttribution(`?gclid=${'a'.repeat(513)}`).gclid).toBeUndefined()
    expect(parseAdsAttribution(`?gclid=${'a'.repeat(512)}`).gclid).toBe('a'.repeat(512))
  })

  it('tronque une valeur utm trop longue au lieu de la rejeter', () => {
    // Perdre l'attribution fine est acceptable ; perdre le lead ne l'est pas.
    const result = parseAdsAttribution(`?utm_campaign=${'x'.repeat(300)}`)
    expect(result.utm_campaign).toHaveLength(120)
  })

  it('ignore les paramètres absents plutôt que de produire des clés vides', () => {
    const result = parseAdsAttribution('?foo=bar')
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('ignore un paramètre présent mais vide', () => {
    expect(parseAdsAttribution('?gclid=&utm_source=').gclid).toBeUndefined()
    expect(parseAdsAttribution('?gclid=&utm_source=').utm_source).toBeUndefined()
  })

  it('neutralise les caractères de contrôle dans une valeur utm', () => {
    const result = parseAdsAttribution(`?utm_source=goo${String.fromCharCode(0)}gle`)
    expect(result.utm_source).toBe('google')
  })
})

describe('hasClickId', () => {
  it('détecte chacun des trois identifiants', () => {
    expect(hasClickId({ gclid: 'a' })).toBe(true)
    expect(hasClickId({ gbraid: 'a' })).toBe(true)
    expect(hasClickId({ wbraid: 'a' })).toBe(true)
  })

  it('retourne false quand seuls des utm sont présents', () => {
    expect(hasClickId({ utm_source: 'google', utm_medium: 'cpc' })).toBe(false)
    expect(hasClickId({})).toBe(false)
  })
})
