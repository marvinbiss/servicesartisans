/**
 * Tests — DELETE /api/v1/ask/sessions/:id
 *
 * Covers :
 *   - 400 when body is missing public_key
 *   - 400 when JSON parse fails
 *   - 403 when public_key does not match the row
 *   - 404 when session is not found / soft-deleted already
 *   - 200 + softDelete invoked on the happy path
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const SESSION_ID = '11111111-2222-3333-4444-555555555555'
const PUBLIC_KEY = 'PK-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  captureError: vi.fn(),
  sessionRow: null as null | Record<string, unknown>,
  updateCall: vi.fn(),
  updateError: null as null | { message: string },
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: mocks.getClientIp,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: mocks.loggerError,
  },
}))

vi.mock('@/lib/monitoring/sentry', () => ({ captureError: mocks.captureError }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'rge_os_ask_sessions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: mocks.sessionRow, error: null }),
            }),
          }),
          update: (patch: unknown) => {
            mocks.updateCall(patch)
            return {
              eq: async () => ({ error: mocks.updateError }),
            }
          },
        }
      }
      throw new Error(`unexpected table: ${table}`)
    },
  }),
}))

import { DELETE } from '@/app/api/v1/ask/sessions/[id]/route'

function buildDelete(body: unknown): unknown {
  return {
    headers: new Headers(),
    nextUrl: new URL('http://localhost/api/v1/ask/sessions/' + SESSION_ID),
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('parse')
      return body
    },
  }
}

function validSessionRow() {
  return {
    id: SESSION_ID,
    public_key: PUBLIC_KEY,
    created_at: '2026-05-20T00:00:00Z',
    last_activity_at: '2026-05-20T01:00:00Z',
    expires_at: '2026-06-19T00:00:00Z',
    message_count: 4,
    deleted_at: null,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  })
  mocks.getClientIp.mockReturnValue('127.0.0.1')
  mocks.sessionRow = null
  mocks.updateError = null
})

describe('DELETE /api/v1/ask/sessions/:id — body validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await DELETE(buildDelete('__INVALID_JSON__') as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_body')
  })

  it('returns 400 when public_key is missing', async () => {
    const res = await DELETE(buildDelete({}) as never, { params: { id: SESSION_ID } })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('missing_public_key')
  })
})

describe('DELETE /api/v1/ask/sessions/:id — auth state machine', () => {
  it('returns 404 when session does not exist', async () => {
    mocks.sessionRow = null
    const res = await DELETE(buildDelete({ public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(404)
    expect(mocks.updateCall).not.toHaveBeenCalled()
  })

  it('returns 403 on public_key mismatch', async () => {
    mocks.sessionRow = validSessionRow()
    const res = await DELETE(
      buildDelete({ public_key: 'wrong-key-of-similar-length-43+chars-x' }) as never,
      {
        params: { id: SESSION_ID },
      }
    )
    expect(res.status).toBe(403)
    expect(mocks.updateCall).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/v1/ask/sessions/:id — happy path', () => {
  it('returns 200 and stamps deleted_at via update', async () => {
    mocks.sessionRow = validSessionRow()
    const res = await DELETE(buildDelete({ public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; deleted_at: string }
    expect(body.ok).toBe(true)
    expect(body.deleted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(mocks.updateCall).toHaveBeenCalledTimes(1)
    const patch = mocks.updateCall.mock.calls[0][0] as { deleted_at?: string }
    expect(patch.deleted_at).toBeTruthy()
  })
})
