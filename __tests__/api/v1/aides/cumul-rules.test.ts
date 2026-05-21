/**
 * Tests — GET /api/v1/aides/cumul-rules
 *
 * Couvre : shape array cumul_rules, contenu PAC air/air, Cache-Control 86400,
 * Schema.org Dataset envelope, headers X-License + X-Snapshot-Date.
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

import { GET } from '@/app/api/v1/aides/cumul-rules/route'
import { checkRateLimit } from '@/lib/rate-limiter'

function buildRequest(): NextRequest {
  return new NextRequest(new URL('https://servicesartisans.fr/api/v1/aides/cumul-rules'))
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    remaining: 599,
    resetTime: Date.now() + 60_000,
  })
})

describe('GET /api/v1/aides/cumul-rules', () => {
  it('returns 200 + array cumul_rules', async () => {
    const res = await GET(buildRequest())
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      cumul_rules: Array<{
        geste: string
        cumulableMPR: boolean
        cumulableEcoPTZ: boolean
        cumulableTVA55: boolean
      }>
    }
    expect(Array.isArray(body.cumul_rules)).toBe(true)
    expect(body.cumul_rules.length).toBeGreaterThan(0)
  })

  it('contains pac_air_air with cumulableMPR=false (cas critique)', async () => {
    const res = await GET(buildRequest())
    const body = (await res.json()) as {
      cumul_rules: Array<{ geste: string; cumulableMPR: boolean }>
    }
    const pacAirAir = body.cumul_rules.find((r) => r.geste === 'pac_air_air')
    expect(pacAirAir).toBeDefined()
    expect(pacAirAir!.cumulableMPR).toBe(false)
  })

  it('contains pac_air_eau with cumulableMPR=true', async () => {
    const res = await GET(buildRequest())
    const body = (await res.json()) as {
      cumul_rules: Array<{ geste: string; cumulableMPR: boolean }>
    }
    const pacAirEau = body.cumul_rules.find((r) => r.geste === 'pac_air_eau')
    expect(pacAirEau).toBeDefined()
    expect(pacAirEau!.cumulableMPR).toBe(true)
  })

  it('emits Cache-Control public max-age=86400 swr=604800', async () => {
    const res = await GET(buildRequest())
    const cc = res.headers.get('cache-control') ?? ''
    expect(cc).toContain('public')
    expect(cc).toContain('max-age=86400')
    expect(cc).toContain('stale-while-revalidate=604800')
  })

  it('emits X-License CC-BY-4.0 + X-Snapshot-Date + X-Source + Schema.org Dataset', async () => {
    const res = await GET(buildRequest())
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
    expect(res.headers.get('x-snapshot-date')).toBe('2026-04-15')
    expect(res.headers.get('x-source')).toBeTruthy()
    const body = (await res.json()) as Record<string, unknown>
    expect(body['@context']).toBe('https://schema.org')
    expect(body['@type']).toBe('Dataset')
    expect(body.license).toBe('https://creativecommons.org/licenses/by/4.0/')
  })

  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await GET(buildRequest())
    expect(res.status).toBe(429)
  })
})
