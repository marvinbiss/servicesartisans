/**
 * Tests — GET /api/v1/aides/mpr-bareme
 *
 * Couvre :
 *  - Validation matrix (sans params, geste invalide, zone invalide, rfr neg)
 *  - Happy path : pac_air_eau tres_modeste → eligible + amountEUR 5000
 *  - Non-eligibility : pac_air_air → eligible:false reason mentionne non éligible
 *  - Schema.org Dataset wrapper présent
 *  - Cache-Control, X-License, X-Source, X-Snapshot-Date headers
 *  - Rate-limit 429
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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

import { GET } from '@/app/api/v1/aides/mpr-bareme/route'
import { checkRateLimit } from '@/lib/rate-limiter'

function buildRequest(qs: Record<string, string> = {}): NextRequest {
  const url = new URL('https://servicesartisans.fr/api/v1/aides/mpr-bareme')
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

describe('GET /api/v1/aides/mpr-bareme — validation', () => {
  it('returns 400 INVALID_PARAMS when no params are provided', async () => {
    const res = await GET(buildRequest())
    expect(res.status).toBe(400)
    const body = (await res.json()) as {
      error: { code: string; errors: Array<{ field: string }> }
    }
    expect(body.error.code).toBe('INVALID_PARAMS')
    expect(body.error.errors.length).toBeGreaterThanOrEqual(4)
    const fields = body.error.errors.map((e) => e.field).sort()
    expect(fields).toEqual(
      expect.arrayContaining(['geste', 'menage_categorie', 'zone', 'rfr', 'nb_personnes'])
    )
  })

  it('returns 400 with field=geste when geste enum value is unknown', async () => {
    const res = await GET(
      buildRequest({
        geste: 'not_a_real_geste',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '20000',
        nb_personnes: '2',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as {
      error: { errors: Array<{ field: string; message: string }> }
    }
    const gesteErr = body.error.errors.find((e) => e.field === 'geste')
    expect(gesteErr).toBeDefined()
    expect(gesteErr!.message).toContain('must be one of')
  })

  it('returns 400 when rfr is negative', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '-100',
        nb_personnes: '2',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'rfr')).toBe(true)
  })

  it('returns 400 when zone is missing or invalid', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'unknown_zone',
        rfr: '20000',
        nb_personnes: '2',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'zone')).toBe(true)
  })

  it('returns 400 when nb_personnes is zero (must be >= 1)', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '20000',
        nb_personnes: '0',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'nb_personnes')).toBe(true)
  })
})

describe('GET /api/v1/aides/mpr-bareme — happy path', () => {
  it('returns 200 + eligible result for pac_air_eau tres_modeste', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '2',
      })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      result: { eligible: boolean; amountEUR?: number; sourceRef?: string }
    }
    expect(body.result.eligible).toBe(true)
    expect(body.result.amountEUR).toBe(5000)
    expect(body.result.sourceRef).toBe('ANAH_MAPRIMERENOV')
  })

  it('pac_air_air → eligible:false with reason mentioning non éligible', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_air',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '2',
      })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      result: { eligible: boolean; reason?: string }
    }
    expect(body.result.eligible).toBe(false)
    expect(body.result.reason).toBeTruthy()
    // pac_air_air n'a pas d'entrée bareme → soit "non éligible" soit "Aucune entrée barème"
    expect(body.result.reason!.toLowerCase()).toMatch(/non éligible|aucune entrée/i)
  })

  it('response embeds Schema.org Dataset envelope', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '2',
      })
    )
    const body = (await res.json()) as Record<string, unknown>
    expect(body['@context']).toBe('https://schema.org')
    expect(body['@type']).toBe('Dataset')
    expect(body.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(typeof body['@id']).toBe('string')
    expect((body['@id'] as string).includes('/api/v1/aides/mpr-bareme')).toBe(true)
  })

  it('echoes input back in response', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '3',
      })
    )
    const body = (await res.json()) as {
      input: { geste: string; rfr: number; nbPersonnes: number; zone: string }
    }
    expect(body.input.geste).toBe('pac_air_eau')
    expect(body.input.rfr).toBe(10000)
    expect(body.input.nbPersonnes).toBe(3)
    expect(body.input.zone).toBe('hors_idf')
  })
})

describe('GET /api/v1/aides/mpr-bareme — headers', () => {
  it('emits Cache-Control public max-age=3600 swr=86400', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '2',
      })
    )
    const cc = res.headers.get('cache-control') ?? ''
    expect(cc).toContain('public')
    expect(cc).toContain('max-age=3600')
    expect(cc).toContain('stale-while-revalidate=86400')
  })

  it('emits X-License: CC-BY-4.0 + X-Source + X-Snapshot-Date', async () => {
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '2',
      })
    )
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
    expect(res.headers.get('x-source')).toBeTruthy()
    expect(res.headers.get('x-snapshot-date')).toBe('2026-04-15')
  })
})

describe('GET /api/v1/aides/mpr-bareme — rate-limit', () => {
  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await GET(
      buildRequest({
        geste: 'pac_air_eau',
        menage_categorie: 'tres_modeste',
        zone: 'hors_idf',
        rfr: '10000',
        nb_personnes: '2',
      })
    )
    expect(res.status).toBe(429)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('too_many_requests')
  })
})
