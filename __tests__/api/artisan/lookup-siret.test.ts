import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  })),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 19,
    resetTime: Date.now() + 60_000,
  }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { GET } from '@/app/api/artisan/lookup-siret/route'
import { checkRateLimit } from '@/lib/rate-limiter'

function buildRequest(siret: string | null): NextRequest {
  const url = new URL(`https://example.com/api/artisan/lookup-siret`)
  if (siret !== null) url.searchParams.set('siret', siret)
  return new NextRequest(url)
}

describe('GET /api/artisan/lookup-siret — input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.INSEE_API_TOKEN
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 19,
      resetTime: Date.now() + 60_000,
    })
  })

  it('rejette 400 si le SIRET est absent', async () => {
    const res = await GET(buildRequest(null))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('SIRET_REQUIRED')
  })

  it('rejette 400 si le format est invalide (12 chiffres)', async () => {
    const res = await GET(buildRequest('123456789012'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('SIRET_FORMAT')
  })

  it('rejette 400 sur checksum Luhn invalide', async () => {
    // 14 chiffres, checksum KO
    const res = await GET(buildRequest('12345678901234'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('SIRET_CHECKSUM')
  })

  it('renvoie 404 NOT_IN_REGISTRY si pas en DB et pas de token INSEE', async () => {
    // SIRET valide (checksum Luhn OK) : 73282932000074 (INSEE exemple public)
    const res = await GET(buildRequest('73282932000074'))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error.code).toBe('NOT_IN_REGISTRY')
  })

  it('tolère les espaces dans le SIRET', async () => {
    const res = await GET(buildRequest('732 829 320 00074'))
    expect(res.status).toBe(404) // NOT_IN_REGISTRY car pas de token + pas en DB
  })
})

describe('GET /api/artisan/lookup-siret — security headers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.INSEE_API_TOKEN
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 19,
      resetTime: Date.now() + 60_000,
    })
  })

  it('applique Cache-Control private no-store sur 200 et 404 (PII leak prevention)', async () => {
    // 404 NOT_IN_REGISTRY (no token, no DB match)
    const res404 = await GET(buildRequest('73282932000074'))
    expect(res404.status).toBe(404)
    expect(res404.headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
    expect(res404.headers.get('Vary')).toBe('Cookie')

    // 200 success (provider trouvé en DB)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'uuid-1',
                slug: 'artisan-slug',
                name: 'Artisan Test',
                siret: '73282932000074',
                address_city: 'Paris',
                address_region: 'IDF',
                postal_code: '75001',
                address_street: '1 rue Test',
                is_active: true,
                claimed_at: null,
                rge_qualifications: [],
                rge_valid_until: null,
              },
              error: null,
            }),
          })),
        })),
      })),
      // Cast to any — the admin client shape is only partially used in this route
    } as unknown as ReturnType<typeof createAdminClient>)

    const res200 = await GET(buildRequest('73282932000074'))
    expect(res200.status).toBe(200)
    expect(res200.headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
    expect(res200.headers.get('Vary')).toBe('Cookie')
  })
})

describe('GET /api/artisan/lookup-siret — rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.INSEE_API_TOKEN
  })

  it('renvoie 429 RATE_LIMITED quand la limite est dépassée', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })

    const res = await GET(buildRequest('73282932000074'))
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('RATE_LIMITED')
    expect(body.error.message).toContain('Trop de requêtes')
    expect(res.headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
  })

  it('applique le rate limit AVANT la validation Zod (SIRET invalide + RL = 429)', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })

    // SIRET vide → si RL passait après Zod, renverrait 400 SIRET_REQUIRED.
    // On attend 429 car le RL doit court-circuiter en premier.
    const res = await GET(buildRequest(null))
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error.code).toBe('RATE_LIMITED')
  })

  it('utilise la clé lookup-siret:${ip} avec la fenêtre 60s / max 20', async () => {
    await GET(buildRequest('73282932000074'))
    expect(checkRateLimit).toHaveBeenCalledWith(
      expect.stringMatching(/^lookup-siret:/),
      expect.objectContaining({ window: 60_000, max: 20 })
    )
  })
})
