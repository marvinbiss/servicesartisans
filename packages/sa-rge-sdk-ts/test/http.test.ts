import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  SARgeError,
  SARgeRateLimitError,
  SARgeServiceUnavailableError,
  SARgeValidationError,
} from '../src/errors.js'
import { httpGet, httpPost, type HttpOptions } from '../src/internal/http.js'

const OPTS: HttpOptions = {
  baseUrl: 'https://example.test',
  timeoutMs: 5_000,
  userAgent: 'unit-test/1.0',
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function ok(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function err(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('httpGet', () => {
  it('builds URL with query params and skips undefined/null', async () => {
    fetchMock.mockResolvedValueOnce(ok({ result: 'ok' }))
    await httpGet(
      '/api/v1/rge/search',
      { metier: 'plombier', ville: 'paris', limit: undefined, foo: null },
      OPTS
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0]![0] as string
    expect(calledUrl).toContain('https://example.test/api/v1/rge/search')
    expect(calledUrl).toContain('metier=plombier')
    expect(calledUrl).toContain('ville=paris')
    expect(calledUrl).not.toContain('limit=')
    expect(calledUrl).not.toContain('foo=')
  })

  it('sends Accept and User-Agent headers', async () => {
    fetchMock.mockResolvedValueOnce(ok({ ok: true }))
    await httpGet('/api/v1/rge/lookup', { siret: '123' }, OPTS)
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    const headers = init.headers as Record<string, string>
    expect(headers['Accept']).toBe('application/json')
    expect(headers['User-Agent']).toBe('unit-test/1.0')
  })

  it('throws SARgeNetworkError on AbortController timeout', async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const e = new Error('The operation was aborted.')
            e.name = 'AbortError'
            reject(e)
          })
        })
    )
    await expect(httpGet('/slow', {}, { ...OPTS, timeoutMs: 10 })).rejects.toMatchObject({
      name: 'SARgeNetworkError',
      message: /Timeout/,
    })
  })

  it('maps 400 to SARgeValidationError with details', async () => {
    const body = {
      error: { code: 'INVALID_PARAMS', message: 'bad', details: [{ field: 'siret' }] },
    }
    fetchMock.mockResolvedValueOnce(err(body, 400))
    const p = httpGet('/x', {}, OPTS)
    await expect(p).rejects.toBeInstanceOf(SARgeValidationError)
    await p.catch((e: SARgeValidationError) => {
      expect(e.statusCode).toBe(400)
      expect(e.details).toEqual(body)
    })
  })

  it('maps 429 to SARgeRateLimitError', async () => {
    fetchMock.mockResolvedValueOnce(err({ error: 'too_many_requests' }, 429))
    await expect(httpGet('/x', {}, OPTS)).rejects.toBeInstanceOf(SARgeRateLimitError)
  })

  it('maps 503 to SARgeServiceUnavailableError', async () => {
    fetchMock.mockResolvedValueOnce(err({ error: { message: 'AI provider down' } }, 503))
    const p = httpGet('/x', {}, OPTS)
    await expect(p).rejects.toBeInstanceOf(SARgeServiceUnavailableError)
    await p.catch((e: SARgeServiceUnavailableError) => {
      expect(e.message).toContain('AI provider down')
    })
  })

  it('maps 500 to SARgeError with statusCode and details', async () => {
    const body = { error: { message: 'internal boom' } }
    fetchMock.mockResolvedValueOnce(err(body, 500))
    const p = httpGet('/x', {}, OPTS)
    await expect(p).rejects.toBeInstanceOf(SARgeError)
    await p.catch((e: SARgeError) => {
      expect(e.code).toBe('HTTP_ERROR')
      expect(e.statusCode).toBe(500)
      expect(e.details).toEqual(body)
    })
  })

  it('falls back to _raw when response is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('plain text body', { status: 500, headers: { 'Content-Type': 'text/plain' } })
    )
    const p = httpGet<{ _raw: string }>('/x', {}, OPTS)
    await expect(p).rejects.toBeInstanceOf(SARgeError)
    await p.catch((e: SARgeError) => {
      expect(e.details).toEqual({ _raw: 'plain text body' })
    })
  })
})

describe('httpPost', () => {
  it('sends JSON body with Content-Type header', async () => {
    fetchMock.mockResolvedValueOnce(ok({ ok: true }))
    await httpPost('/api/v1/ask', { query: 'test' }, OPTS)
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ query: 'test' }))
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('parses successful JSON response', async () => {
    const payload = {
      result: { ok: true, answer: 'yes' },
      _meta: { api_version: 'v1', license: 'CC-BY-4.0' },
    }
    fetchMock.mockResolvedValueOnce(ok(payload))
    const out = await httpPost<typeof payload>('/api/v1/ask', { query: 'q' }, OPTS)
    expect(out).toEqual(payload)
  })
})
