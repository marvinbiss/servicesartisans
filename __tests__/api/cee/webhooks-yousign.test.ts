/**
 * Tests — POST /api/webhooks/yousign
 * Covers MUST-1 (HMAC), MUST-2 (timestamp drift), MUST-5 (fail-close),
 * MUST-10 (idempotency), MUST-16 (content-type).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import crypto from 'crypto'

const SECRET = 'test-yousign-webhook-secret-random-ok-32'

const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number }) => ({
    body,
    status: init?.status ?? 200,
  })
)
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// --- Supabase mocks ---
const maybeSinglePartnerMock = vi.fn()
const webhookInsertMock = vi.fn()
const updateEqMock = vi.fn(() => Promise.resolve({ error: null }))

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (table === 'cee_webhook_events') {
      return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: webhookInsertMock,
          })),
        })),
      }
    }
    if (table === 'cee_artisan_partners') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: maybeSinglePartnerMock })),
        })),
        update: vi.fn(() => ({ eq: updateEqMock })),
      }
    }
    return {}
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/cee/leads-service', () => ({
  updateCeePartnerStatus: vi.fn(async () => ({ id: 'p', status: 'convention_signed' })),
}))

type MockResult = { body: Record<string, unknown>; status: number }

function signBody(body: string, _ts: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('hex')
}

function makeRequest(
  body: string,
  headers: Record<string, string> = {},
  ctHeader: string | null = 'application/json'
) {
  const h: Record<string, string> = { ...headers }
  if (ctHeader) h['Content-Type'] = ctHeader
  return new Request('http://localhost:3000/api/webhooks/yousign', {
    method: 'POST',
    headers: h,
    body,
  })
}

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  process.env = { ...originalEnv, NODE_ENV: 'test', YOUSIGN_WEBHOOK_SECRET: SECRET }
  webhookInsertMock.mockResolvedValue({ data: { id: 1 }, error: null })
  maybeSinglePartnerMock.mockResolvedValue({
    data: { id: 'partner-1', status: 'convention_sent' },
    error: null,
  })
})
afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/webhooks/yousign', () => {
  it('rejects without Content-Type application/json (MUST-16, 415)', async () => {
    const body = JSON.stringify({ event_type: 'signature_request.done' })
    const ts = Math.floor(Date.now() / 1000).toString()
    const sig = signBody(body, ts)

    const { POST } = await import('@/app/api/webhooks/yousign/route')
    const res = (await POST(
      makeRequest(
        body,
        { 'x-yousign-signature-256': sig, 'x-yousign-timestamp': ts },
        'text/plain'
      ) as never
    )) as unknown as MockResult

    expect(res.status).toBe(415)
  })

  it('rejects missing signature/timestamp (401)', async () => {
    const { POST } = await import('@/app/api/webhooks/yousign/route')
    const res = (await POST(
      makeRequest('{}') as never
    )) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('rejects invalid signature (401, MUST-1)', async () => {
    const ts = Math.floor(Date.now() / 1000).toString()
    const { POST } = await import('@/app/api/webhooks/yousign/route')
    const res = (await POST(
      makeRequest('{"event_type":"x"}', {
        'x-yousign-signature-256': 'deadbeef',
        'x-yousign-timestamp': ts,
      }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('rejects old timestamp (replay, 401, MUST-2)', async () => {
    const body = '{"event_type":"signature_request.done"}'
    const ts = (Math.floor(Date.now() / 1000) - 3600).toString()
    const sig = signBody(body, ts)
    const { POST } = await import('@/app/api/webhooks/yousign/route')
    const res = (await POST(
      makeRequest(body, {
        'x-yousign-signature-256': sig,
        'x-yousign-timestamp': ts,
      }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('fails closed when YOUSIGN_WEBHOOK_SECRET missing in production (500, MUST-5)', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    delete (process.env as Record<string, string | undefined>).YOUSIGN_WEBHOOK_SECRET
    const { POST } = await import('@/app/api/webhooks/yousign/route')
    const res = (await POST(makeRequest('{}') as never)) as unknown as MockResult
    expect(res.status).toBe(500)
  })

  it('processes valid signature-done event and transitions partner', async () => {
    const body = JSON.stringify({
      event_type: 'signature_request.done',
      event_id: 'evt-1',
      data: {
        signature_request: {
          id: 'env-1',
          status: 'done',
        },
      },
    })
    const ts = Math.floor(Date.now() / 1000).toString()
    const sig = signBody(body, ts)

    const { POST } = await import('@/app/api/webhooks/yousign/route')
    const res = (await POST(
      makeRequest(body, {
        'x-yousign-signature-256': sig,
        'x-yousign-timestamp': ts,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, processed: true })
  })

  it('dedupes replayed events (MUST-10)', async () => {
    // First call: fresh. Second call: 23505 conflict.
    webhookInsertMock
      .mockResolvedValueOnce({ data: { id: 1 }, error: null })
      .mockResolvedValueOnce({ data: null, error: { code: '23505' } })

    const body = JSON.stringify({
      event_type: 'signature_request.done',
      event_id: 'evt-dup',
      data: { signature_request: { id: 'env-dup', status: 'done' } },
    })
    const ts = Math.floor(Date.now() / 1000).toString()
    const sig = signBody(body, ts)

    const { POST } = await import('@/app/api/webhooks/yousign/route')

    const req1 = makeRequest(body, {
      'x-yousign-signature-256': sig,
      'x-yousign-timestamp': ts,
    })
    const res1 = (await POST(req1 as never)) as unknown as MockResult
    expect(res1.status).toBe(200)

    const req2 = makeRequest(body, {
      'x-yousign-signature-256': sig,
      'x-yousign-timestamp': ts,
    })
    const res2 = (await POST(req2 as never)) as unknown as MockResult
    expect(res2.status).toBe(200)
    expect(res2.body).toMatchObject({ duplicate: true })
  })
})
