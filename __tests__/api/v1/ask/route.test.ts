/**
 * Tests — POST/GET /api/v1/ask
 *
 * Covers :
 *   - 400 invalid_body (JSON parse failure)
 *   - 400 invalid_params (validateAskRequest fail)
 *   - 503 service_unavailable (registry boot fail)
 *   - 200 happy path (answer ok=true)
 *   - 422 on AnswerResult ok=false / reason=critic_block
 *   - 503 on AnswerResult ok=false / reason=llm_unavailable
 *   - 503 on AnswerResult ok=false / reason=timeout
 *   - 429 on rate-limit exceeded
 *   - 500 on uncaught throw inside answer() (captureError invoked)
 *   - GET discovery endpoint + cache header
 *   - Response headers include X-License + X-Disclosure
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted so mock instances are reusable across describe blocks.
const mocks = vi.hoisted(() => ({
  answer: vi.fn(),
  ensureRegistryBooted: vi.fn(),
  _resetBootForTests: vi.fn(),
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  loggerInfo: vi.fn(),
  captureError: vi.fn(),
}))

vi.mock('@/lib/answer-engine', () => ({
  answer: mocks.answer,
  AnswerEngineError: class AnswerEngineError extends Error {},
  InvalidRequestError: class InvalidRequestError extends Error {},
}))

vi.mock('@/app/api/v1/ask/_registry-boot', () => ({
  ensureRegistryBooted: mocks.ensureRegistryBooted,
  _resetBootForTests: mocks._resetBootForTests,
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: mocks.getClientIp,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: mocks.loggerInfo,
    warn: vi.fn(),
    error: mocks.loggerError,
  },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: mocks.captureError,
}))

import { GET, POST } from '@/app/api/v1/ask/route'

function buildPost(body: unknown, headers: Record<string, string> = {}): unknown {
  return {
    headers: new Headers(headers),
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('Unexpected token')
      return body
    },
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
  mocks.ensureRegistryBooted.mockReturnValue({ ok: true })
})

describe('POST /api/v1/ask — body & validation', () => {
  it('returns 400 invalid_body when JSON parse fails', async () => {
    const res = await POST(buildPost('__INVALID_JSON__') as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string }; _meta: { license: string } }
    expect(body.error.code).toBe('invalid_body')
    expect(body._meta.license).toBe('CC-BY-4.0')
  })

  it('returns 400 invalid_params on empty body {}', async () => {
    const res = await POST(buildPost({}) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as {
      error: { code: string; errors: Array<{ field: string }> }
    }
    expect(body.error.code).toBe('invalid_params')
    expect(body.error.errors.some((e) => e.field === 'query')).toBe(true)
  })

  it('returns 400 invalid_params on invalid aidesContext.geste', async () => {
    const res = await POST(
      buildPost({ query: 'q', aidesContext: { geste: 'not_a_real_geste' } }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { errors: Array<{ field: string }> } }
    expect(body.error.errors.some((e) => e.field === 'aidesContext.geste')).toBe(true)
  })
})

describe('POST /api/v1/ask — registry boot', () => {
  it('returns 503 service_unavailable when registry boot fails', async () => {
    mocks.ensureRegistryBooted.mockReturnValue({
      ok: false,
      error: 'MISTRAL_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY all missing',
    })
    const res = await POST(buildPost({ query: 'Quel est le bareme PAC ?' }) as never)
    expect(res.status).toBe(503)
    const body = (await res.json()) as { error: { code: string }; _meta: { license: string } }
    expect(body.error.code).toBe('service_unavailable')
    expect(body._meta.license).toBe('CC-BY-4.0')
    expect(mocks.loggerError).toHaveBeenCalled()
  })

  it('does not call answer() when registry boot fails', async () => {
    mocks.ensureRegistryBooted.mockReturnValue({ ok: false, error: 'no keys' })
    await POST(buildPost({ query: 'q' }) as never)
    expect(mocks.answer).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/ask — answer engine dispatch', () => {
  it('returns 200 on happy path with full envelope', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: "La PAC air/eau bénéficie de MaPrimeRénov' à hauteur de 5 000 €.",
      citations: [
        { url: 'https://france-renov.gouv.fr', title: 'France Rénov', retrievedAt: '2026-05-21' },
      ],
      trace: {
        traceId: 'trace-1',
        classification: 'ymyl_aides',
        providerUsed: 'mistral',
        modelUsed: 'mistral-large-latest',
        groundTruthInjected: true,
        criticInvoked: true,
        latencyMs: 1234,
        llmUsage: { inputTokens: 100, outputTokens: 200, cost: 0.001 },
      },
    })

    const res = await POST(buildPost({ query: 'Quel est le bareme PAC air/eau ?' }) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      result: { ok: boolean; content: string }
      _meta: { api_version: string; license: string; disclosure: string }
    }
    expect(body.result.ok).toBe(true)
    expect(body.result.content).toContain('MaPrimeRénov')
    expect(body._meta.api_version).toBe('v1')
    expect(body._meta.license).toBe('CC-BY-4.0')
    expect(body._meta.disclosure).toContain('transparence-ia')
    expect(mocks.answer).toHaveBeenCalledTimes(1)
  })

  it('returns 422 when AnswerResult reason=critic_block', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'critic_block',
      userSafeMessage: "Réponse non publiable en l'état.",
      trace: { traceId: 'trace-2' },
    })
    const res = await POST(buildPost({ query: 'q YMYL' }) as never)
    expect(res.status).toBe(422)
    const body = (await res.json()) as { result: { ok: boolean; reason: string } }
    expect(body.result.ok).toBe(false)
    expect(body.result.reason).toBe('critic_block')
  })

  it('returns 503 when AnswerResult reason=llm_unavailable', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'llm_unavailable',
      userSafeMessage: 'Service indisponible',
      trace: { traceId: 'trace-3' },
    })
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.status).toBe(503)
  })

  it('returns 503 when AnswerResult reason=timeout', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'timeout',
      userSafeMessage: 'Délai dépassé',
      trace: { traceId: 'trace-4' },
    })
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.status).toBe(503)
  })

  it('returns 429 when AnswerResult reason=rate_limit', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'rate_limit',
      userSafeMessage: 'Quota épuisé',
      trace: { traceId: 'trace-5' },
    })
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.status).toBe(429)
  })

  it('returns 500 + captureError on uncaught throw', async () => {
    mocks.answer.mockRejectedValue(new Error('boom internal'))
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.status).toBe(500)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('internal_error')
    expect(mocks.captureError).toHaveBeenCalledTimes(1)
    expect(mocks.loggerError).toHaveBeenCalled()
  })
})

describe('POST /api/v1/ask — rate limit', () => {
  it('returns 429 when rate-limit exceeded', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30_000,
    })
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.status).toBe(429)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('rate_limit')
    expect(mocks.answer).not.toHaveBeenCalled()
  })

  it('uses fail-open semantics in checkRateLimit config', async () => {
    await POST(buildPost({ query: 'q' }) as never)
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('v1-ask:'),
      expect.objectContaining({ failOpen: true, max: 60, window: 60_000 })
    )
  })
})

describe('POST /api/v1/ask — headers', () => {
  it('returns X-License and X-Disclosure headers on success', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'ok',
      citations: [],
      trace: {
        traceId: 't',
        classification: 'generic',
        providerUsed: 'mistral',
        modelUsed: 'm',
        groundTruthInjected: false,
        criticInvoked: false,
        latencyMs: 10,
      },
    })
    const res = await POST(buildPost({ query: 'q' }) as never)
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
    expect(res.headers.get('X-Disclosure')).toBe('/transparence-ia')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns X-License headers on 400 error', async () => {
    const res = await POST(buildPost({}) as never)
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
  })
})

describe('GET /api/v1/ask — discovery', () => {
  it('returns endpoint metadata with public cache', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      endpoint: string
      method: string
      version: string
      rate_limit: string
      license: string
      disclosure: string
    }
    expect(body.endpoint).toBe('/api/v1/ask')
    expect(body.method).toBe('POST')
    expect(body.version).toBe('v1')
    expect(body.license).toBe('CC-BY-4.0')
    expect(body.disclosure).toContain('transparence-ia')
    expect(body.rate_limit).toContain('60')
    expect(res.headers.get('Cache-Control')).toContain('max-age=3600')
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
  })
})
