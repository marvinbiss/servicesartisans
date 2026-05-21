import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClaudeProvider, mapClaudeStopReason, pickClaudeModel } from '@/lib/llm/providers/claude'
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

const claudeSuccessPayload = {
  id: 'msg_1',
  type: 'message',
  role: 'assistant',
  model: 'claude-sonnet-4-6',
  content: [{ type: 'text', text: 'Bonjour' }],
  stop_reason: 'end_turn',
  usage: { input_tokens: 20, output_tokens: 8 },
}

const baseReq: LLMRequest = {
  messages: [{ role: 'user', content: 'Salut' }],
  classification: 'generic',
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ClaudeProvider construction', () => {
  it('throws if apiKey is empty', () => {
    expect(() => new ClaudeProvider('')).toThrow(LLMProviderUnavailableError)
  })
})

describe('ClaudeProvider.complete', () => {
  it('happy path returns parsed LLMResponse with cost calculated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ status: 200, body: claudeSuccessPayload }))
    )
    const p = new ClaudeProvider('test-key')
    const out = await p.complete(baseReq)
    expect(out.content).toBe('Bonjour')
    expect(out.modelUsed).toBe('claude-sonnet-4-6')
    expect(out.providerUsed).toBe('claude')
    expect(out.usage.inputTokens).toBe(20)
    expect(out.usage.outputTokens).toBe(8)
    expect(out.usage.cost).toBeGreaterThan(0)
    expect(out.stopReason).toBe('end_turn')
  })

  it('sends x-api-key and anthropic-version headers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: claudeSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new ClaudeProvider('SECRET-KEY')
    await p.complete(baseReq)
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toContain('api.anthropic.com/v1/messages')
    expect(call[1].headers['x-api-key']).toBe('SECRET-KEY')
    expect(call[1].headers['anthropic-version']).toBe('2023-06-01')
    expect(call[1].headers['Content-Type']).toBe('application/json')
  })

  it('extracts role=system messages into top-level `system` field', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: claudeSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new ClaudeProvider('k')
    await p.complete({
      messages: [
        { role: 'system', content: 'You are an expert RGE consultant.' },
        { role: 'system', content: 'Always cite france-renov.gouv.fr.' },
        { role: 'user', content: 'Que faire pour MaPrimeRenov ?' },
      ],
      classification: 'ymyl_aides',
    })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.system).toContain('expert RGE')
    expect(body.system).toContain('france-renov.gouv.fr')
    // system messages must NOT appear in `messages`
    expect(body.messages.every((m: { role: string }) => m.role !== 'system')).toBe(true)
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].role).toBe('user')
  })

  it('parses tool_use content blocks into LLMResponse.toolCalls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            id: 'msg_2',
            type: 'message',
            role: 'assistant',
            content: [
              { type: 'text', text: 'I will search.' },
              {
                type: 'tool_use',
                id: 'toolu_1',
                name: 'search_rge',
                input: { siret: '12345678901234' },
              },
            ],
            stop_reason: 'tool_use',
            usage: { input_tokens: 30, output_tokens: 12 },
          },
        })
      )
    )
    const p = new ClaudeProvider('k')
    const out = await p.complete(baseReq)
    expect(out.content).toBe('I will search.')
    expect(out.toolCalls).toHaveLength(1)
    expect(out.toolCalls[0]).toEqual({
      id: 'toolu_1',
      name: 'search_rge',
      arguments: { siret: '12345678901234' },
    })
    expect(out.stopReason).toBe('tool_use')
  })

  it('reports cache_read_input_tokens and cache_creation_input_tokens in usage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            id: 'msg_3',
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: 'cached' }],
            stop_reason: 'end_turn',
            usage: {
              input_tokens: 1000,
              output_tokens: 100,
              cache_read_input_tokens: 800,
              cache_creation_input_tokens: 200,
            },
          },
        })
      )
    )
    const p = new ClaudeProvider('k')
    const out = await p.complete(baseReq)
    expect(out.usage.cacheReadTokens).toBe(800)
    expect(out.usage.cacheCreationTokens).toBe(200)
    // Cost should factor in cached tier for Sonnet 4.6
    // 800/1e6 * 0.3 + 200/1e6 * 3 + 100/1e6 * 15 = 0.00024 + 0.0006 + 0.0015 = 0.00234
    expect(out.usage.cost).toBeCloseTo(0.00234, 6)
  })

  it('maps 429 to LLMRateLimitError', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          makeResponse({ status: 429, text: 'slow', headers: { 'retry-after': '2' } })
        )
    )
    const p = new ClaudeProvider('k')
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMRateLimitError)
  })

  it('maps AbortError to LLMTimeoutError', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))
    const p = new ClaudeProvider('k', 'https://api.anthropic.com/v1', 500)
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMTimeoutError)
  })

  it('throws LLMProviderUnavailableError on empty content array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          status: 200,
          body: {
            id: 'msg_4',
            type: 'message',
            role: 'assistant',
            content: [],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 0 },
          },
        })
      )
    )
    const p = new ClaudeProvider('k')
    await expect(p.complete(baseReq)).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })

  it('serializes tools using Anthropic `input_schema` shape', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse({ status: 200, body: claudeSuccessPayload }))
    vi.stubGlobal('fetch', fetchMock)
    const p = new ClaudeProvider('k')
    await p.complete({
      ...baseReq,
      toolDefinitions: [
        {
          name: 'lookup_rge',
          description: 'Lookup RGE qualifications',
          inputSchema: { type: 'object', properties: { siret: { type: 'string' } } },
        },
      ],
    })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.tools).toHaveLength(1)
    expect(body.tools[0].name).toBe('lookup_rge')
    expect(body.tools[0].input_schema).toBeTruthy()
  })

  it('stream throws LLMProviderUnavailableError', async () => {
    const p = new ClaudeProvider('k')
    const iter = p.stream(baseReq)[Symbol.asyncIterator]()
    await expect(iter.next()).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })
})

describe('pickClaudeModel', () => {
  it('promotes critic_ymyl to claude-opus-4-7', () => {
    expect(pickClaudeModel({ messages: [], classification: 'critic_ymyl' })).toBe('claude-opus-4-7')
  })

  it('promotes long_context to claude-opus-4-7', () => {
    expect(pickClaudeModel({ messages: [], classification: 'long_context' })).toBe(
      'claude-opus-4-7'
    )
  })

  it('promotes large estimatedInputTokens to claude-opus-4-7', () => {
    expect(
      pickClaudeModel({
        messages: [],
        classification: 'generic',
        estimatedInputTokens: 200_000,
      })
    ).toBe('claude-opus-4-7')
  })

  it('defaults to claude-sonnet-4-6', () => {
    expect(pickClaudeModel({ messages: [], classification: 'generic' })).toBe('claude-sonnet-4-6')
  })

  it('honors metadata.modelOverride', () => {
    expect(
      pickClaudeModel({
        messages: [],
        classification: 'generic',
        metadata: { modelOverride: 'claude-haiku-4-5-20251001' },
      })
    ).toBe('claude-haiku-4-5-20251001')
  })
})

describe('mapClaudeStopReason', () => {
  it('passes through valid reasons', () => {
    expect(mapClaudeStopReason('end_turn')).toBe('end_turn')
    expect(mapClaudeStopReason('max_tokens')).toBe('max_tokens')
    expect(mapClaudeStopReason('tool_use')).toBe('tool_use')
    expect(mapClaudeStopReason('stop_sequence')).toBe('stop_sequence')
  })

  it('defaults unknown reason to end_turn', () => {
    expect(mapClaudeStopReason('???')).toBe('end_turn')
  })
})
