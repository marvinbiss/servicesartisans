import { afterEach, describe, expect, it, vi } from 'vitest'
import { httpJsonRequest } from '@/lib/llm/http'
import { LLMProviderUnavailableError, LLMRateLimitError, LLMTimeoutError } from '@/lib/llm/errors'

function makeResponse(init: {
  status: number
  body?: unknown
  text?: string
  headers?: Record<string, string>
}): Response {
  const headers = new Headers(init.headers ?? {})
  return {
    ok: init.status >= 200 && init.status < 300,
    status: init.status,
    headers,
    json: async () => init.body ?? {},
    text: async () => init.text ?? JSON.stringify(init.body ?? {}),
  } as unknown as Response
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('httpJsonRequest', () => {
  it('happy path returns parsed JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ status: 200, body: { ok: true } }))
    )
    const out = await httpJsonRequest<{ ok: boolean }>({
      url: 'https://example.invalid/x',
      headers: { 'Content-Type': 'application/json' },
      body: { hello: 'world' },
      provider: 'mistral',
    })
    expect(out.ok).toBe(true)
  })

  it('passes JSON-encoded body and method POST by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ status: 200, body: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)
    await httpJsonRequest({
      url: 'https://example.invalid/x',
      headers: { Authorization: 'Bearer key' },
      body: { foo: 'bar' },
      provider: 'claude',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const callArgs = fetchMock.mock.calls[0]
    expect(callArgs[1].method).toBe('POST')
    expect(callArgs[1].body).toBe(JSON.stringify({ foo: 'bar' }))
    expect(callArgs[1].headers).toEqual({ Authorization: 'Bearer key' })
  })

  it('429 maps to LLMRateLimitError with retry-after parsed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 429,
          text: 'rate limited',
          headers: { 'retry-after': '3' },
        })
      )
    )
    await expect(
      httpJsonRequest({
        url: 'https://example.invalid/x',
        headers: {},
        provider: 'mistral',
      })
    ).rejects.toMatchObject({
      name: 'LLMRateLimitError',
      retryAfterMs: 3000,
    })
  })

  it('429 without retry-after still throws LLMRateLimitError (undefined retryAfterMs)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ status: 429, text: 'no header' }))
    )
    try {
      await httpJsonRequest({
        url: 'https://example.invalid/x',
        headers: {},
        provider: 'gemini',
      })
      throw new Error('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(LLMRateLimitError)
      expect((err as LLMRateLimitError).retryAfterMs).toBeUndefined()
    }
  })

  it('500 maps to LLMProviderUnavailableError with truncated body excerpt', async () => {
    const body = 'x'.repeat(2000)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ status: 500, text: body })))
    try {
      await httpJsonRequest({
        url: 'https://example.invalid/x',
        headers: {},
        provider: 'mistral',
      })
      throw new Error('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(LLMProviderUnavailableError)
      expect((err as LLMProviderUnavailableError).message).toContain('HTTP 500')
      // body excerpt must be capped at 500 chars
      expect((err as LLMProviderUnavailableError).detail.length).toBeLessThanOrEqual(520)
    }
  })

  it('AbortError maps to LLMTimeoutError with configured timeoutMs', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))
    try {
      await httpJsonRequest({
        url: 'https://example.invalid/x',
        headers: {},
        provider: 'claude',
        timeoutMs: 1234,
      })
      throw new Error('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(LLMTimeoutError)
      expect((err as LLMTimeoutError).timeoutMs).toBe(1234)
    }
  })

  it('arbitrary network error wraps in LLMProviderUnavailableError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))
    await expect(
      httpJsonRequest({
        url: 'https://example.invalid/x',
        headers: {},
        provider: 'gemini',
      })
    ).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })
})
