/**
 * Tests — POST/GET /api/v1/ask/stream
 *
 * The route delegates to `streamAnswer` (orchestrator tested elsewhere)
 * and to `checkRateLimit`. We mock both and assert :
 *   - HTTP status code mapping (400/429/200)
 *   - Headers (text/event-stream + X-License + X-Disclosure)
 *   - Body validation (missing/empty/oversize query)
 *   - Stream body containing the orchestrator's frames
 *   - GET discovery endpoint shape
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  streamAnswer: vi.fn(),
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  captureError: vi.fn(),
}))

vi.mock('@/app/api/v1/ask/stream/_stream-orchestrator', () => ({
  streamAnswer: mocks.streamAnswer,
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

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: mocks.captureError,
}))

import { GET, POST } from '@/app/api/v1/ask/stream/route'

function buildPost(
  body: unknown,
  headers: Record<string, string> = {},
  opts: { signal?: AbortSignal } = {}
): unknown {
  const signal = opts.signal ?? new AbortController().signal
  return {
    headers: new Headers(headers),
    signal,
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('Unexpected token')
      return body
    },
  }
}

async function readStream(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let out = ''
  // Safety bound — never loop forever in tests.
  for (let i = 0; i < 100; i++) {
    const { value, done } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
  }
  out += decoder.decode()
  return out
}

async function* asyncFrames(frames: string[]): AsyncIterable<string> {
  for (const f of frames) yield f
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 19,
    resetTime: Date.now() + 60_000,
  })
  mocks.getClientIp.mockReturnValue('127.0.0.1')
  mocks.streamAnswer.mockImplementation(() =>
    asyncFrames([
      `event: start\ndata: ${JSON.stringify({ traceId: 't', status: 'starting' })}\n\n`,
      `event: chunk\ndata: ${JSON.stringify({ delta: 'Hello.', cumulative: 6 })}\n\n`,
      `event: done\ndata: ${JSON.stringify({ ok: true, latency_ms: 12, citations: [] })}\n\n`,
    ])
  )
})

describe('POST /api/v1/ask/stream — body validation', () => {
  it('returns 400 invalid_body when JSON parse fails', async () => {
    const res = await POST(buildPost('__INVALID_JSON__') as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_body')
    expect(res.headers.get('Content-Type')).toContain('application/json')
  })

  it('returns 400 invalid_params on missing query', async () => {
    const res = await POST(buildPost({}) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string; message: string } }
    expect(body.error.code).toBe('invalid_params')
    expect(body.error.message).toContain('query')
  })

  it('returns 400 invalid_params on oversize query (>4000 chars)', async () => {
    const huge = 'x'.repeat(4001)
    const res = await POST(buildPost({ query: huge }) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string; message: string } }
    expect(body.error.code).toBe('invalid_params')
    expect(body.error.message).toContain('4000')
  })
})

describe('POST /api/v1/ask/stream — happy path', () => {
  it('returns 200 with text/event-stream Content-Type', async () => {
    const res = await POST(buildPost({ query: 'Bonjour' }) as never)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(res.headers.get('X-Accel-Buffering')).toBe('no')
  })

  it('streams orchestrator frames into the response body', async () => {
    const res = await POST(buildPost({ query: 'q' }) as never)
    const body = await readStream(res)
    expect(body).toContain('event: start')
    expect(body).toContain('event: chunk')
    expect(body).toContain('event: done')
  })

  it('passes parsed input (incl. aidesContext) to streamAnswer', async () => {
    await POST(
      buildPost({
        query: 'Quel est le bareme PAC ?',
        aidesContext: { geste: 'pac_air_eau' },
        traceId: 'caller-1',
      }) as never
    )
    expect(mocks.streamAnswer).toHaveBeenCalledTimes(1)
    const [input] = mocks.streamAnswer.mock.calls[0]
    expect(input.query).toBe('Quel est le bareme PAC ?')
    expect(input.aidesContext).toEqual({ geste: 'pac_air_eau' })
    expect(input.traceId).toBe('caller-1')
  })
})

describe('POST /api/v1/ask/stream — rate limit', () => {
  it('returns 429 JSON when rate limit exceeded', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30_000,
    })
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.status).toBe(429)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('rate_limit')
    expect(mocks.streamAnswer).not.toHaveBeenCalled()
  })

  it('uses 20 req/min fail-open semantics', async () => {
    await POST(buildPost({ query: 'q' }) as never)
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('v1-ask-stream:'),
      expect.objectContaining({ failOpen: true, max: 20, window: 60_000 })
    )
  })
})

describe('POST /api/v1/ask/stream — headers', () => {
  it('includes X-License + X-Disclosure on streaming response', async () => {
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
    expect(res.headers.get('X-Disclosure')).toBe('/transparence-ia')
  })

  it('includes X-License on 400 error envelope', async () => {
    const res = await POST(buildPost({}) as never)
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
  })
})

describe('GET /api/v1/ask/stream — discovery', () => {
  it('returns endpoint metadata with public cache', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      endpoint: string
      method: string
      response_format: string
      rate_limit: string
      license: string
      disclosure: string
    }
    expect(body.endpoint).toBe('/api/v1/ask/stream')
    expect(body.method).toBe('POST')
    expect(body.response_format).toBe('text/event-stream')
    expect(body.rate_limit).toContain('20')
    expect(body.license).toBe('CC-BY-4.0')
    expect(body.disclosure).toContain('transparence-ia')
    expect(res.headers.get('Cache-Control')).toContain('max-age=3600')
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
  })
})
