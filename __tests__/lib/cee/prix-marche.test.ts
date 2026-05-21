import { describe, expect, it } from 'vitest'

import { PRIX_MARCHE_CEE_2026 } from '@/lib/cee/prix-marche'
import { SOURCES_CEE } from '@/lib/cee/__sources-cee'

describe('cee/prix-marche — PRIX_MARCHE_CEE_2026', () => {
  it('is exposed as a const object', () => {
    expect(PRIX_MARCHE_CEE_2026).toBeDefined()
    expect(typeof PRIX_MARCHE_CEE_2026).toBe('object')
  })

  it('range is monotonic : basse <= moyen <= haute', () => {
    expect(PRIX_MARCHE_CEE_2026.fourchetteBasseEurParMWhCumac).toBeLessThanOrEqual(
      PRIX_MARCHE_CEE_2026.prixMoyenEurParMWhCumac
    )
    expect(PRIX_MARCHE_CEE_2026.prixMoyenEurParMWhCumac).toBeLessThanOrEqual(
      PRIX_MARCHE_CEE_2026.fourchetteHauteEurParMWhCumac
    )
  })

  it('average sits within published 2026 EMMY band (8-12 EUR/MWh cumac)', () => {
    expect(PRIX_MARCHE_CEE_2026.prixMoyenEurParMWhCumac).toBeGreaterThanOrEqual(8)
    expect(PRIX_MARCHE_CEE_2026.prixMoyenEurParMWhCumac).toBeLessThanOrEqual(12)
  })

  it('declares a sourceRef pointing to the SOURCES_CEE registry', () => {
    expect(PRIX_MARCHE_CEE_2026.sourceRef).toBe('EMMY_PRIX_MARCHE')
    expect(SOURCES_CEE[PRIX_MARCHE_CEE_2026.sourceRef]).toBeDefined()
  })

  it('declares an ISO 8601 snapshot date (YYYY-MM-DD)', () => {
    expect(PRIX_MARCHE_CEE_2026.snapshot).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // Parse fully — must yield a valid date.
    const parsed = new Date(PRIX_MARCHE_CEE_2026.snapshot)
    expect(Number.isNaN(parsed.getTime())).toBe(false)
  })

  it('snapshot is recent (within 2026 calendar year)', () => {
    expect(PRIX_MARCHE_CEE_2026.snapshot.startsWith('2026-')).toBe(true)
  })
})
