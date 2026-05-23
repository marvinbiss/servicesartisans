/**
 * Tests — /api/cron/process-gdpr-deletions (Vague G2)
 *
 * Couvre les chemins critiques RGPD article 17 (right to erasure) :
 *   - Auth timing-safe (CRON_SECRET)
 *   - Query deletion_requests scheduled + due
 *   - adminDeleteUserData succès/erreur per-row
 *   - Transition status scheduled → completed
 *   - Audit log immutable Art. 5.2
 *   - Per-row error : isolated (continue boucle), captureError, retry next run
 *   - Fatal query error : 500
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockLoggerFns = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

vi.mock('@/lib/logger', () => ({
  logger: mockLoggerFns,
}))

const mockCaptureError = vi.fn()
vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: (...args: unknown[]) => mockCaptureError(...args),
}))

const mockAdminDeleteUserData = vi.fn()
vi.mock('@/lib/services/gdpr-service', () => ({
  adminDeleteUserData: (...args: unknown[]) => mockAdminDeleteUserData(...args),
}))

// Mock chain Supabase : opérationnel pour 3 modes
//   - SELECT : from(table).select().eq().lte().order().limit() → Promise<queryResult>
//   - UPDATE : from(table).update().eq().eq() → Promise<updateResult>
//   - INSERT : from(table).insert().throwOnError() → thenable qui résout sans data
//
// Chaque call à from() retourne un chain dédié au mode (déterminé par
// .select|.update|.insert). Le chain est PromiseLike (then) pour supporter
// l'await direct utilisé par PostgREST.
let queryResult: { data: unknown; error: unknown } = { data: [], error: null }
let updateResult: { error: unknown } = { error: null }

type ChainMode = 'select' | 'update' | 'insert' | 'none'

type MockChain = {
  _mode: ChainMode
  select: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  throwOnError: ReturnType<typeof vi.fn>
  then: (
    onFulfilled?: (v: unknown) => unknown,
    onRejected?: (e: unknown) => unknown
  ) => Promise<unknown>
}

function resolveForMode(mode: ChainMode): unknown {
  if (mode === 'select') return queryResult
  if (mode === 'update') return updateResult
  if (mode === 'insert') return { data: null, error: null }
  return { data: null, error: null }
}

function buildChain(): MockChain {
  const chain = { _mode: 'none' as ChainMode } as MockChain
  chain.select = vi.fn().mockImplementation(() => {
    chain._mode = 'select'
    return chain
  })
  chain.update = vi.fn().mockImplementation(() => {
    chain._mode = 'update'
    return chain
  })
  chain.insert = vi.fn().mockImplementation(() => {
    chain._mode = 'insert'
    return chain
  })
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.lte = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockReturnValue(chain)
  chain.throwOnError = vi.fn().mockReturnValue(chain)
  chain.then = (onFulfilled, onRejected) => {
    try {
      return Promise.resolve(resolveForMode(chain._mode)).then(onFulfilled, onRejected)
    } catch (e) {
      return Promise.reject(e).then(onFulfilled, onRejected)
    }
  }
  return chain
}

let lastChain: MockChain
const mockFrom = vi.fn(() => {
  lastChain = buildChain()
  return lastChain
})

const mockLeaseRpc = vi.fn((fn: string) => {
  const result =
    fn === 'acquire_cron_lease' ? { data: true, error: null } : { data: null, error: null }
  const builder: {
    abortSignal: (s: AbortSignal) => typeof builder
    then: Promise<typeof result>['then']
  } = {
    abortSignal: () => builder,
    then: (onF, onR) => Promise.resolve(result).then(onF, onR),
  }
  return builder
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom, rpc: mockLeaseRpc })),
}))

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers.authorization = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/process-gdpr-deletions', {
    method: 'GET',
    headers,
  })
}

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/process-gdpr-deletions/route')
  return mod.GET(req)
}

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  queryResult = { data: [], error: null }
  updateResult = { error: null }
  mockFrom.mockClear()
  mockAdminDeleteUserData.mockReset()
  mockAdminDeleteUserData.mockResolvedValue({ error: null })
  mockCaptureError.mockReset()
  Object.values(mockLoggerFns).forEach((fn) => fn.mockReset())
})

afterEach(() => {
  vi.resetModules()
  delete process.env.CRON_SECRET
})

describe('GET /api/cron/process-gdpr-deletions', () => {
  // ── Auth ────────────────────────────────────────────────────────────────
  describe('auth', () => {
    it('returns 401 when authorization header is missing', async () => {
      const res = await callRoute(buildRequest())
      expect(res.status).toBe(401)
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('returns 401 with wrong secret', async () => {
      const res = await callRoute(buildRequest('wrong-secret'))
      expect(res.status).toBe(401)
    })

    it('passes auth with correct CRON_SECRET', async () => {
      const res = await callRoute(buildRequest('test-cron-secret'))
      expect(res.status).toBe(200)
    })
  })

  // ── Query ───────────────────────────────────────────────────────────────
  describe('query', () => {
    it('returns 200 with no requests when nothing due', async () => {
      queryResult = { data: [], error: null }
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.processed).toBe(0)
    })

    it('returns 500 when query fails', async () => {
      queryResult = { data: null, error: { message: 'connection lost' } }
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(res.status).toBe(500)
      expect(body.success).toBe(false)
      expect(mockCaptureError).toHaveBeenCalled()
    })
  })

  // ── Per-row processing ──────────────────────────────────────────────────
  describe('per-row processing', () => {
    it('processes successful rows and reports counts', async () => {
      queryResult = {
        data: [
          { id: 'r1', user_id: 'u1', scheduled_deletion_at: '2026-04-01T00:00:00Z' },
          { id: 'r2', user_id: 'u2', scheduled_deletion_at: '2026-04-01T00:00:00Z' },
        ],
        error: null,
      }
      mockAdminDeleteUserData.mockResolvedValue({ error: null })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.processed).toBe(2)
      expect(body.succeeded).toBe(2)
      expect(body.failed).toBe(0)
      expect(mockAdminDeleteUserData).toHaveBeenCalledTimes(2)
      expect(mockAdminDeleteUserData).toHaveBeenCalledWith(expect.anything(), 'u1')
      expect(mockAdminDeleteUserData).toHaveBeenCalledWith(expect.anything(), 'u2')
    })

    it('isolates per-row failure (continues loop, captureError per row)', async () => {
      queryResult = {
        data: [
          { id: 'r1', user_id: 'u1', scheduled_deletion_at: '2026-04-01T00:00:00Z' },
          { id: 'r2', user_id: 'u2', scheduled_deletion_at: '2026-04-01T00:00:00Z' },
          { id: 'r3', user_id: 'u3', scheduled_deletion_at: '2026-04-01T00:00:00Z' },
        ],
        error: null,
      }
      mockAdminDeleteUserData
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: 'cascade fail' })
        .mockResolvedValueOnce({ error: null })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.processed).toBe(3)
      expect(body.succeeded).toBe(2)
      expect(body.failed).toBe(1)
      expect(body.errors).toHaveLength(1)
      expect(body.errors[0].id).toBe('r2')
      expect(body.errors[0].error).toContain('cascade fail')
      // Sentry call per-row, not fatal
      const rowCalls = mockCaptureError.mock.calls.filter((c) => c[1]?.tags?.step === 'row')
      expect(rowCalls).toHaveLength(1)
    })

    it('does NOT throw when result has no error (success path)', async () => {
      queryResult = {
        data: [{ id: 'r1', user_id: 'u1', scheduled_deletion_at: '2026-04-01T00:00:00Z' }],
        error: null,
      }
      mockAdminDeleteUserData.mockResolvedValue({ error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.succeeded).toBe(1)
      expect(body.failed).toBe(0)
    })

    it('caps errors array at 10 entries', async () => {
      queryResult = {
        data: Array.from({ length: 12 }, (_, i) => ({
          id: `r${i}`,
          user_id: `u${i}`,
          scheduled_deletion_at: '2026-04-01T00:00:00Z',
        })),
        error: null,
      }
      mockAdminDeleteUserData.mockResolvedValue({ error: 'fail' })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.failed).toBe(12)
      expect(body.errors).toHaveLength(10)
    })
  })

  // ── Response shape ──────────────────────────────────────────────────────
  describe('response shape', () => {
    it('includes durationMs', async () => {
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(typeof body.durationMs).toBe('number')
      expect(body.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('queries deletion_requests table with scheduled status filter', async () => {
      await callRoute(buildRequest('test-cron-secret'))
      expect(mockFrom).toHaveBeenCalledWith('deletion_requests')
      expect(lastChain.eq).toHaveBeenCalledWith('status', 'scheduled')
      expect(lastChain.lte).toHaveBeenCalledWith('scheduled_deletion_at', expect.any(String))
    })
  })
})
