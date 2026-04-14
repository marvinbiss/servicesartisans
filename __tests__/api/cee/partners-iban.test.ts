/**
 * Tests — POST /api/cee/partners/onboarding/iban
 *
 * Covers MUST-3, 4, 8, 9, 11.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------- Mocks ----------
const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    body,
    status: init?.status ?? 200,
    headers: init?.headers ?? {},
  })
)
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
      mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const rpcMock = vi.fn()
const maybeSingleMock = vi.fn()

const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'a@b.fr' } },
      error: null,
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: maybeSingleMock,
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
  rpc: rpcMock,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/cee/leads-service', () => ({
  updateCeePartnerStatus: vi.fn(async () => ({ id: 'p', status: 'onboarding' })),
}))

type MockResult = { body: Record<string, unknown>; status: number; headers: Record<string, string> }

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/cee/partners/onboarding/iban', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const VALID_BODY = {
  iban: 'FR1420041010050500013M02606',
  bic: 'BNPAFRPPXXX',
  titulaire: 'Jean Dupont',
}

// ---------- Setup ----------
const originalEnv = { ...process.env }
beforeEach(async () => {
  vi.clearAllMocks()
  ;(process.env as Record<string, string | undefined>) = {
    ...originalEnv,
    NODE_ENV: 'test',
    CEE_IBAN_KEY: 'test-cee-iban-key-32-bytes-ok-aaaaaa',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  }
  ;(maybeSingleMock as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
    data: { id: 'partner-1', status: 'invited' },
    error: null,
  })
  ;(rpcMock as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
    error: null,
  })
  const rl = await import('@/lib/cee/rate-limit')
  rl._resetRateLimitStoreForTests()
})

afterEach(() => {
  process.env = { ...originalEnv }
})

// ---------- Tests ----------

describe('POST /api/cee/partners/onboarding/iban', () => {
  it('stores IBAN and returns last4 on valid input', async () => {
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(makeRequest(VALID_BODY) as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { iban_last4: '2606', bic: 'BNPAFRPPXXX' },
    })
    expect(rpcMock).toHaveBeenCalledWith(
      'cee_store_partner_iban',
      expect.objectContaining({
        p_partner_id: 'partner-1',
        p_bic: 'BNPAFRPPXXX',
      })
    )
  })

  it('rejects invalid IBAN (400)', async () => {
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(
      makeRequest({ ...VALID_BODY, iban: 'FR9914041010050500013M02606' }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      error: { code: 'INVALID_IBAN' },
    })
  })

  it('rejects cross-site requests via Sec-Fetch-Site (CSRF, 403)', async () => {
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(
      makeRequest(VALID_BODY, { 'Sec-Fetch-Site': 'cross-site' }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ error: { code: 'CSRF_REJECTED' } })
  })

  it('rejects cross-origin requests with bad Origin (403)', async () => {
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(
      makeRequest(VALID_BODY, { Origin: 'https://evil.com' }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(403)
  })

  it('fails closed when CEE_IBAN_KEY is missing in production (500)', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    delete (process.env as Record<string, string | undefined>).CEE_IBAN_KEY
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(makeRequest(VALID_BODY) as never)) as unknown as MockResult

    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({ error: { code: 'CONFIG_ERROR' } })
  })

  it('returns 401 when not authenticated', async () => {
    ;(
      mockSupabase.auth.getUser as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(makeRequest(VALID_BODY) as never)) as unknown as MockResult

    expect(res.status).toBe(401)
  })

  it('rate-limits at 3 requests/min (4th returns 429)', async () => {
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    for (let i = 0; i < 3; i++) {
      const ok = (await POST(makeRequest(VALID_BODY) as never)) as unknown as MockResult
      expect(ok.status).toBe(200)
    }
    const throttled = (await POST(makeRequest(VALID_BODY) as never)) as unknown as MockResult
    expect(throttled.status).toBe(429)
    expect(throttled.headers['Retry-After']).toBeDefined()
  })

  it('returns 404 when user has no partner record', async () => {
    ;(
      maybeSingleMock as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    const res = (await POST(makeRequest(VALID_BODY) as never)) as unknown as MockResult

    expect(res.status).toBe(404)
  })

  it('does not log the IBAN (MUST-11)', async () => {
    const loggerMod = await import('@/lib/logger')
    const { POST } = await import('@/app/api/cee/partners/onboarding/iban/route')
    await POST(makeRequest(VALID_BODY) as never)

    const allCalls = [
      ...(loggerMod.logger.info as unknown as { mock: { calls: unknown[][] } }).mock.calls,
      ...(loggerMod.logger.warn as unknown as { mock: { calls: unknown[][] } }).mock.calls,
      ...(loggerMod.logger.error as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ]
    const serialised = JSON.stringify(allCalls)
    expect(serialised).not.toContain('FR1420041010050500013M02606')
    // last4 is OK
    expect(serialised).toContain('2606')
  })
})
