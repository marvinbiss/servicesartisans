/**
 * Tests — POST /api/devis/abandon-tracking
 *
 * Couvre :
 *  - 400 si email manquant ou format invalide
 *  - 400 si service/city pas string ou step hors plage
 *  - 200 + dedup si email déjà tracké < 24h sans completed_at
 *  - 200 + insert si nouveau prospect
 *  - 429 si rate limit dépassé
 *  - 500 si DB error
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ---- mocks ----

const { checkRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(async () => ({ allowed: true, resetTime: Date.now() + 60_000 })),
}))
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: () => '1.2.3.4',
}))

const loggerErrorMock = vi.fn()
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...a: unknown[]) => loggerErrorMock(...a),
  },
}))

// safeJsonBody returns the original behaviour wrapped in a result object
vi.mock('@/lib/api/handler', () => ({
  safeJsonBody: async (req: Request) => {
    try {
      const data = await req.json()
      return { ok: true as const, data }
    } catch {
      return {
        ok: false as const,
        response: NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 }),
      }
    }
  },
}))

// Supabase mock — chainable + dedup-driven `.single()` result
let existingId: string | null = null
let insertError: { message: string } | null = null
const updateMock = vi.fn(async () => ({ error: null }))
const insertMock = vi.fn(async () => ({ error: insertError }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (_t: string) => {
      const q = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn(async () => ({
          data: existingId ? { id: existingId } : null,
          error: existingId ? null : { code: 'PGRST116' },
        })),
        update: vi.fn(() => ({ eq: vi.fn(updateMock) })),
        insert: vi.fn(insertMock),
      }
      return q
    },
  }),
}))

import { POST } from '@/app/api/devis/abandon-tracking/route'

function buildReq(body: unknown): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/devis/abandon-tracking', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

describe('POST /api/devis/abandon-tracking', () => {
  beforeEach(() => {
    existingId = null
    insertError = null
    insertMock.mockClear()
    updateMock.mockClear()
    loggerErrorMock.mockClear()
    checkRateLimitMock.mockResolvedValue({ allowed: true, resetTime: Date.now() + 60_000 })
  })

  it('400 si email manquant', async () => {
    const res = await POST(buildReq({ service: 'plombier' }))
    expect(res.status).toBe(400)
  })

  it('400 si email format invalide', async () => {
    const res = await POST(buildReq({ email: 'pas-un-email' }))
    expect(res.status).toBe(400)
  })

  it('400 si email trop long (> 254)', async () => {
    const res = await POST(buildReq({ email: 'a'.repeat(250) + '@x.io' }))
    expect(res.status).toBe(400)
  })

  it('400 si service pas string', async () => {
    const res = await POST(buildReq({ email: 'a@b.io', service: 42 }))
    expect(res.status).toBe(400)
  })

  it('400 si step hors plage', async () => {
    const res = await POST(buildReq({ email: 'a@b.io', step: 99 }))
    expect(res.status).toBe(400)
  })

  it('200 + insert nouveau prospect', async () => {
    const res = await POST(
      buildReq({ email: 'new@example.com', service: 'plombier', city: 'paris', step: 2 })
    )
    expect(res.status).toBe(200)
    expect(insertMock).toHaveBeenCalled()
    const body = (await (res as Response).json()) as { ok: boolean; deduplicated?: boolean }
    expect(body.ok).toBe(true)
    expect(body.deduplicated).toBeUndefined()
  })

  it('200 + dedup si email tracké < 24h', async () => {
    existingId = 'existing-uuid'
    const res = await POST(buildReq({ email: 'dup@example.com', service: 'plombier', step: 3 }))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { ok: boolean; deduplicated?: boolean }
    expect(body.deduplicated).toBe(true)
    expect(insertMock).not.toHaveBeenCalled()
    expect(updateMock).toHaveBeenCalled()
  })

  it('429 si rate limit dépassé', async () => {
    checkRateLimitMock.mockResolvedValueOnce({ allowed: false, resetTime: Date.now() + 30_000 })
    const res = await POST(buildReq({ email: 'rl@example.com' }))
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeDefined()
  })

  it('500 si insert DB error', async () => {
    insertError = { message: 'duplicate key' }
    const res = await POST(buildReq({ email: 'err@example.com' }))
    expect(res.status).toBe(500)
    expect(loggerErrorMock).toHaveBeenCalled()
  })
})
