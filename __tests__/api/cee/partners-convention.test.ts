/**
 * Tests — POST /api/cee/partners/convention
 *
 * Covers MUST-6 (transition), MUST-8 (rate limit 10/min),
 * MUST-9 (CSRF), MUST-12 (SSRF convention_pdf_url / signerUrl).
 * Also covers Threat Model §5 Test 13 — signerUrl from attacker.com rejected.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const maybeSinglePartnerMock = vi.fn()
const maybeSingleProviderMock = vi.fn()
const updateEqMock = vi.fn(() => Promise.resolve({ error: null }))
const profileSingleMock = vi.fn(async () => ({
  data: { role: 'artisan', two_factor_enabled: false },
  error: null,
}))

const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'jean@example.fr' } },
      error: null,
    })),
  },
  from: vi.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ single: profileSingleMock })),
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
    if (table === 'providers') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: maybeSingleProviderMock })),
        })),
      }
    }
    return {}
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

const createSignatureRequestMock = vi.fn()
vi.mock('@/lib/cee/yousign', () => ({
  createSignatureRequest: (...args: unknown[]) => createSignatureRequestMock(...args),
}))

const updateStatusMock = vi.fn(async () => ({ id: 'partner-1', status: 'convention_sent' }))
vi.mock('@/lib/cee/leads-service', () => ({
  updateCeePartnerStatus: (...args: unknown[]) =>
    (updateStatusMock as (...a: unknown[]) => unknown)(...args),
}))

type MockResult = { body: Record<string, unknown>; status: number; headers: Record<string, string> }

function makeRequest(headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/cee/partners/convention', {
    method: 'POST',
    // Origin requis depuis le mode strict validateOrigin sur routes financieres
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000', ...headers },
    body: JSON.stringify({}),
  })
}

const originalEnv = { ...process.env }

beforeEach(async () => {
  vi.clearAllMocks()
  ;(process.env as Record<string, string | undefined>) = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    YOUSIGN_API_KEY: 'test-api-key',
  }
  profileSingleMock.mockResolvedValue({
    data: { role: 'artisan', two_factor_enabled: false },
    error: null,
  })
  maybeSinglePartnerMock.mockResolvedValue({
    data: {
      id: 'partner-1',
      provider_id: 'prov-1',
      status: 'onboarding',
      iban_last4: '2606',
    },
    error: null,
  })
  maybeSingleProviderMock.mockResolvedValue({
    data: { name: 'Jean Dupont', email: 'jean@example.fr' },
    error: null,
  })
  createSignatureRequestMock.mockResolvedValue({
    envelopeId: 'env-1',
    procedureId: 'proc-1',
    signerUrl: 'https://api.yousign.app/signer/abc',
  })
  const rl = await import('@/lib/cee/rate-limit')
  rl._resetRateLimitStoreForTests()
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/cee/partners/convention', () => {
  it('creates a Yousign envelope and transitions partner (MUST-6)', async () => {
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { envelopeId: 'env-1', signerUrl: 'https://api.yousign.app/signer/abc' },
    })
    expect(createSignatureRequestMock).toHaveBeenCalled()
    expect(updateStatusMock).toHaveBeenCalledWith(expect.anything(), 'partner-1', 'convention_sent')
  })

  it('rejects cross-site requests (CSRF, 403, MUST-9)', async () => {
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(
      makeRequest({ 'Sec-Fetch-Site': 'cross-site' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ error: { code: 'CSRF_REJECTED' } })
  })

  it('rejects bad Origin (CSRF, 403)', async () => {
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(
      makeRequest({ Origin: 'https://evil.com' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('returns 401 when not authenticated', async () => {
    ;(
      mockSupabase.auth.getUser as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 404 when partner record missing', async () => {
    maybeSinglePartnerMock.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(404)
  })

  it('returns 409 when IBAN not yet submitted', async () => {
    maybeSinglePartnerMock.mockResolvedValueOnce({
      data: {
        id: 'partner-1',
        provider_id: 'prov-1',
        status: 'onboarding',
        iban_last4: null,
      },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ error: { code: 'IBAN_REQUIRED' } })
  })

  it('strips non-Yousign signerUrl (MUST-12 SSRF guard, Test 13)', async () => {
    // Yousign library returns a malicious URL (attacker injected).
    createSignatureRequestMock.mockResolvedValueOnce({
      envelopeId: 'env-1',
      procedureId: 'proc-1',
      signerUrl: 'https://attacker.com/evil.pdf',
    })
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect((res.body as { data: { signerUrl: string } }).data.signerUrl).toBe('')
  })

  it('accepts Yousign subdomain signerUrl (MUST-12 allowlist)', async () => {
    createSignatureRequestMock.mockResolvedValueOnce({
      envelopeId: 'env-1',
      procedureId: 'proc-1',
      signerUrl: 'https://app.yousign.com/procedure/abc',
    })
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect((res.body as { data: { signerUrl: string } }).data.signerUrl).toContain('yousign.com')
  })

  it('rate-limits at 10 req/min (11th returns 429, MUST-8)', async () => {
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    for (let i = 0; i < 10; i++) {
      const ok = (await POST(makeRequest() as never)) as unknown as MockResult
      expect(ok.status).toBe(200)
    }
    const throttled = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(throttled.status).toBe(429)
    expect(throttled.headers['Retry-After']).toBeDefined()
  })

  it('fails closed when YOUSIGN_API_KEY missing in production (500)', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    delete (process.env as Record<string, string | undefined>).YOUSIGN_API_KEY
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({ error: { code: 'CONFIG_ERROR' } })
  })

  it('returns 500 when Yousign API fails', async () => {
    createSignatureRequestMock.mockRejectedValueOnce(new Error('Yousign draft failed: 503'))
    const { POST } = await import('@/app/api/cee/partners/convention/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({ error: { code: 'YOUSIGN_ERROR' } })
  })
})
