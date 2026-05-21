import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initLLMRegistryFromEnv } from '@/lib/llm/registry-init'
import { getRegistry, resetRegistry } from '@/lib/llm/provider'
import { LLMProviderUnavailableError } from '@/lib/llm/errors'
import { MistralProvider } from '@/lib/llm/providers/mistral'
import { ClaudeProvider } from '@/lib/llm/providers/claude'
import { GeminiProvider } from '@/lib/llm/providers/gemini'

const ENV_KEYS = ['MISTRAL_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY'] as const

function snapshotEnv(): Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> {
  const snap: Record<string, string | undefined> = {}
  for (const k of ENV_KEYS) snap[k] = process.env[k]
  return snap as Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>
}

function restoreEnv(snap: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>): void {
  for (const k of ENV_KEYS) {
    if (snap[k] === undefined) delete process.env[k]
    else process.env[k] = snap[k]
  }
}

function clearEnv(): void {
  for (const k of ENV_KEYS) delete process.env[k]
}

const baseReq = { messages: [], classification: 'generic' as const }

describe('initLLMRegistryFromEnv', () => {
  let envSnapshot: ReturnType<typeof snapshotEnv>

  beforeEach(() => {
    envSnapshot = snapshotEnv()
    clearEnv()
    resetRegistry()
  })

  afterEach(() => {
    restoreEnv(envSnapshot)
    resetRegistry()
  })

  it('throws when no key is set anywhere', () => {
    expect(() => initLLMRegistryFromEnv()).toThrow(/no provider API key found/)
  })

  it('accepts explicit options.mistralApiKey and registers live Mistral', () => {
    initLLMRegistryFromEnv({ mistralApiKey: 'opts-mistral' })
    const reg = getRegistry()
    expect(reg.mistral).toBeInstanceOf(MistralProvider)
  })

  it('with only ANTHROPIC_API_KEY: claude is live, others fail-closed', async () => {
    process.env.ANTHROPIC_API_KEY = 'env-anthropic'
    initLLMRegistryFromEnv()
    const reg = getRegistry()
    expect(reg.claude).toBeInstanceOf(ClaudeProvider)
    expect(reg.mistral).not.toBeInstanceOf(MistralProvider)
    expect(reg.gemini).not.toBeInstanceOf(GeminiProvider)
    // fail-closed stubs throw on complete
    await expect(reg.mistral.complete(baseReq)).rejects.toBeInstanceOf(LLMProviderUnavailableError)
    await expect(reg.gemini.complete(baseReq)).rejects.toBeInstanceOf(LLMProviderUnavailableError)
    // but expose name + defaultModel correctly
    expect(reg.mistral.name).toBe('mistral')
    expect(reg.mistral.defaultModel).toBe('mistral-large-latest')
    expect(reg.gemini.name).toBe('gemini')
    expect(reg.gemini.defaultModel).toBe('gemini-2.5-pro')
  })

  it('with three keys: all providers are live', () => {
    initLLMRegistryFromEnv({
      mistralApiKey: 'm',
      anthropicApiKey: 'a',
      geminiApiKey: 'g',
    })
    const reg = getRegistry()
    expect(reg.mistral).toBeInstanceOf(MistralProvider)
    expect(reg.claude).toBeInstanceOf(ClaudeProvider)
    expect(reg.gemini).toBeInstanceOf(GeminiProvider)
  })

  it('reads from process.env by default when opts omit a key', () => {
    process.env.GEMINI_API_KEY = 'env-gemini'
    initLLMRegistryFromEnv()
    const reg = getRegistry()
    expect(reg.gemini).toBeInstanceOf(GeminiProvider)
    expect(reg.mistral).not.toBeInstanceOf(MistralProvider)
    expect(reg.claude).not.toBeInstanceOf(ClaudeProvider)
  })

  it('fail-closed stubs throw on stream too', async () => {
    process.env.MISTRAL_API_KEY = 'env-mistral'
    initLLMRegistryFromEnv()
    const reg = getRegistry()
    const iter = reg.claude.stream(baseReq)[Symbol.asyncIterator]()
    await expect(iter.next()).rejects.toBeInstanceOf(LLMProviderUnavailableError)
  })
})
