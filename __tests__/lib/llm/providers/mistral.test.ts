import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MistralProvider,
  mapMistralFinishReason,
  pickMistralModel,
} from '@/lib/llm/providers/mistral'
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

const mistralSuccessPayload = {
  id: 'cmpl-1',
  choices: [
    {
      message: { role: 'assistant', content: 'Bonjour' },
      finish_reason: 'stop',
    },
  ],
  usage: { prompt_tokens: 12, completion_tokens: 5, total_tokens: 17 },
}

const baseReq: LLMRequest = {
  messages: [{ role: 'user', content: 'Salut' }],
  classification: 'generic',
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('MistralProvider construction', () => {
  it('throws if apiKey is empty', () => {
    expect(() => new MistralProvider('')).toThrow(LLMProviderUnavailableError)
  })
})

describe('MistralProvider.complete', () => {
  it('happy path returns parsed LLMResponse with cost calculated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ status: 200, body: mistralSuccessPayload }))
    )
    const p = new MistralProvider('test-key')
    const out = await p.complete(baseReq)
    expect(out.content).toBe('Bonjour')
    expect(out.modelUsed).toBe('mistral-large-latest')
    expect(out.providerUsed).toBe('mistral')
    expect(out.usage.inputTokens).toBe(12)
    expect(out.usage.outputTokens).toBe(5)
    expect(out.usage.cost).toBeGreaterThan(0)
    expect(out.stopReason).toBe('end_turn')
    expect(out.toolCalls).toEqual([])
  })

  it('sends Bearer auth header and Content-Type JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: mistralSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new MistralProvider('SECRET-KEY')
    await p.complete(baseReq)
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toContain('api.mistral.ai/v1/chat/completions')
    expect(call[1].headers.Authorization).toBe('Bearer SECRET-KEY')
    expect(call[1].headers['Content-Type']).toBe('application/json')
  })

  it('serializes messages, temperature, max_tokens and tools', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: mistralSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new MistralProvider('k')
    await p.complete({
      messages: [{ role: 'user', content: 'hi' }],
      classification: 'generic',
      temperature: 0.7,
      maxTokens: 256,
      toolDefinitions: [
        {
          name: 'search',
          description: 'web search',
          inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
        },
      ],
    })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.temperature).toBe(0.7)
    expect(body.max_tokens).toBe(256)
    expect(body.tools).toHaveLength(1)
    expect(body.tools[0].type).toBe('function')
    expect(body.tools[0].function.name).toBe('search')
  })

  it('maps 429 to LLMRateLimitError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 429,
          text: 'slow down',
          headers: { 'retry-after': '5' },
        })
      )
    )
    const p = new MistralProvider('k')
    try {
      await p.complete(baseReq)
      throw new Error('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(LLMRateLimitError)
      expect((err as LLMRateLimitError).retryAfterMs).toBe(5000)
    }
  })

  it('maps 500 to LLMProviderUnavailableError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ status: 500, text: 'boom' })))
    const p = new MistralProvider('k')
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })

  it('maps AbortError to LLMTimeoutError', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))
    const p = new MistralProvider('k', 'https://api.mistral.ai/v1', 500)
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMTimeoutError)
  })

  it('throws LLMProviderUnavailableError on empty choices array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            id: 'x',
            choices: [],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          },
        })
      )
    )
    const p = new MistralProvider('k')
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })

  it('parses tool_calls into LLMResponse.toolCalls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            id: 'x',
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: '',
                  tool_calls: [
                    {
                      id: 'call_1',
                      function: { name: 'search', arguments: '{"q":"paris"}' },
                    },
                  ],
                },
                finish_reason: 'tool_calls',
              },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
          },
        })
      )
    )
    const p = new MistralProvider('k')
    const out = await p.complete(baseReq)
    expect(out.toolCalls).toHaveLength(1)
    expect(out.toolCalls[0]).toEqual({ id: 'call_1', name: 'search', arguments: { q: 'paris' } })
    expect(out.stopReason).toBe('tool_use')
  })

  it('safely parses malformed tool_calls arguments to empty object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            id: 'x',
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: '',
                  tool_calls: [{ id: 'c1', function: { name: 'broken', arguments: '{not json' } }],
                },
                finish_reason: 'tool_calls',
              },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          },
        })
      )
    )
    const p = new MistralProvider('k')
    const out = await p.complete(baseReq)
    expect(out.toolCalls[0].arguments).toEqual({})
  })

  it('stream throws LLMProviderUnavailableError', async () => {
    const p = new MistralProvider('k')
    const iter = p.stream(baseReq)[Symbol.asyncIterator]()
    await expect(iter.next()).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })
})

describe('pickMistralModel', () => {
  it('routes bulk_seo to mistral-medium-latest', () => {
    expect(pickMistralModel({ messages: [], classification: 'bulk_seo' })).toBe(
      'mistral-medium-latest'
    )
  })

  it('defaults to mistral-large-latest', () => {
    expect(pickMistralModel({ messages: [], classification: 'generic' })).toBe(
      'mistral-large-latest'
    )
  })

  it('honors metadata.modelOverride', () => {
    expect(
      pickMistralModel({
        messages: [],
        classification: 'bulk_seo',
        metadata: { modelOverride: 'mistral-small-latest' },
      })
    ).toBe('mistral-small-latest')
  })
})

describe('mapMistralFinishReason', () => {
  it('length -> max_tokens', () => {
    expect(mapMistralFinishReason('length')).toBe('max_tokens')
  })
  it('tool_calls -> tool_use', () => {
    expect(mapMistralFinishReason('tool_calls')).toBe('tool_use')
  })
  it('content_filter -> stop_sequence', () => {
    expect(mapMistralFinishReason('content_filter')).toBe('stop_sequence')
  })
  it('stop -> end_turn', () => {
    expect(mapMistralFinishReason('stop')).toBe('end_turn')
  })
  it('unknown -> end_turn', () => {
    expect(mapMistralFinishReason('???')).toBe('end_turn')
  })
})
