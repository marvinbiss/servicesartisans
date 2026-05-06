/**
 * Tests d'intégration middleware — HTTP 410 sur slugs invalides.
 *
 * On ne boote pas Next.js ; on importe directement l'export `middleware`
 * et on fournit un NextRequest minimaliste. Le middleware fait plusieurs
 * choses (auth, CSP, rate limit) — on vérifie juste que la court-circuit
 * Gone-path tire AVANT tout ça et retourne 410 avec les bons headers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

// Mocks légers : on ne veut pas que l'auth/DB/session refresh déclenche.
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
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

/**
 * Minimal NextFetchEvent stub — le middleware n'appelle que waitUntil pour
 * le logging Googlebot (fire-and-forget).
 */
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
})

describe('middleware Gone 410 — slugs invalides', () => {
  it('service inconnu → 410 Gone avec headers noindex', async () => {
    const res = await middleware(makeRequest('/services/coiffeur/paris'), makeEvent())
    expect(res.status).toBe(410)
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400')
  })

  it('ville malformée (MAJ) → 410', async () => {
    const res = await middleware(makeRequest('/services/plombier/Paris'), makeEvent())
    expect(res.status).toBe(410)
  })

  it('RGE service non éligible → 410', async () => {
    const res = await middleware(makeRequest('/rge/serrurier/paris'), makeEvent())
    expect(res.status).toBe(410)
  })

  // 2026-05-07 — `bar-th-104` (lowercase) est VALIDE : Next.js sert lowercase,
  // sitemap émet lowercase. Cf. CEE_OPERATION_RE avec flag /i.
  // Voir post-mortem 2026-05-06.
  it('CEE operation vraiment invalide → 410', async () => {
    const res = await middleware(makeRequest('/cee/XYZ-TH-999/paris'), makeEvent())
    expect(res.status).toBe(410)
  })

  it('artisans-rge avec ville invalide → 410', async () => {
    const res = await middleware(makeRequest('/artisans-rge/XXX-'), makeEvent())
    expect(res.status).toBe(410)
  })
})

describe('middleware Gone 410 — passthrough', () => {
  it('service valide + ville valide → pas 410 (passe à la logique suivante)', async () => {
    const res = await middleware(makeRequest('/services/plombier/paris'), makeEvent())
    expect(res.status).not.toBe(410)
  })

  it('RGE valide + ville valide → pas 410', async () => {
    const res = await middleware(makeRequest('/rge/chauffagiste/lyon'), makeEvent())
    expect(res.status).not.toBe(410)
  })

  it('CEE valide + ville valide → pas 410', async () => {
    const res = await middleware(makeRequest('/cee/BAR-TH-104/paris'), makeEvent())
    expect(res.status).not.toBe(410)
  })

  it('homepage → pas 410', async () => {
    const res = await middleware(makeRequest('/'), makeEvent())
    expect(res.status).not.toBe(410)
  })

  it('route non-dynamique → pas 410', async () => {
    const res = await middleware(makeRequest('/tarifs'), makeEvent())
    expect(res.status).not.toBe(410)
  })

  it('fiche artisan (3 segments) passe à travers', async () => {
    const res = await middleware(makeRequest('/services/plombier/paris/aBcDeF'), makeEvent())
    expect(res.status).not.toBe(410)
  })
})

describe('middleware Gone 410 — méthodes HTTP', () => {
  it('POST ne déclenche pas 410 (éviter de casser webhooks hypothétiques)', async () => {
    const res = await middleware(makeRequest('/services/coiffeur/paris', 'POST'), makeEvent())
    expect(res.status).not.toBe(410)
  })

  it("HEAD déclenche bien 410 (les crawlers l'utilisent)", async () => {
    const res = await middleware(makeRequest('/services/coiffeur/paris', 'HEAD'), makeEvent())
    expect(res.status).toBe(410)
  })
})
