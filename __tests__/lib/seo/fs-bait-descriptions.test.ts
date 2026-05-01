import { describe, expect, it } from 'vitest'
import {
  buildUrgenceFsBait,
  buildRenovationFsBait,
  buildTravauxFsBait,
  buildAvisFsBait,
  buildVilleHubFsBait,
  FS_BAIT_MAX_LENGTH,
} from '@/lib/seo/fs-bait-descriptions'

describe('FS-bait descriptions — invariants', () => {
  const baseCtx = {
    providerCount: 42,
    serviceName: 'Plombier',
    locationName: 'Paris',
    year: 2026,
    priceRange: { min: 45, max: 95, unit: '€/h' },
  }

  it('all builders return ≤ 158 chars', () => {
    expect(buildUrgenceFsBait(baseCtx).length).toBeLessThanOrEqual(FS_BAIT_MAX_LENGTH)
    expect(buildRenovationFsBait(baseCtx).length).toBeLessThanOrEqual(FS_BAIT_MAX_LENGTH)
    expect(buildTravauxFsBait(baseCtx).length).toBeLessThanOrEqual(FS_BAIT_MAX_LENGTH)
    expect(buildAvisFsBait(baseCtx).length).toBeLessThanOrEqual(FS_BAIT_MAX_LENGTH)
  })

  it('URGENCE contains 24h + price range when provided', () => {
    const d = buildUrgenceFsBait(baseCtx)
    expect(d).toContain('24h/24')
    expect(d).toContain('45-95 €/h')
  })

  it('RÉNOVATION contains MaPrimeRénov + 11 000 € + RGE', () => {
    const d = buildRenovationFsBait({ ...baseCtx, serviceName: 'Chauffagiste' })
    expect(d).toContain('MaPrimeRénov')
    expect(d).toContain('11 000 €')
    expect(d).toContain('RGE')
  })

  it('TRAVAUX stays neutral (no 24h/24 nor RGE)', () => {
    const d = buildTravauxFsBait({ ...baseCtx, serviceName: 'Peintre' })
    expect(d).not.toContain('24h/24')
    expect(d).not.toContain('RGE')
    expect(d).toContain('SIREN')
  })

  it('AVIS contains comparison signal + review proof', () => {
    const d = buildAvisFsBait({
      ...baseCtx,
      reviewSnippet: 'Note 4.7/5 sur 128 avis vérifiés.',
    })
    expect(d).toContain('Comparez')
    expect(d).toContain('4.7/5')
  })

  it('falls back to "vérifiés" when providerCount is 0', () => {
    const d = buildUrgenceFsBait({ ...baseCtx, providerCount: 0 })
    expect(d).toMatch(/[Pp]lombiers vérifiés/)
  })

  it('omits price when priceRange is null', () => {
    const d = buildTravauxFsBait({ ...baseCtx, priceRange: null })
    expect(d).not.toContain('45-95')
    expect(d).not.toContain('Prix')
  })

  it('truncates with ellipsis on word boundary if input would exceed', () => {
    const longCtx = {
      ...baseCtx,
      locationName: 'Saint-Just-en-Chaussée-sur-Marne-Très-Long-Nom',
      reviewSnippet: 'Note 4.9/5 sur 9999 avis vérifiés ' + 'A'.repeat(50),
    }
    const d = buildUrgenceFsBait(longCtx)
    expect(d.length).toBeLessThanOrEqual(FS_BAIT_MAX_LENGTH)
  })

  it('VILLE hub contains both artisan count and metier count', () => {
    const d = buildVilleHubFsBait({
      providerCount: 1284,
      servicesCount: 46,
      villeName: 'Lyon',
      departementCode: '69',
      year: 2026,
    })
    expect(d).toContain('1284 artisans')
    expect(d).toContain('46 métiers')
    expect(d).toContain('Lyon (69)')
    expect(d.length).toBeLessThanOrEqual(FS_BAIT_MAX_LENGTH)
  })
})
