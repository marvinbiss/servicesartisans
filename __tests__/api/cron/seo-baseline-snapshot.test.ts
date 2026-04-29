/**
 * Tests — /api/cron/seo-baseline-snapshot
 *
 * Couvre :
 *   - Auth timing-safe (CRON_SECRET)
 *   - Body validation Zod (label format, notes max length)
 *   - Idempotence via UNIQUE label → 409
 *   - Génération auto-label quand body absent
 *   - Insert avec agrégat depuis computeSeoAggregate
 *   - 500 si CRON_SECRET non configuré
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockLoggerFns = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}
vi.mock('@/lib/logger', () => ({ logger: mockLoggerFns }))

const mockComputeAggregate = vi.fn()
vi.mock('@/lib/seo/baseline-aggregator', () => ({
  computeSeoAggregate: (...args: unknown[]) => mockComputeAggregate(...args),
}))

const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

function buildPostRequest(opts: { secret?: string; body?: unknown }): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.secret) headers.authorization = `Bearer ${opts.secret}`
  return new Request('http://localhost/api/cron/seo-baseline-snapshot', {
    method: 'POST',
    headers,
    body: opts.body === undefined ? '' : JSON.stringify(opts.body),
  })
}

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/seo-baseline-snapshot/route')
  return mod.POST(req)
}

const baseAggregate = {
  total_pages: 1000,
  indexed_count: 800,
  orphan_critical: 50,
  orphan_weak: 100,
  avg_link_score: 4.5,
  median_link_score: 4.0,
  by_page_type: { services: { count: 500, indexed: 450, orphans: 30, avg_link_score: 5.0 } },
}

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  mockComputeAggregate.mockReset()
  mockInsert.mockReset()
  mockSelect.mockReset()
  mockSingle.mockReset()
  mockFrom.mockReset()
  Object.values(mockLoggerFns).forEach((fn) => fn.mockReset())

  // Default chain: from(...).insert(...).select(...).single() → success
  mockSingle.mockResolvedValue({
    data: { id: 'uuid-1', label: 'baseline-2026-04-29', snapshot_date: '2026-04-29T10:00:00Z' },
    error: null,
  })
  mockSelect.mockReturnValue({ single: mockSingle })
  mockInsert.mockReturnValue({ select: mockSelect })
  mockFrom.mockReturnValue({ insert: mockInsert })
  mockComputeAggregate.mockResolvedValue(baseAggregate)
})

afterEach(() => {
  vi.resetModules()
  delete process.env.CRON_SECRET
})

describe('POST /api/cron/seo-baseline-snapshot', () => {
  describe('auth', () => {
    it('returns 401 when authorization missing', async () => {
      const res = await callRoute(buildPostRequest({}))
      expect(res.status).toBe(401)
      expect(mockComputeAggregate).not.toHaveBeenCalled()
    })

    it('returns 401 when secret mismatch', async () => {
      const res = await callRoute(buildPostRequest({ secret: 'wrong' }))
      expect(res.status).toBe(401)
    })

    it('returns 500 when CRON_SECRET not configured', async () => {
      delete process.env.CRON_SECRET
      const res = await callRoute(buildPostRequest({ secret: 'anything' }))
      expect(res.status).toBe(500)
    })

    it('accepts valid bearer token', async () => {
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'baseline-test-29' } })
      )
      expect(res.status).toBe(201)
    })
  })

  describe('body validation', () => {
    it('accepts empty body and generates auto-label', async () => {
      const res = await callRoute(buildPostRequest({ secret: 'test-cron-secret' }))
      expect(res.status).toBe(201)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          label: expect.stringMatching(/^auto-\d{4}-\d{2}-\d{2}-\d{4}$/),
        })
      )
    })

    it('rejects invalid label format (uppercase)', async () => {
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'Baseline-2026' } })
      )
      expect(res.status).toBe(400)
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('rejects too short label', async () => {
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'a' } })
      )
      expect(res.status).toBe(400)
    })

    it('rejects extra fields (strict)', async () => {
      const res = await callRoute(
        buildPostRequest({
          secret: 'test-cron-secret',
          body: { label: 'baseline-extra', evil: 'inject' },
        })
      )
      expect(res.status).toBe(400)
    })

    it('rejects malformed JSON', async () => {
      const req = new Request('http://localhost/api/cron/seo-baseline-snapshot', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-cron-secret',
          'content-type': 'application/json',
        },
        body: '{not-json',
      })
      const mod = await import('@/app/api/cron/seo-baseline-snapshot/route')
      const res = await mod.POST(req)
      expect(res.status).toBe(400)
    })

    it('accepts notes up to 500 chars', async () => {
      const notes = 'a'.repeat(500)
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'baseline-test', notes } })
      )
      expect(res.status).toBe(201)
    })

    it('rejects notes > 500 chars', async () => {
      const notes = 'a'.repeat(501)
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'baseline-test', notes } })
      )
      expect(res.status).toBe(400)
    })
  })

  describe('idempotence', () => {
    it('returns 409 when label already exists (PostgreSQL 23505)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'duplicate key' },
      })
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'gate-p0-j30' } })
      )
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toMatch(/déjà utilisé/i)
    })

    it('returns 500 on other DB errors', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: '42P01', message: 'relation does not exist' },
      })
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'baseline-test-1' } })
      )
      expect(res.status).toBe(500)
      expect(mockLoggerFns.error).toHaveBeenCalled()
    })
  })

  describe('aggregate insertion', () => {
    it('passes aggregate fields to insert', async () => {
      await callRoute(
        buildPostRequest({
          secret: 'test-cron-secret',
          body: { label: 'baseline-29-04', notes: 'Post-bugs-fix' },
        })
      )
      expect(mockInsert).toHaveBeenCalledWith({
        label: 'baseline-29-04',
        notes: 'Post-bugs-fix',
        total_pages: 1000,
        indexed_count: 800,
        orphan_critical: 50,
        orphan_weak: 100,
        avg_link_score: 4.5,
        median_link_score: 4.0,
        by_page_type: { services: { count: 500, indexed: 450, orphans: 30, avg_link_score: 5.0 } },
      })
    })

    it('returns 500 if aggregator throws', async () => {
      mockComputeAggregate.mockRejectedValueOnce(new Error('Supabase down'))
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'baseline-test-1' } })
      )
      expect(res.status).toBe(500)
      expect(mockLoggerFns.error).toHaveBeenCalled()
    })

    it('responds 201 with snapshot id and full aggregate', async () => {
      const res = await callRoute(
        buildPostRequest({ secret: 'test-cron-secret', body: { label: 'baseline-29-04' } })
      )
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.ok).toBe(true)
      expect(body.snapshot.id).toBe('uuid-1')
      expect(body.aggregate).toEqual(baseAggregate)
    })
  })
})
