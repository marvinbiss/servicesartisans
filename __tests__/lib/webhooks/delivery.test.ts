import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deliverWebhook,
  generateApiKey,
  generateSecret,
  hashApiKey,
  signPayload,
  verifyPayloadSignature,
} from '@/lib/webhooks'

describe('webhooks/delivery — signPayload + verifyPayloadSignature', () => {
  const secret = 'test-secret-aaaa-bbbb-cccc-dddd-eeee-ffff'
  const ts = String(Math.floor(Date.now() / 1000))
  const body = JSON.stringify({ event: 'rge.snapshot.refreshed', payload: { ok: 1 }, ts })

  it('signPayload is deterministic for same inputs', () => {
    const a = signPayload(secret, ts, body)
    const b = signPayload(secret, ts, body)
    expect(a).toBe(b)
    expect(a.startsWith('v1,t=')).toBe(true)
    expect(a.includes('sig=')).toBe(true)
  })

  it('verifyPayloadSignature accepts a freshly signed payload', () => {
    const header = signPayload(secret, ts, body)
    expect(verifyPayloadSignature(secret, ts, body, header)).toBe(true)
  })

  it('verifyPayloadSignature rejects a tampered body', () => {
    const header = signPayload(secret, ts, body)
    expect(verifyPayloadSignature(secret, ts, body + 'tamper', header)).toBe(false)
  })

  it('verifyPayloadSignature rejects a stale timestamp (>5min)', () => {
    const oldTs = String(Math.floor(Date.now() / 1000) - 600)
    const header = signPayload(secret, oldTs, body)
    expect(verifyPayloadSignature(secret, oldTs, body, header, 300)).toBe(false)
  })

  it('verifyPayloadSignature rejects a wrong signature', () => {
    const header = `v1,t=${ts},sig=${'f'.repeat(64)}`
    expect(verifyPayloadSignature(secret, ts, body, header)).toBe(false)
  })

  it('verifyPayloadSignature rejects a malformed header (no sig=)', () => {
    expect(verifyPayloadSignature(secret, ts, body, 'v1,t=' + ts)).toBe(false)
    expect(verifyPayloadSignature(secret, ts, body, 'junk')).toBe(false)
  })

  it('verifyPayloadSignature rejects different secret', () => {
    const header = signPayload(secret, ts, body)
    expect(verifyPayloadSignature('other-secret-zzzzz', ts, body, header)).toBe(false)
  })

  it('verifyPayloadSignature rejects non-numeric timestamp', () => {
    const header = signPayload(secret, 'NaN', body)
    expect(verifyPayloadSignature(secret, 'NaN', body, header)).toBe(false)
  })
})

describe('webhooks/delivery — deliverWebhook', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('returns status + body excerpt on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      text: async () => 'ok',
    } as Response)
    globalThis.fetch = mockFetch as unknown as typeof globalThis.fetch

    const res = await deliverWebhook('https://example.com/h', 'sec', 'rge.snapshot.refreshed', {
      snapshot_date: '2026-05-21',
      providers_count: 1,
      qualifications_count: 2,
    })
    expect(res.status).toBe(200)
    expect(res.body_excerpt).toBe('ok')
    expect(res.error).toBeNull()
    expect(res.duration_ms).toBeGreaterThanOrEqual(0)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, init] = mockFetch.mock.calls[0]
    expect((init as RequestInit).method).toBe('POST')
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers['X-SA-Event']).toBe('rge.snapshot.refreshed')
    expect(headers['X-SA-Signature']).toMatch(/^v1,t=\d+,sig=[a-f0-9]+$/)
  })

  it('returns status:null + error string on network failure', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    globalThis.fetch = mockFetch as unknown as typeof globalThis.fetch

    const res = await deliverWebhook('https://example.com/h', 'sec', 'rge.snapshot.refreshed', {})
    expect(res.status).toBeNull()
    expect(res.error).toContain('ECONNREFUSED')
    expect(res.body_excerpt).toBe('')
  })

  it('truncates body excerpt to 500 chars', async () => {
    const big = 'x'.repeat(2000)
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        text: async () => big,
      } as Response) as unknown as typeof globalThis.fetch

    const res = await deliverWebhook('https://example.com/h', 'sec', 'aides.bareme.updated', {})
    expect(res.body_excerpt.length).toBe(500)
  })

  it('respects 10s abort timeout (aborted fetch surfaces as error)', async () => {
    // We simulate by throwing AbortError synchronously — verifies the
    // catch path maps abort errors to {status:null, error: ...}.
    const abortErr = new Error('The operation was aborted')
    abortErr.name = 'AbortError'
    globalThis.fetch = vi.fn().mockRejectedValue(abortErr) as unknown as typeof globalThis.fetch

    const res = await deliverWebhook('https://example.com/h', 'sec', 'ai.transparency.updated', {})
    expect(res.status).toBeNull()
    expect(res.error).toMatch(/abort/i)
  })
})

describe('webhooks/delivery — secret + api_key helpers', () => {
  it('generateSecret returns a 64-char hex string', () => {
    const s = generateSecret()
    expect(s).toMatch(/^[a-f0-9]{64}$/)
  })

  it('generateApiKey returns sa_wh_<hex> prefix', () => {
    const k = generateApiKey()
    expect(k.startsWith('sa_wh_')).toBe(true)
    expect(k.length).toBeGreaterThan(20)
  })

  it('hashApiKey is deterministic + different per input', () => {
    const a = hashApiKey('sa_wh_aaaa')
    const b = hashApiKey('sa_wh_aaaa')
    const c = hashApiKey('sa_wh_bbbb')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })
})
