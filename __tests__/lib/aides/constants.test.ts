import { describe, expect, it } from 'vitest'

import {
  AIDES_LAST_REVIEWED,
  AIDES_DISCLAIMER,
  CEE,
  CUMUL_PAC,
  ECO_PTZ,
  MAPRIMERENOV,
  formatEur,
} from '@/lib/aides/constants'
import { aidesBySlug } from '@/lib/aides/aides-catalog'

/** Normalise tous types d'espaces (regular, NBSP U+00A0, narrow NBSP U+202F) en espace simple. */
function normalizeSpaces(s: string): string {
  return s.replace(/[\s\u00a0\u202f]+/g, ' ')
}

describe('aides/constants — YMYL numeric SSoT', () => {
  it('AIDES_LAST_REVIEWED is ISO YYYY-MM-DD', () => {
    expect(AIDES_LAST_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('AIDES_DISCLAIMER mentions france-renov.gouv.fr (legal anchor)', () => {
    expect(AIDES_DISCLAIMER).toMatch(/france-renov\.gouv\.fr/)
  })

  it('MAPRIMERENOV plafonds positives + parcours accompagné > parcours geste', () => {
    expect(MAPRIMERENOV.MAX_PARCOURS_GESTE_EUR).toBeGreaterThan(0)
    expect(MAPRIMERENOV.MAX_PARCOURS_ACCOMPAGNE_EUR).toBeGreaterThan(
      MAPRIMERENOV.MAX_PARCOURS_GESTE_EUR
    )
    expect(MAPRIMERENOV.PAC_AIR_EAU_BLEU_EUR).toBeGreaterThan(MAPRIMERENOV.PAC_AIR_EAU_JAUNE_EUR)
  })

  it('ECO_PTZ plafonds croissants : action seule < bouquet < global', () => {
    expect(ECO_PTZ.MAX_ACTION_SEULE_EUR).toBeLessThan(ECO_PTZ.MAX_BOUQUET_EUR)
    expect(ECO_PTZ.MAX_BOUQUET_EUR).toBeLessThan(ECO_PTZ.MAX_GLOBAL_EUR)
    expect(ECO_PTZ.DURATION_GLOBAL_YEARS).toBeGreaterThanOrEqual(20)
  })

  it('CEE TVA réduite = 5.5 % (taux JO réglementaire)', () => {
    expect(CEE.TVA_REDUITE_PERCENT).toBe(5.5)
    expect(CEE.PAC_COUP_DE_POUCE_MAX_EUR).toBeGreaterThan(0)
  })

  it('CUMUL_PAC coverage <= 100', () => {
    expect(CUMUL_PAC.MAX_COVERAGE_VERY_MODEST_PERCENT).toBeGreaterThan(0)
    expect(CUMUL_PAC.MAX_COVERAGE_VERY_MODEST_PERCENT).toBeLessThanOrEqual(100)
  })
})

describe('aides/constants — alignement avec aides-catalog', () => {
  it('eco-ptz.montants reflète ECO_PTZ.MAX_GLOBAL_EUR', () => {
    const ecoPtz = aidesBySlug['eco-ptz']
    expect(ecoPtz).toBeDefined()
    const globalLine = ecoPtz!.montants.find((m) =>
      /performance énergétique globale/i.test(m.label)
    )
    const expected = normalizeSpaces(formatEur(ECO_PTZ.MAX_GLOBAL_EUR))
    expect(normalizeSpaces(globalLine?.max ?? '')).toContain(expected)
  })

  it('maprimerenov.montants reflète MAPRIMERENOV.MAX_PARCOURS_GESTE_EUR + ACCOMPAGNE', () => {
    const mpr = aidesBySlug['maprimerenov']
    expect(mpr).toBeDefined()
    const labels = normalizeSpaces(mpr!.montants.map((m) => m.max).join(' '))
    expect(labels).toContain(normalizeSpaces(formatEur(MAPRIMERENOV.MAX_PARCOURS_GESTE_EUR)))
    expect(labels).toContain(normalizeSpaces(formatEur(MAPRIMERENOV.MAX_PARCOURS_ACCOMPAGNE_EUR)))
  })

  it('schemaDescription maprimerenov mentionne les deux plafonds', () => {
    const mpr = aidesBySlug['maprimerenov']
    const desc = normalizeSpaces(mpr!.schemaDescription)
    expect(desc).toContain('30 000')
    expect(desc).toContain('70 000')
  })
})

describe('aides/constants — formatEur helper', () => {
  it('formate 30000 en "30 000 €" (espace insécable Intl FR)', () => {
    expect(normalizeSpaces(formatEur(30_000))).toBe('30 000 €')
  })

  it('formate 50000 en "50 000 €"', () => {
    expect(normalizeSpaces(formatEur(50_000))).toBe('50 000 €')
  })

  it('arrondit les décimales (pas de centimes pour aides)', () => {
    const out = formatEur(30_000.49)
    expect(out).not.toContain(',49')
  })
})
