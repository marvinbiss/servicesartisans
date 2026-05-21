/**
 * Public surface — deterministic CEE 2026 calculator.
 *
 * Companion du barrel MPR (src/lib/aides/index.ts, Ralph 12).
 *
 * Conserve les exports existants du module CEE (catalogue, climate-zones,
 * delegataires, dispatcher, market-prices, etc.) accessibles via leurs
 * modules directs sous `@/lib/cee/...`. Ce barrel n'expose que les nouveaux
 * exports du calculator déterministe pour ne pas casser les imports actuels
 * de la base de code SA.
 */

export type {
  GesteCEE,
  Geste,
  MenageCategorie,
  ZoneClimatique,
  TypeLogement,
  ForfaitKwhCumac,
  BonusCoupDePouce,
  CumulRule,
  CalculCEEInput,
  CalculCEEResult,
} from './types'

export {
  SOURCES_CEE,
  getSourceCEE,
  isPlaceholderSourceCEE,
  type SourceRefCEE,
} from './__sources-cee'

export {
  FORFAITS_CEE_2026,
  BONUS_COUP_DE_POUCE_2026,
  CUMUL_RULES_2026,
  ALL_GESTES_CEE,
  ALL_MENAGE_CATEGORIES_CEE,
  ALL_ZONES_CLIMATIQUES,
  ALL_TYPE_LOGEMENT,
  getForfait,
  getBonus,
  getCumul,
} from './forfaits-cee-2026'

export { zoneClimatiqueForDept } from './zones-climatiques'

export { PRIX_MARCHE_CEE_2026 } from './prix-marche'

export { computeCEEAmount } from './calculator-cee'
