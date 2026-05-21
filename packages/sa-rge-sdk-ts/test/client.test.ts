import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS, SARgeClient, SDK_VERSION } from '../src/client.js'
import { SARgeError } from '../src/errors.js'

const fetchMock = vi.fn()

function ok(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getCalledUrl(): string {
  return fetchMock.mock.calls[0]![0] as string
}

function getCalledInit(): RequestInit {
  return fetchMock.mock.calls[0]![1] as RequestInit
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SARgeClient construction', () => {
  it('uses production defaults when no config is provided', () => {
    const c = new SARgeClient()
    const cfg = c.getConfig()
    expect(cfg.baseUrl).toBe(DEFAULT_BASE_URL)
    expect(cfg.timeoutMs).toBe(DEFAULT_TIMEOUT_MS)
    expect(cfg.userAgent).toBe(`sa-rge-sdk-ts/${SDK_VERSION}`)
  })

  it('honors a custom baseUrl, timeoutMs, and userAgent', () => {
    const c = new SARgeClient({
      baseUrl: 'https://staging.example.fr',
      timeoutMs: 5_000,
      userAgent: 'partner-app/2.3',
    })
    const cfg = c.getConfig()
    expect(cfg.baseUrl).toBe('https://staging.example.fr')
    expect(cfg.timeoutMs).toBe(5_000)
    expect(cfg.userAgent).toBe('partner-app/2.3')
  })

  it('sends the SDK User-Agent header on every request', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        siret: 'x',
        nom: 'x',
        ville: 'x',
        departement: 'x',
        qualifications: [],
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient()
    await c.rgeLookup('12345678901234')
    const init = getCalledInit()
    const headers = init.headers as Record<string, string>
    expect(headers['User-Agent']).toBe(`sa-rge-sdk-ts/${SDK_VERSION}`)
  })
})

describe('rgeLookup', () => {
  it('GETs /api/v1/rge/lookup with siret query param', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        siret: '12345678901234',
        nom: 'A',
        ville: 'Paris',
        departement: '75',
        qualifications: [],
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    const out = await c.rgeLookup('12345678901234')
    expect(getCalledUrl()).toBe('https://example.test/api/v1/rge/lookup?siret=12345678901234')
    expect(out.siret).toBe('12345678901234')
  })
})

describe('rgeSearch', () => {
  it('GETs /api/v1/rge/search with metier, ville and optional limit', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        metier: 'plombier',
        ville: 'paris',
        results: [],
        total: 0,
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.rgeSearch('plombier', 'paris', 25)
    const url = getCalledUrl()
    expect(url).toContain('/api/v1/rge/search')
    expect(url).toContain('metier=plombier')
    expect(url).toContain('ville=paris')
    expect(url).toContain('limit=25')
  })

  it('omits limit when not provided', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        metier: 'p',
        ville: 'l',
        results: [],
        total: 0,
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.rgeSearch('plombier', 'lyon')
    expect(getCalledUrl()).not.toContain('limit=')
  })
})

describe('mprBareme', () => {
  it('maps camelCase input to snake_case query params', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        result: { eligible: false },
        input: {},
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.mprBareme({
      geste: 'pac_air_eau',
      menageCategorie: 'modeste',
      zone: 'idf',
      rfr: 22_000,
      nbPersonnes: 3,
    })
    const url = getCalledUrl()
    expect(url).toContain('/api/v1/aides/mpr-bareme')
    expect(url).toContain('geste=pac_air_eau')
    expect(url).toContain('menage_categorie=modeste')
    expect(url).toContain('zone=idf')
    expect(url).toContain('rfr=22000')
    expect(url).toContain('nb_personnes=3')
    expect(url).not.toContain('menageCategorie=')
    expect(url).not.toContain('nbPersonnes=')
  })
})

describe('ceeBareme', () => {
  it('maps camelCase input to snake_case query params', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        result: { eligible: false },
        input: {},
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.ceeBareme({
      geste: 'isolation_combles',
      zoneClimatique: 'H2',
      typeLogement: 'maison_individuelle',
      menageCategorie: 'tres_modeste',
    })
    const url = getCalledUrl()
    expect(url).toContain('/api/v1/aides/cee-bareme')
    expect(url).toContain('geste=isolation_combles')
    expect(url).toContain('zone_climatique=H2')
    expect(url).toContain('type_logement=maison_individuelle')
    expect(url).toContain('menage_categorie=tres_modeste')
    expect(url).not.toContain('zoneClimatique=')
    expect(url).not.toContain('typeLogement=')
  })
})

describe('cumulRules', () => {
  it('GETs /api/v1/aides/cumul-rules with no query params', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ rules: [], _meta: { api_version: 'v1', license: 'CC-BY-4.0' } })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.cumulRules()
    expect(getCalledUrl()).toBe('https://example.test/api/v1/aides/cumul-rules')
  })
})

describe('ask', () => {
  it('POSTs to /api/v1/ask with full body passthrough', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({
        result: { ok: true, answer: 'oui' },
        _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    const payload = {
      query: 'Combien pour une PAC ?',
      classification: 'NUMERIC',
      aidesContext: {
        geste: 'pac_air_eau' as const,
        menageCategorie: 'modeste' as const,
        rfr: 22000,
        nbPersonnes: 3,
        zone: 'idf' as const,
      },
      citedSources: [{ url: 'https://example.fr/x', title: 'x', retrievedAt: '2026-05-21' }],
    }
    await c.ask(payload)
    const init = getCalledInit()
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(payload))
  })
})

describe('fetchSpec', () => {
  it('defaults to v1.0', async () => {
    fetchMock.mockResolvedValueOnce(ok({ $id: 'https://example/rge.schema.json' }))
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.fetchSpec()
    expect(getCalledUrl()).toBe('https://example.test/spec/rge/v1.0/rge.schema.json')
  })

  it('honors a custom version', async () => {
    fetchMock.mockResolvedValueOnce(ok({ $id: 'https://example/rge.schema.json' }))
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await c.fetchSpec('v2.0')
    expect(getCalledUrl()).toBe('https://example.test/spec/rge/v2.0/rge.schema.json')
  })
})

describe('error propagation', () => {
  it('propagates HTTP errors to the caller', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: 'nope' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const c = new SARgeClient({ baseUrl: 'https://example.test' })
    await expect(c.rgeLookup('00000000000000')).rejects.toBeInstanceOf(SARgeError)
  })
})
