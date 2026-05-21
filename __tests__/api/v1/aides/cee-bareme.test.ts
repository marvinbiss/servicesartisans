/**
 * Tests — GET /api/v1/aides/cee-bareme
 *
 * v0 : la plupart des gestes retournent `eligible:false reason:"forfait
 * paramétrique..."` (cf. forfaits-cee-2026 — kwhCumac=null partout). On
 * teste donc principalement la validation des inputs + le contrat de la
 * réponse `eligible:false` (qui est la branche dominante v0), le shape
 * Schema.org Dataset, et les headers cache/license.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    // eslint-disable-next-line no-console
    error: (...a: unknown[]) => console.log('LOGGER.ERROR:', ...a),
  },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 599,
    resetTime: Date.now() + 60_000,
  }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { GET } from '@/app/api/v1/aides/cee-bareme/route'
import { checkRateLimit } from '@/lib/rate-limiter'

function buildRequest(qs: Record<string, string> = {}): NextRequest {
  const url = new URL('https://servicesartisans.fr/api/v1/aides/cee-bareme')
  for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, v)
  return new NextRequest(url)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    remaining: 599,
    resetTime: Date.now() + 60_000,
  })
})

describe('GET /api/v1/aides/cee-bareme — validation', () => {
  it('returns 400 INVALID_PARAMS when no params provided', async () => {
    const res = await GET(buildRequest())
    expect(res.status).toBe(400)
    const body = (await res.json()) as {
      error: { code: string; errors: Array<{ field: string }> }
    }
    expect(body.error.code).toBe('INVALID_PARAMS')
    const fields = body.error.errors.map((e) => e.field)
    expect(fields).toEqual(
      expect.arrayContaining(['geste', 'zone_climatique', 'type_logement', 'menage_categorie'])
    )
  })

  it('rejects zone_climatique that is not H1|H2|H3', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H4',
        type_logement: 'maison_individuelle',
        menage_categorie: 'tres_modeste',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'zone_climatique')).toBe(true)
  })

  it('rejects type_logement that is not maison_individuelle|appartement', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H1',
        type_logement: 'chateau',
        menage_categorie: 'tres_modeste',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'type_logement')).toBe(true)
  })

  it('rejects menage_categorie invalid value', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H1',
        type_logement: 'maison_individuelle',
        menage_categorie: 'riche',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'menage_categorie')).toBe(true)
  })
})

describe('GET /api/v1/aides/cee-bareme — happy path (v0 paramétrique branch)', () => {
  it('returns 200 with eligible:false + reason for pac_air_eau (forfait paramétrique v0)', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H1',
        type_logement: 'maison_individuelle',
        menage_categorie: 'tres_modeste',
      })
    )
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.log('DEBUG body:', await res.clone().text())
    }
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      result: { eligible: boolean; reason?: string }
    }
    // v0 : kwhCumac=null sur tous les forfaits, donc eligible:false attendu.
    expect(body.result.eligible).toBe(false)
    expect(typeof body.result.reason).toBe('string')
    expect(body.result.reason!.length).toBeGreaterThan(0)
  })

  it('echoes input back in response', async () => {
    const res = await GET(
      buildRequest({
        geste: 'isolation_combles',
        zone_climatique: 'H2',
        type_logement: 'appartement',
        menage_categorie: 'modeste',
      })
    )
    const body = (await res.json()) as {
      input: { geste: string; zone: string; typeLogement: string; menageCategorie: string }
    }
    expect(body.input.geste).toBe('isolation_combles')
    expect(body.input.zone).toBe('H2')
    expect(body.input.typeLogement).toBe('appartement')
    expect(body.input.menageCategorie).toBe('modeste')
  })

  it('response embeds Schema.org Dataset envelope', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H1',
        type_logement: 'maison_individuelle',
        menage_categorie: 'tres_modeste',
      })
    )
    const body = (await res.json()) as Record<string, unknown>
    expect(body['@context']).toBe('https://schema.org')
    expect(body['@type']).toBe('Dataset')
    expect(body.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect((body['@id'] as string).includes('/api/v1/aides/cee-bareme')).toBe(true)
  })
})

describe('GET /api/v1/aides/cee-bareme — headers', () => {
  it('emits Cache-Control public max-age=3600 swr=86400 + X-License CC-BY-4.0', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H1',
        type_logement: 'maison_individuelle',
        menage_categorie: 'tres_modeste',
      })
    )
    const cc = res.headers.get('cache-control') ?? ''
    expect(cc).toContain('public')
    expect(cc).toContain('max-age=3600')
    expect(cc).toContain('stale-while-revalidate=86400')
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
    expect(res.headers.get('x-snapshot-date')).toBe('2026-04-15')
    expect(res.headers.get('x-source')).toBeTruthy()
  })
})

describe('GET /api/v1/aides/cee-bareme — rate-limit', () => {
  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        zone_climatique: 'H1',
        type_logement: 'maison_individuelle',
        menage_categorie: 'tres_modeste',
      })
    )
    expect(res.status).toBe(429)
  })
})
