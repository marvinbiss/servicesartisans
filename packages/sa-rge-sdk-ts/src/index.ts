/**
 * Public entry point for @servicesartisans/rge-sdk.
 *
 * Re-exports the SARgeClient class, public types, and the typed error
 * hierarchy. Internal modules (./internal/*) are not re-exported.
 */

export { SARgeClient, DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS, SDK_VERSION } from './client.js'
export type { SARgeClientConfig } from './client.js'
export type {
  ApiMeta,
  AskCitedSource,
  AskInput,
  AskResult,
  CeeBaremeInput,
  CeeBaremeResult,
  CumulRule,
  CumulRulesResult,
  Geste,
  MenageCategorie,
  MprBaremeInput,
  MprBaremeResult,
  RgeLookupResult,
  RgeQualification,
  RgeSearchHit,
  RgeSearchResult,
  TypeLogement,
  ZoneClimatique,
  ZoneRGE,
} from './types.js'
export {
  SARgeError,
  SARgeNetworkError,
  SARgeRateLimitError,
  SARgeServiceUnavailableError,
  SARgeValidationError,
} from './errors.js'
export type { SARgeErrorOptions } from './errors.js'
