/**
 * Tests — GET /api/v1/ask/sessions/:id
 *
 * Covers :
 *   - 400 when public_key query param is missing
 *   - 404 when session is not found in DB
 *   - 410 when session has expired
 *   - 403 when public_key does not match
 *   - 200 on happy path with messages array
 *   - 429 when rate-limit denies
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const SESSION_ID = '11111111-2222-3333-4444-555555555555'
const PUBLIC_KEY = 'PK-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  captureError: vi.fn(),
  // Holds the current "DB state" each test seeds before invoking GET.
  sessionRow: null as null | Record<string, unknown>,
  messagesRows: [] as Array<Record<string, unknown>>,
  selectError: null as null | { message: string },
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

// Minimal chainable Supabase mock. Branches on table name :
//   - rge_os_ask_sessions  : .select(...).eq('id', _).maybeSingle()
//   - rge_os_ask_messages  : .select(...).eq('session_id', _).order(...).limit(_) -> {data, error}
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'rge_os_ask_sessions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: mocks.sessionRow,
                error: mocks.selectError,
              }),
            }),
          }),
        }
      }
      if (table === 'rge_os_ask_messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({ data: mocks.messagesRows, error: null }),
              }),
            }),
          }),
        }
      }
      throw new Error(`unexpected table: ${table}`)
    },
  }),
}))

import { GET } from '@/app/api/v1/ask/sessions/[id]/route'

function buildGet(publicKey?: string): unknown {
  const url = new URL('http://localhost/api/v1/ask/sessions/' + SESSION_ID)
  if (publicKey !== undefined) url.searchParams.set('public_key', publicKey)
  return {
    headers: new Headers(),
    nextUrl: url,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 59,
    resetTime: Date.now() + 60_000,
  })
  mocks.getClientIp.mockReturnValue('127.0.0.1')
  mocks.sessionRow = null
  mocks.messagesRows = []
  mocks.selectError = null
})

describe('GET /api/v1/ask/sessions/:id — validation', () => {
  it('returns 400 when public_key is missing', async () => {
    const res = await GET(buildGet() as never, { params: Promise.resolve({ id: SESSION_ID }) })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('missing_public_key')
  })
})

describe('GET /api/v1/ask/sessions/:id — auth state machine', () => {
  it('returns 404 when session is not found', async () => {
    mocks.sessionRow = null
    const res = await GET(buildGet(PUBLIC_KEY) as never, {
      params: Promise.resolve({ id: SESSION_ID }),
    })
    expect(res.status).toBe(404)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('session_not_found')
  })

  it('returns 410 when session has expired', async () => {
    mocks.sessionRow = {
      id: SESSION_ID,
      public_key: PUBLIC_KEY,
      created_at: '2026-04-01T00:00:00Z',
      last_activity_at: '2026-04-01T00:00:00Z',
      expires_at: new Date(Date.now() - 1000).toISOString(),
      message_count: 4,
      deleted_at: null,
    }
    const res = await GET(buildGet(PUBLIC_KEY) as never, {
      params: Promise.resolve({ id: SESSION_ID }),
    })
    expect(res.status).toBe(410)
  })

  it('returns 403 when public_key does not match', async () => {
    mocks.sessionRow = {
      id: SESSION_ID,
      public_key: PUBLIC_KEY,
      created_at: '2026-05-20T00:00:00Z',
      last_activity_at: '2026-05-20T00:00:00Z',
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      message_count: 4,
      deleted_at: null,
    }
    const res = await GET(buildGet('PK-WRONG-WRONG-WRONG-WRONG-WRONG-WRONG-XXX') as never, {
      params: Promise.resolve({ id: SESSION_ID }),
    })
    expect(res.status).toBe(403)
  })
})

describe('GET /api/v1/ask/sessions/:id — happy path', () => {
  it('returns 200 + messages array on a valid auth', async () => {
    mocks.sessionRow = {
      id: SESSION_ID,
      public_key: PUBLIC_KEY,
      created_at: '2026-05-20T00:00:00Z',
      last_activity_at: '2026-05-20T01:00:00Z',
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      message_count: 2,
      deleted_at: null,
    }
    mocks.messagesRows = [
      {
        id: 1,
        role: 'user',
        content: 'Quel bareme PAC ?',
        classification: null,
        citations: null,
        trace: null,
        created_at: '2026-05-20T00:30:00Z',
      },
      {
        id: 2,
        role: 'assistant',
        content: "5000€ MaPrimeRénov' ménage modeste",
        classification: 'ymyl_aides',
        citations: [{ url: 'https://france-renov.gouv.fr', title: 'France Rénov' }],
        trace: { latencyMs: 1234 },
        created_at: '2026-05-20T00:30:05Z',
      },
    ]
    const res = await GET(buildGet(PUBLIC_KEY) as never, {
      params: Promise.resolve({ id: SESSION_ID }),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      session: { id: string; message_count: number }
      messages: Array<{ role: string; content: string }>
    }
    expect(body.session.id).toBe(SESSION_ID)
    expect(body.session.message_count).toBe(2)
    expect(body.messages).toHaveLength(2)
    expect(body.messages[0].role).toBe('user')
    expect(body.messages[1].role).toBe('assistant')
  })
})

describe('GET /api/v1/ask/sessions/:id — rate limit', () => {
  it('returns 429 when checkRateLimit denies', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30_000,
    })
    const res = await GET(buildGet(PUBLIC_KEY) as never, {
      params: Promise.resolve({ id: SESSION_ID }),
    })
    expect(res.status).toBe(429)
  })
})
