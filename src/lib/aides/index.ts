/**
 * Public surface — deterministic MaPrimeRénov' 2026 calculator.
 *
 * Conserve les anciens exports (constants, aides-catalog, climate-zones,
 * freshness, dept-hub-data, region-hub-data) accessibles via leurs modules
 * directs (déjà importés en de nombreux endroits sous `@/lib/aides/...`).
 * Ce barrel ajoute uniquement les nouveaux exports du calculator.
 */

export type {
  Geste,
  MenageCategorie,
  Zone,
  BaremeEntry,
  BaremeResult,
  EligibilityInput,
  EligibilityResult,
  PlafondRevenusEntry,
} from './types'

export { SOURCES, getSource, isPlaceholderSource, type SourceRef } from './__sources'

export {
  BAREME_MPR_2026,
  PLAFONDS_REVENUS_2026,
  ALL_GESTES,
  ALL_MENAGE_CATEGORIES,
  getBaremeEntry,
  getPlafonds,
} from './bareme-mpr-2026'

export { zoneForDeptCode, zoneForPostalCode, isIdfDeptCode } from './zone-geographique'

export { determineMenageCategorie, computeMprAmount, checkEligibility } from './calculator'
