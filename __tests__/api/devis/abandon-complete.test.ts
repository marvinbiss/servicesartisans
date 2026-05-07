/**
 * Tests — POST /api/devis/abandon-complete
 *
 * Couvre :
 *  - 400 si email manquant ou invalide
 *  - 200 + update silencieux si email connu (idempotent)
 *  - 200 même si DB error (logged but doesn't fail user-side)
 *  - 429 si rate limit
 *  - 500 si JSON body invalide (catch externe — pas de safeJsonBody utilisé)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { checkRateLimitMock, loggerErrorMock, updateMock, updateErrorRef } = vi.hoisted(() => {
  const updateErrorRef = { current: null as { message: string } | null }
  return {
    checkRateLimitMock: vi.fn(async () => ({ allowed: true, resetTime: Date.now() + 60_000 })),
    loggerErrorMock: vi.fn(),
    updateMock: vi.fn(async () => ({ error: updateErrorRef.current })),
    updateErrorRef,
  }
})

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: () => '1.2.3.4',
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...a: unknown[]) => loggerErrorMock(...a),
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (_t: string) => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(updateMock),
            })),
          })),
        })),
      })),
    }),
  }),
}))

import { POST } from '@/app/api/devis/abandon-complete/route'

function buildReq(body: unknown, options: { rawBody?: string } = {}): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/devis/abandon-complete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: options.rawBody ?? JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

describe('POST /api/devis/abandon-complete', () => {
  beforeEach(() => {
    updateErrorRef.current = null
    updateMock.mockClear()
    loggerErrorMock.mockClear()
    checkRateLimitMock.mockResolvedValue({ allowed: true, resetTime: Date.now() + 60_000 })
  })

  it('400 si email manquant', async () => {
    const res = await POST(buildReq({}))
    expect(res.status).toBe(400)
  })

  it('400 si email format invalide', async () => {
    const res = await POST(buildReq({ email: 'pas-email' }))
    expect(res.status).toBe(400)
  })

  it('400 si email > 254 chars', async () => {
    const res = await POST(buildReq({ email: 'a'.repeat(250) + '@x.io' }))
    expect(res.status).toBe(400)
  })

  it('200 si email valide → update appelé', async () => {
    const res = await POST(buildReq({ email: 'ok@example.com' }))
    expect(res.status).toBe(200)
    expect(updateMock).toHaveBeenCalled()
  })

  it('200 même si DB error (silent log, pas de fail user)', async () => {
    updateErrorRef.current = { message: 'connection lost' }
    const res = await POST(buildReq({ email: 'silent@example.com' }))
    expect(res.status).toBe(200)
    // logger.error appelé mais user reçoit ok
    expect(loggerErrorMock).toHaveBeenCalled()
  })

  it('429 si rate limit dépassé', async () => {
    checkRateLimitMock.mockResolvedValueOnce({ allowed: false, resetTime: Date.now() + 30_000 })
    const res = await POST(buildReq({ email: 'rl@example.com' }))
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeDefined()
  })

  it('500 si JSON body invalide (request.json throw catché par try outer)', async () => {
    const res = await POST(buildReq({}, { rawBody: 'not-json{{' }))
    expect(res.status).toBe(500)
  })
})
