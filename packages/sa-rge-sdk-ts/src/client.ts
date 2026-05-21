/**
 * SARgeClient — thin typed wrapper around the SA RGE-OS v1 endpoints.
 *
 * One import + two lines integration target:
 *
 *   import { SARgeClient } from '@servicesartisans/rge-sdk'
 *   const sa = new SARgeClient()
 *   const fiche = await sa.rgeLookup('12345678901234')
 *
 * CamelCase API surface; we map to snake_case query params at the HTTP
 * boundary so consumers stay idiomatic TS.
 */

import type {
  AskInput,
  AskResult,
  CeeBaremeInput,
  CeeBaremeResult,
  CumulRulesResult,
  MprBaremeInput,
  MprBaremeResult,
  RgeLookupResult,
  RgeSearchResult,
} from './types.js'
import { httpGet, httpPost, type HttpOptions } from './internal/http.js'

export type SARgeClientConfig = {
  baseUrl?: string
  timeoutMs?: number
  userAgent?: string
}

export const DEFAULT_BASE_URL = 'https://servicesartisans.fr'
export const DEFAULT_TIMEOUT_MS = 30_000
export const SDK_VERSION = '0.1.0'

export class SARgeClient {
  private readonly opts: HttpOptions

  constructor(cfg: SARgeClientConfig = {}) {
    this.opts = {
      baseUrl: cfg.baseUrl ?? DEFAULT_BASE_URL,
      timeoutMs: cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      userAgent: cfg.userAgent ?? `sa-rge-sdk-ts/${SDK_VERSION}`,
    }
  }

  /** Internal: exposes the resolved config for advanced/test use cases. */
  getConfig(): Readonly<HttpOptions> {
    return this.opts
  }

  async rgeLookup(siret: string): Promise<RgeLookupResult> {
    return httpGet<RgeLookupResult>('/api/v1/rge/lookup', { siret }, this.opts)
  }

  async rgeSearch(metier: string, ville: string, limit?: number): Promise<RgeSearchResult> {
    return httpGet<RgeSearchResult>('/api/v1/rge/search', { metier, ville, limit }, this.opts)
  }

  async mprBareme(input: MprBaremeInput): Promise<MprBaremeResult> {
    return httpGet<MprBaremeResult>(
      '/api/v1/aides/mpr-bareme',
      {
        geste: input.geste,
        menage_categorie: input.menageCategorie,
        zone: input.zone,
        rfr: input.rfr,
        nb_personnes: input.nbPersonnes,
      },
      this.opts
    )
  }

  async ceeBareme(input: CeeBaremeInput): Promise<CeeBaremeResult> {
    return httpGet<CeeBaremeResult>(
      '/api/v1/aides/cee-bareme',
      {
        geste: input.geste,
        zone_climatique: input.zoneClimatique,
        type_logement: input.typeLogement,
        menage_categorie: input.menageCategorie,
      },
      this.opts
    )
  }

  async cumulRules(): Promise<CumulRulesResult> {
    return httpGet<CumulRulesResult>('/api/v1/aides/cumul-rules', {}, this.opts)
  }

  async ask(input: AskInput): Promise<AskResult> {
    return httpPost<AskResult>('/api/v1/ask', input, this.opts)
  }

  async fetchSpec(version: string = 'v1.0'): Promise<unknown> {
    return httpGet<unknown>(`/spec/rge/${version}/rge.schema.json`, {}, this.opts)
  }
}
