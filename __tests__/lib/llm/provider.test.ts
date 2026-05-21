import { describe, it, expect, beforeEach } from 'vitest'
import {
  LLMProvider,
  initRegistry,
  getRegistry,
  resetRegistry,
  type ProviderRegistry,
} from '@/lib/llm/provider'
import {
  LLMError,
  LLMTimeoutError,
  LLMRateLimitError,
  LLMProviderUnavailableError,
} from '@/lib/llm/errors'
import { MistralProvider } from '@/lib/llm/providers/mistral'
import { ClaudeProvider } from '@/lib/llm/providers/claude'
import { GeminiProvider } from '@/lib/llm/providers/gemini'
import { NoopCache, serializeCacheKey } from '@/lib/llm/cache'
import type { LLMProviderName, LLMRequest, LLMResponse, LLMStreamChunk } from '@/lib/llm/types'

class MockProvider extends LLMProvider {
  readonly name: LLMProviderName
  readonly defaultModel: string

  constructor(name: LLMProviderName, defaultModel: string) {
    super()
    this.name = name
    this.defaultModel = defaultModel
  }

  async complete(_req: LLMRequest): Promise<LLMResponse> {
    return {
      content: 'mock',
      toolCalls: [],
      modelUsed: this.defaultModel,
      providerUsed: this.name,
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 0,
      stopReason: 'end_turn',
    }
  }

  async *stream(_req: LLMRequest): AsyncIterable<LLMStreamChunk> {
    yield { type: 'text_delta', text: 'mock' }
  }
}

describe('registry', () => {
  beforeEach(() => {
    resetRegistry()
  })

  it('throws when getRegistry is called before initRegistry', () => {
    expect(() => getRegistry()).toThrow('LLM registry not initialized')
  })

  it('returns the registered instance after initRegistry', () => {
    const reg: ProviderRegistry = {
      mistral: new MockProvider('mistral', 'mistral-large-latest'),
      claude: new MockProvider('claude', 'claude-sonnet-4-6'),
      gemini: new MockProvider('gemini', 'gemini-2.5-pro'),
    }
    initRegistry(reg)
    expect(getRegistry()).toBe(reg)
  })

  it('resetRegistry clears the singleton', () => {
    initRegistry({
      mistral: new MockProvider('mistral', 'mistral-large-latest'),
      claude: new MockProvider('claude', 'claude-sonnet-4-6'),
      gemini: new MockProvider('gemini', 'gemini-2.5-pro'),
    })
    resetRegistry()
    expect(() => getRegistry()).toThrow('LLM registry not initialized')
  })
})

describe('error hierarchy', () => {
  it('LLMTimeoutError is an LLMError and carries provider + timeout', () => {
    const err = new LLMTimeoutError('mistral', 30_000)
    expect(err).toBeInstanceOf(LLMError)
    expect(err).toBeInstanceOf(LLMTimeoutError)
    expect(err.provider).toBe('mistral')
    expect(err.timeoutMs).toBe(30_000)
    expect(err.message).toContain('30000ms')
  })

  it('LLMRateLimitError exposes retryAfterMs when supplied', () => {
    const err = new LLMRateLimitError('claude', 1500)
    expect(err).toBeInstanceOf(LLMError)
    expect(err.retryAfterMs).toBe(1500)
  })

  it('LLMRateLimitError leaves retryAfterMs undefined when omitted', () => {
    const err = new LLMRateLimitError('claude')
    expect(err.retryAfterMs).toBeUndefined()
  })

  it('LLMProviderUnavailableError message contains detail and provider', () => {
    const err = new LLMProviderUnavailableError('gemini', 'circuit open after 5 5xx')
    expect(err).toBeInstanceOf(LLMError)
    expect(err.message).toContain('gemini')
    expect(err.message).toContain('circuit open after 5 5xx')
    expect(err.detail).toBe('circuit open after 5 5xx')
  })
})

describe('provider stubs', () => {
  it('MistralProvider.complete throws unavailable', async () => {
    const p = new MistralProvider()
    expect(p.name).toBe('mistral')
    expect(p.defaultModel).toBe('mistral-large-latest')
    await expect(p.complete({ messages: [], classification: 'generic' })).rejects.toBeInstanceOf(
      LLMProviderUnavailableError
    )
  })

  it('ClaudeProvider.complete throws unavailable', async () => {
    const p = new ClaudeProvider()
    expect(p.name).toBe('claude')
    expect(p.defaultModel).toBe('claude-sonnet-4-6')
    await expect(p.complete({ messages: [], classification: 'generic' })).rejects.toBeInstanceOf(
      LLMProviderUnavailableError
    )
  })

  it('GeminiProvider.complete throws unavailable', async () => {
    const p = new GeminiProvider()
    expect(p.name).toBe('gemini')
    expect(p.defaultModel).toBe('gemini-2.5-pro')
    await expect(p.complete({ messages: [], classification: 'generic' })).rejects.toBeInstanceOf(
      LLMProviderUnavailableError
    )
  })

  it('MistralProvider.stream throws unavailable on first iteration', async () => {
    const p = new MistralProvider()
    const iter = p.stream({ messages: [], classification: 'generic' })[Symbol.asyncIterator]()
    await expect(iter.next()).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })
})

describe('cache', () => {
  it('NoopCache.get always resolves null', async () => {
    const cache = new NoopCache()
    const got = await cache.get({ promptHash: 'h', modelId: 'm', version: 1 })
    expect(got).toBeNull()
  })

  it('NoopCache.set and invalidate resolve without throwing', async () => {
    const cache = new NoopCache()
    const fakeResp: LLMResponse = {
      content: '',
      toolCalls: [],
      modelUsed: 'm',
      providerUsed: 'mistral',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 0,
      stopReason: 'end_turn',
    }
    await expect(
      cache.set({ promptHash: 'h', modelId: 'm', version: 1 }, fakeResp, 60)
    ).resolves.toBeUndefined()
    await expect(cache.invalidate('llm:')).resolves.toBeUndefined()
  })

  it('serializeCacheKey produces stable string format', () => {
    const k = serializeCacheKey({ promptHash: 'abc', modelId: 'mistral-large-latest', version: 3 })
    expect(k).toBe('llm:mistral-large-latest:v3:abc')
  })
})
