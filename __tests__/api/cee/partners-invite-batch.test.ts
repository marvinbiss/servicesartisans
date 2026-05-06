/**
 * Tests — POST /api/cee/partners/invite-batch
 *
 * Covers Threat Model §5 Test 8 (non-admin → 403) + MUST-9 CSRF.
 * Admin auth delegated to `requirePermission()` which wraps CSRF + role check.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockJsonFn = vi.fn((body: unknown, init?: { status?: number }) => ({
  body,
  status: init?.status ?? 200,
}))
vi.mock('next/server', () => ({
  NextRequest: class NextRequestMock extends Request {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// --- requirePermission mock (CSRF + admin role) ---
const requirePermissionMock = vi.fn()
vi.mock('@/lib/admin-auth', () => ({
  requirePermission: (...args: unknown[]) => requirePermissionMock(...args),
}))

// --- Supabase mocks ---
const providerInMock = vi.fn()
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      in: providerInMock,
    })),
  })),
}
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

const createPartnerMock = vi.fn(async (..._args: unknown[]) => ({ id: 'p-1', status: 'invited' }))
vi.mock('@/lib/cee/leads-service', () => ({
  createCeePartner: (...args: unknown[]) => createPartnerMock(...args),
}))

const sendInviteMock = vi.fn(async (..._args: unknown[]) => ({ success: true }))
vi.mock('@/lib/cee/emails', () => ({
  sendCeePartnerInvite: (...args: unknown[]) => sendInviteMock(...args),
}))

// --- Rate-limiter + Sentry mocks (SLA-99.9 added) ---
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true, limit: 60, remaining: 59, reset: Date.now() + 60_000 })
  ),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))
vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))

type MockResult = { body: Record<string, unknown>; status: number }

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/cee/partners/invite-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Valid v4 UUIDs (version=4, variant=8-b).
const VALID_PROVIDER_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-9222-222222222222',
]

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  ;(process.env as Record<string, string | undefined>) = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'https://servicesartisans.fr',
  }
  // Default: admin authed.
  requirePermissionMock.mockResolvedValue({
    success: true,
    admin: { id: 'admin-1', email: 'admin@servicesartisans.fr' },
  })
  providerInMock.mockResolvedValue({
    data: [
      { id: VALID_PROVIDER_IDS[0], name: 'Provider A', email: 'a@ex.fr', user_id: 'u-a' },
      { id: VALID_PROVIDER_IDS[1], name: 'Provider B', email: 'b@ex.fr', user_id: 'u-b' },
    ],
    error: null,
  })
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/cee/partners/invite-batch', () => {
  it('returns 403 for non-admin user (Test 8)', async () => {
    const forbiddenResponse = mockJsonFn(
      {
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Permission insuffisante' },
      },
      { status: 403 }
    )
    requirePermissionMock.mockResolvedValueOnce({
      success: false,
      error: forbiddenResponse,
    })

    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: VALID_PROVIDER_IDS }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(403)
    // Ensure handler short-circuits — no DB call, no emails.
    expect(providerInMock).not.toHaveBeenCalled()
    expect(createPartnerMock).not.toHaveBeenCalled()
    expect(sendInviteMock).not.toHaveBeenCalled()
  })

  it('returns 401 when not authenticated', async () => {
    const unauthorizedResponse = mockJsonFn(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
    requirePermissionMock.mockResolvedValueOnce({
      success: false,
      error: unauthorizedResponse,
    })

    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: VALID_PROVIDER_IDS }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 403 when CSRF check fails (cross-origin)', async () => {
    // requirePermission() runs CSRF first and returns its own error.
    const csrfResponse = mockJsonFn(
      { success: false, error: { code: 'CSRF_REJECTED' } },
      { status: 403 }
    )
    requirePermissionMock.mockResolvedValueOnce({
      success: false,
      error: csrfResponse,
    })

    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: VALID_PROVIDER_IDS }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('invites batch of providers when admin authed', async () => {
    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: VALID_PROVIDER_IDS }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { invited: 2, emailsSent: 2 },
    })
    expect(createPartnerMock).toHaveBeenCalledTimes(2)
    expect(sendInviteMock).toHaveBeenCalledTimes(2)
  })

  it('skips providers without user_id (not claimed)', async () => {
    providerInMock.mockResolvedValueOnce({
      data: [
        { id: VALID_PROVIDER_IDS[0], name: 'A', email: 'a@ex.fr', user_id: null },
        { id: VALID_PROVIDER_IDS[1], name: 'B', email: 'b@ex.fr', user_id: 'u-b' },
      ],
      error: null,
    })

    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: VALID_PROVIDER_IDS }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { invited: 1, skipped: 1 },
    })
  })

  it('rejects invalid body (non-UUID providerIds, 400)', async () => {
    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: ['not-a-uuid'] }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: { code: 'INVALID_BODY' } })
  })

  it('rejects empty providerIds list (400)', async () => {
    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(makeRequest({ providerIds: [] }) as never)) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('rejects batch > 200 providers (Zod max guard)', async () => {
    const tooMany = Array.from(
      { length: 201 },
      (_, i) => `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`
    )
    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: tooMany }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('handles DB read failure (500)', async () => {
    providerInMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'connection lost' },
    })
    const { POST } = await import('@/app/api/cee/partners/invite-batch/route')
    const res = (await POST(
      makeRequest({ providerIds: VALID_PROVIDER_IDS }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({ error: { code: 'READ_FAILED' } })
  })
})
