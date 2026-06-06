/**
 * Régression — normalisation lowercase du middleware vs chemins case-sensitive.
 *
 * Incident prod 2026-06-06 : les tokens d'invitation avis (base64url, casse
 * significative) étaient détruits par le 301 lowercase :
 *   - POST /api/reviews/submit-invitation/{Token} → 301 → fetch rejoue en GET → 405
 *   - GET /invitation-avis/{Token} → 301 → token minusculisé → hash SHA256 ≠ DB
 *     → « Invitation introuvable » (flywheel reviews mort en prod)
 *
 * Le middleware ne doit JAMAIS lowercaser /api/** ni /invitation-avis/**.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async () => {
    const { NextResponse } = await import('next/server')
    return NextResponse.next()
  }),
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, resetTime: 0 })),
  getRateLimitConfig: vi.fn(() => ({ max: 100, windowMs: 60_000 })),
  getRateLimitKey: vi.fn(() => 'test-key'),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

function makeEvent() {
  return {
    waitUntil: vi.fn(),
    sourcePage: '/',
  } as unknown as import('next/server').NextFetchEvent
}

function makeRequest(pathname: string, method = 'GET'): NextRequest {
  return new NextRequest(`https://servicesartisans.fr${pathname}`, { method })
}

beforeEach(() => {
  vi.clearAllMocks()
  // Le 301 canonique est gated NODE_ENV=production (middleware.ts:~255)
  vi.stubEnv('NODE_ENV', 'production')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

const MIXED_TOKEN = 'Ab3xY9_zQ-7LmN0pRsTuVwXyZ12345AbCdEfGhIjKlM'

describe('middleware canonical lowercase — exclusions case-sensitive', () => {
  it('POST /api/reviews/submit-invitation/{token majuscules} ne redirige pas', async () => {
    const res = await middleware(
      makeRequest(`/api/reviews/submit-invitation/${MIXED_TOKEN}`, 'POST'),
      makeEvent()
    )
    expect([301, 302, 307, 308]).not.toContain(res.status)
  })

  it('GET /invitation-avis/{token majuscules} ne redirige pas', async () => {
    const res = await middleware(makeRequest(`/invitation-avis/${MIXED_TOKEN}`), makeEvent())
    expect([301, 302, 307, 308]).not.toContain(res.status)
  })

  it('GET /api/V1/Rge/Lookup ne redirige pas (API jamais lowercasée)', async () => {
    const res = await middleware(makeRequest('/api/V1/Rge/Lookup'), makeEvent())
    expect([301, 302, 307, 308]).not.toContain(res.status)
  })

  it('page publique mixed-case → 301 lowercase conservé (SEO)', async () => {
    const res = await middleware(makeRequest('/Services/Plombier/Lyon/extra/Page'), makeEvent())
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(
      'https://servicesartisans.fr/services/plombier/lyon/extra/page'
    )
  })

  it('publicId artisan mixed-case toujours exclu (régression existante)', async () => {
    const res = await middleware(makeRequest('/services/plombier/lyon/AbC123xYz'), makeEvent())
    expect([301, 302, 307, 308]).not.toContain(res.status)
  })
})
