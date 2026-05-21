import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeminiProvider, mapGeminiFinishReason, pickGeminiModel } from '@/lib/llm/providers/gemini'
import { LLMProviderUnavailableError, LLMRateLimitError, LLMTimeoutError } from '@/lib/llm/errors'
import type { LLMRequest } from '@/lib/llm/types'

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

const geminiSuccessPayload = {
  candidates: [
    {
      content: {
        role: 'model',
        parts: [{ text: 'Bonjour' }],
      },
      finishReason: 'STOP',
    },
  ],
  usageMetadata: {
    promptTokenCount: 15,
    candidatesTokenCount: 6,
    totalTokenCount: 21,
  },
}

const baseReq: LLMRequest = {
  messages: [{ role: 'user', content: 'Salut' }],
  classification: 'generic',
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('GeminiProvider construction', () => {
  it('throws if apiKey is empty', () => {
    expect(() => new GeminiProvider('')).toThrow(LLMProviderUnavailableError)
  })
})

describe('GeminiProvider.complete', () => {
  it('happy path returns parsed LLMResponse with cost calculated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ status: 200, body: geminiSuccessPayload }))
    )
    const p = new GeminiProvider('test-key')
    const out = await p.complete(baseReq)
    expect(out.content).toBe('Bonjour')
    expect(out.modelUsed).toBe('gemini-2.5-pro')
    expect(out.providerUsed).toBe('gemini')
    expect(out.usage.inputTokens).toBe(15)
    expect(out.usage.outputTokens).toBe(6)
    expect(out.usage.cost).toBeGreaterThan(0)
    expect(out.stopReason).toBe('end_turn')
  })

  it('appends ?key= query param to URL and uses Content-Type JSON header', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: geminiSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new GeminiProvider('SECRET-KEY')
    await p.complete(baseReq)
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toContain('generativelanguage.googleapis.com/v1beta/models/')
    expect(call[0]).toContain('gemini-2.5-pro:generateContent')
    expect(call[0]).toContain('key=SECRET-KEY')
    expect(call[1].headers['Content-Type']).toBe('application/json')
  })

  it('maps assistant role to "model" and uses contents shape', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: geminiSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new GeminiProvider('k')
    await p.complete({
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'How are you?' },
      ],
      classification: 'generic',
    })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.contents).toHaveLength(3)
    expect(body.contents[0].role).toBe('user')
    expect(body.contents[1].role).toBe('model')
    expect(body.contents[1].parts[0].text).toBe('Hi there')
    expect(body.contents[2].role).toBe('user')
  })

  it('extracts role=system messages into systemInstruction', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: geminiSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new GeminiProvider('k')
    await p.complete({
      messages: [
        { role: 'system', content: 'You speak French only.' },
        { role: 'user', content: 'Hello' },
      ],
      classification: 'generic',
    })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.systemInstruction).toBeTruthy()
    expect(body.systemInstruction.parts[0].text).toContain('French only')
    expect(body.contents.every((c: { role: string }) => c.role !== 'system')).toBe(true)
  })

  it('passes generationConfig (temperature, maxOutputTokens)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: geminiSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new GeminiProvider('k')
    await p.complete({ ...baseReq, temperature: 0.5, maxTokens: 512 })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.generationConfig.temperature).toBe(0.5)
    expect(body.generationConfig.maxOutputTokens).toBe(512)
  })

  it('parses candidates[0].content.parts[0].text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            candidates: [
              {
                content: { role: 'model', parts: [{ text: 'Hello ' }, { text: 'world' }] },
                finishReason: 'STOP',
              },
            ],
            usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 2, totalTokenCount: 3 },
          },
        })
      )
    )
    const p = new GeminiProvider('k')
    const out = await p.complete(baseReq)
    expect(out.content).toBe('Hello world')
  })

  it('maps MAX_TOKENS finish reason to max_tokens', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            candidates: [
              {
                content: { role: 'model', parts: [{ text: 'truncated' }] },
                finishReason: 'MAX_TOKENS',
              },
            ],
            usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
          },
        })
      )
    )
    const p = new GeminiProvider('k')
    const out = await p.complete(baseReq)
    expect(out.stopReason).toBe('max_tokens')
  })

  it('maps 429 to LLMRateLimitError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ status: 429, text: 'rate' })))
    const p = new GeminiProvider('k')
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMRateLimitError)
  })

  it('maps AbortError to LLMTimeoutError', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))
    const p = new GeminiProvider('k', 'https://generativelanguage.googleapis.com/v1beta', 500)
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMTimeoutError)
  })

  it('throws LLMProviderUnavailableError on empty candidates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: { candidates: [], usageMetadata: {} },
        })
      )
    )
    const p = new GeminiProvider('k')
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })

  it('stream throws LLMProviderUnavailableError', async () => {
    const p = new GeminiProvider('k')
    const iter = p.stream(baseReq)[Symbol.asyncIterator]()
    await expect(iter.next()).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })
})

describe('pickGeminiModel', () => {
  it('defaults to gemini-2.5-pro', () => {
    expect(pickGeminiModel({ messages: [], classification: 'generic' })).toBe('gemini-2.5-pro')
  })

  it('honors metadata.modelOverride', () => {
    expect(
      pickGeminiModel({
        messages: [],
        classification: 'generic',
        metadata: { modelOverride: 'gemini-2.5-flash' },
      })
    ).toBe('gemini-2.5-flash')
  })
})

describe('mapGeminiFinishReason', () => {
  it('STOP -> end_turn', () => {
    expect(mapGeminiFinishReason('STOP')).toBe('end_turn')
  })
  it('MAX_TOKENS -> max_tokens', () => {
    expect(mapGeminiFinishReason('MAX_TOKENS')).toBe('max_tokens')
  })
  it('SAFETY -> stop_sequence', () => {
    expect(mapGeminiFinishReason('SAFETY')).toBe('stop_sequence')
  })
  it('RECITATION -> stop_sequence', () => {
    expect(mapGeminiFinishReason('RECITATION')).toBe('stop_sequence')
  })
  it('undefined -> end_turn', () => {
    expect(mapGeminiFinishReason(undefined)).toBe('end_turn')
  })
})
