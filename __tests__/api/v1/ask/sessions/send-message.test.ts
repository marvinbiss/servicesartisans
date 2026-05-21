/**
 * Tests — POST /api/v1/ask/sessions/:id/messages
 *
 * Covers :
 *   - 400 when body parse fails / query missing / public_key missing / query too long
 *   - 404 / 410 / 403 from auth state machine
 *   - 200 happy path : answer() ok=true → message persisted via insertMessage
 *   - 422 when answer() returns ok=false / reason=critic_block
 *   - 503 when answer() returns ok=false / reason=llm_unavailable
 *   - 500 + captureError when answer() throws
 *   - 429 on rate-limit deny
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const SESSION_ID = '11111111-2222-3333-4444-555555555555'
const PUBLIC_KEY = 'PK-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  loggerWarn: vi.fn(),
  captureError: vi.fn(),
  answer: vi.fn(),
  sessionRow: null as null | Record<string, unknown>,
  insertedMessages: [] as Array<Record<string, unknown>>,
  insertError: null as null | { message: string },
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: mocks.getClientIp,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: mocks.loggerWarn,
    error: mocks.loggerError,
  },
}))

vi.mock('@/lib/monitoring/sentry', () => ({ captureError: mocks.captureError }))

vi.mock('@/lib/answer-engine', () => ({
  answer: mocks.answer,
}))

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
        }
      }
      if (table === 'rge_os_ask_messages') {
        return {
          insert: (row: Record<string, unknown>) => {
            mocks.insertedMessages.push(row)
            return {
              select: () => ({
                single: async () => {
                  if (mocks.insertError) return { data: null, error: mocks.insertError }
                  return { data: { id: mocks.insertedMessages.length }, error: null }
                },
              }),
            }
          },
        }
      }
      throw new Error(`unexpected table: ${table}`)
    },
  }),
}))

import { POST } from '@/app/api/v1/ask/sessions/[id]/messages/route'

function buildPost(body: unknown): unknown {
  return {
    headers: new Headers(),
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('parse')
      return body
    },
  }
}

function validSessionRow(messageCount = 0) {
  return {
    id: SESSION_ID,
    public_key: PUBLIC_KEY,
    created_at: '2026-05-20T00:00:00Z',
    last_activity_at: '2026-05-20T00:00:00Z',
    expires_at: '2026-06-19T00:00:00Z',
    message_count: messageCount,
    deleted_at: null,
  }
}

function okAnswer(content = 'Test answer') {
  return {
    ok: true,
    content,
    citations: [
      { url: 'https://france-renov.gouv.fr', title: 'France Rénov', retrievedAt: '2026-05-21' },
    ],
    trace: {
      traceId: SESSION_ID,
      classification: 'generic',
      providerUsed: 'mistral',
      modelUsed: 'mistral-large-latest',
      groundTruthInjected: false,
      criticInvoked: false,
      latencyMs: 100,
    },
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
  mocks.insertedMessages = []
  mocks.insertError = null
})

describe('POST /api/v1/ask/sessions/:id/messages — body validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await POST(buildPost('__INVALID_JSON__') as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_body')
  })

  it('returns 400 when query is missing', async () => {
    const res = await POST(buildPost({ public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_query')
  })

  it('returns 400 when public_key is missing', async () => {
    const res = await POST(buildPost({ query: 'Hello' }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('missing_public_key')
  })

  it('returns 400 when query exceeds 4000 chars', async () => {
    const res = await POST(
      buildPost({ query: 'a'.repeat(4001), public_key: PUBLIC_KEY }) as never,
      { params: { id: SESSION_ID } }
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string; message: string } }
    expect(body.error.code).toBe('invalid_query')
    expect(body.error.message).toContain('4000')
  })
})

describe('POST /api/v1/ask/sessions/:id/messages — auth path', () => {
  it('returns 404 when session is not found', async () => {
    mocks.sessionRow = null
    const res = await POST(buildPost({ query: 'q', public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(404)
    expect(mocks.answer).not.toHaveBeenCalled()
  })

  it('returns 410 when session has expired', async () => {
    mocks.sessionRow = {
      ...validSessionRow(),
      expires_at: new Date(Date.now() - 1000).toISOString(),
    }
    const res = await POST(buildPost({ query: 'q', public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(410)
    expect(mocks.answer).not.toHaveBeenCalled()
  })

  it('returns 403 when the public_key is wrong', async () => {
    mocks.sessionRow = validSessionRow()
    const res = await POST(
      buildPost({ query: 'q', public_key: 'wrong-key-of-similar-length-43+chars-x' }) as never,
      { params: { id: SESSION_ID } }
    )
    expect(res.status).toBe(403)
    expect(mocks.answer).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/ask/sessions/:id/messages — answer engine dispatch', () => {
  it('returns 200 and persists user + assistant turns on ok=true', async () => {
    mocks.sessionRow = validSessionRow(0)
    mocks.answer.mockResolvedValue(okAnswer("La PAC air/eau bénéficie de MaPrimeRénov'."))
    const res = await POST(
      buildPost({ query: 'Quel bareme PAC ?', public_key: PUBLIC_KEY }) as never,
      { params: { id: SESSION_ID } }
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      result: { ok: boolean; content: string }
      session: { message_count: number }
    }
    expect(body.result.ok).toBe(true)
    expect(body.result.content).toContain('MaPrimeRénov')
    expect(body.session.message_count).toBe(2)
    expect(mocks.insertedMessages).toHaveLength(2)
    expect(mocks.insertedMessages[0].role).toBe('user')
    expect(mocks.insertedMessages[0].content).toBe('Quel bareme PAC ?')
    expect(mocks.insertedMessages[1].role).toBe('assistant')
    const assistant = mocks.insertedMessages[1] as { citations: unknown }
    expect(Array.isArray(assistant.citations)).toBe(true)
  })

  it('returns 422 when answer() returns ok=false / critic_block', async () => {
    mocks.sessionRow = validSessionRow(0)
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'critic_block',
      userSafeMessage: "Réponse non publiable en l'état.",
      trace: { traceId: SESSION_ID },
    })
    const res = await POST(buildPost({ query: 'YMYL question', public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(422)
    // No persistence on failed turns
    expect(mocks.insertedMessages).toHaveLength(0)
  })

  it('returns 503 when answer() reason=llm_unavailable', async () => {
    mocks.sessionRow = validSessionRow(0)
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'llm_unavailable',
      userSafeMessage: 'down',
      trace: {},
    })
    const res = await POST(buildPost({ query: 'q', public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(503)
  })

  it('returns 500 + captureError when answer() throws', async () => {
    mocks.sessionRow = validSessionRow(0)
    mocks.answer.mockRejectedValue(new Error('boom'))
    const res = await POST(buildPost({ query: 'q', public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(500)
    expect(mocks.captureError).toHaveBeenCalledTimes(1)
    expect(mocks.loggerError).toHaveBeenCalled()
  })
})

describe('POST /api/v1/ask/sessions/:id/messages — rate limit', () => {
  it('returns 429 when checkRateLimit denies', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30_000,
    })
    const res = await POST(buildPost({ query: 'q', public_key: PUBLIC_KEY }) as never, {
      params: { id: SESSION_ID },
    })
    expect(res.status).toBe(429)
    expect(mocks.answer).not.toHaveBeenCalled()
  })
})
