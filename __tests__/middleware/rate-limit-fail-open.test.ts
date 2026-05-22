/**
 * Tests d'intégration middleware — comportement fail-open / fail-close
 * quand `checkRateLimit` lève (Upstash down / token invalide / timeout).
 *
 * Contexte historique :
 *   - 2026-04-22 : incident Upstash 403 → fail-close dormant → 429 sur
 *     /api/devis + signin. Fix 3ab150da : failOpen aligné côté handlers.
 *   - 2026-04-30 : audit GSC 12 890 pages 5xx → on ajoute ce test pour
 *     **garantir** qu'un futur incident Upstash ne ré-introduit pas de 5xx
 *     sur les buckets failOpen, et qu'on retourne bien 503 (pas 500) sur
 *     les buckets fail-close.
 *
 * Ce qu'on vérifie :
 *   1. Upstash throw + bucket failOpen:true → middleware laisse passer (pas 5xx).
 *   2. Upstash throw + bucket fail-close (payment) → middleware renvoie 503,
 *      jamais 500 (5xx structuré, pas crash).
 *   3. Crawler GET hitting /api/* → rate-limited via bucket `crawler` failOpen
 *      → jamais bloqué par Upstash down.
 *   4. POST sur /api/devis avec UA Googlebot spoofé : pas d'exemption crawler
 *      (mutations sont rate-limited normalement, anti-spoofing).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mocks doivent être déclarés AVANT l'import du module middleware
// (vi.mock est hoisté, mais l'objet exporté est résolu à l'import).
const checkRateLimitMock = vi.fn()

vi.mock('@/lib/rate-limiter', async () => {
  // On ré-exporte les vrais helpers (getRateLimitConfig / getClientIp / RATE_LIMITS)
  // car le middleware appelle getRateLimitConfig pour choisir le bucket,
  // et la vraie table RATE_LIMITS porte les flags failOpen authoritatifs.
  const actual = await vi.importActual<typeof import('@/lib/rate-limiter')>('@/lib/rate-limiter')
  return {
    ...actual,
    checkRateLimit: checkRateLimitMock,
  }
})

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async () => {
    const { NextResponse } = await import('next/server')
    return NextResponse.next()
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

// Import APRÈS les mocks
const middlewareImportPromise = import('@/middleware')

function makeEvent() {
  return {
    waitUntil: vi.fn(),
    sourcePage: '/',
  } as unknown as import('next/server').NextFetchEvent
}

function makeRequest(
  pathname: string,
  init: { method?: string; headers?: Record<string, string> } = {}
): NextRequest {
  return new NextRequest(`https://servicesartisans.fr${pathname}`, {
    method: init.method ?? 'POST',
    headers: {
      // Origin valide pour ne pas être bloqué par le check CSRF du middleware.
      origin: 'https://servicesartisans.fr',
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  checkRateLimitMock.mockReset()
})

describe('middleware rate-limit — fail-open behaviour quand Upstash throw', () => {
  it('Upstash throw sur bucket failOpen:true (/api/devis) → laisse passer (pas 5xx)', async () => {
    // /api/devis est devis bucket → failOpen: true dans RATE_LIMITS.
    // Si Upstash plante, on doit poursuivre le pipeline middleware sans 5xx.
    checkRateLimitMock.mockRejectedValueOnce(new Error('upstash unavailable'))
    const { middleware } = await middlewareImportPromise
    const res = await middleware(makeRequest('/api/devis'), makeEvent())

    // Le middleware ne court-circuite plus → retourne NextResponse.next()
    // avec des headers normaux. Statut = 200 ou (sur Next 14) `null/undefined`
    // selon les versions ; ce qu'on veut surtout : PAS de 5xx structuré.
    expect(res.status).not.toBe(500)
    expect(res.status).not.toBe(503)
    expect(res.status).not.toBe(429)
  })

  it('Upstash throw sur bucket fail-close (/api/payments) → 503 propre (jamais 500)', async () => {
    // /api/payments → bucket payment → failOpen absent (fail-close strict).
    // Quand Upstash throw, middleware DOIT retourner 503 RATE_LIMITER_DOWN
    // au lieu de laisser remonter un 500.
    checkRateLimitMock.mockRejectedValueOnce(new Error('upstash 401 unauthorized'))
    const { middleware } = await middlewareImportPromise
    const res = await middleware(makeRequest('/api/payments/checkout'), makeEvent())

    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.code).toBe('RATE_LIMITER_DOWN')
    expect(res.headers.get('Retry-After')).toBe('30')
  })

  it('GET /api/devis avec UA Googlebot → bucket crawler failOpen, jamais 5xx', async () => {
    // Crawler legitime (GET) → bucket `crawler` failOpen:true.
    // Même si Upstash throw, on doit passer sans 5xx pour ne pas pénaliser le crawl.
    checkRateLimitMock.mockRejectedValueOnce(new Error('upstash timeout'))
    const { middleware } = await middlewareImportPromise
    const res = await middleware(
      makeRequest('/api/devis', {
        method: 'GET',
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      }),
      makeEvent()
    )

    expect(res.status).not.toBe(500)
    expect(res.status).not.toBe(503)
    expect(res.status).not.toBe(429)
  })

  it('POST /api/devis avec UA Googlebot spoofé → AUCUNE exemption crawler', async () => {
    // Anti-spoofing : on n'exempte du rate-limit que GET/HEAD. Une mutation
    // POST avec UA Googlebot doit hit le rate-limit normal du bucket devis.
    // checkRateLimitMock doit être appelé avec la config devis (pas crawler).
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 60_000,
    })
    const { middleware } = await middlewareImportPromise
    await middleware(
      makeRequest('/api/devis', {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      }),
      makeEvent()
    )

    expect(checkRateLimitMock).toHaveBeenCalledOnce()
    const [, config] = checkRateLimitMock.mock.calls[0]
    // devis bucket = 10/min failOpen:true, PAS crawler bucket 600/min.
    expect(config.max).toBe(10)
    expect(config.failOpen).toBe(true)
  })

  it('Upstash retourne allowed:false → middleware retourne 429 (rate-limit normal)', async () => {
    // Sanity check : quand Upstash répond légitimement allowed:false,
    // le middleware doit retourner 429 (comportement rate-limit normal).
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const { middleware } = await middlewareImportPromise
    const res = await middleware(makeRequest('/api/devis'), makeEvent())

    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
  })

  it('Upstash throw sur bucket failOpen sans crash JS : pas de TypeError remontée', async () => {
    // Defense-in-depth : on s'assure que même si checkRateLimit throw une
    // erreur exotique (TypeError, ReferenceError…), le middleware n'expose
    // jamais l'exception au client.
    checkRateLimitMock.mockImplementationOnce(() => {
      throw new TypeError('Cannot read properties of undefined (reading "ok")')
    })
    const { middleware } = await middlewareImportPromise
    // /api/contact → bucket contact failOpen:true
    const res = await middleware(makeRequest('/api/contact'), makeEvent())

    expect(res.status).not.toBe(500)
    expect(res.status).not.toBe(503)
  })
})
