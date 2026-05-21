/**
 * Boot-time LLM registry initialization.
 *
 * Called from `src/instrumentation.ts` when Next.js boots (wiring deferred
 * to a separate sprint to keep this PR scope-isolated). Behavior:
 *   - If NONE of the three env keys is set, throw immediately so a
 *     misconfigured deploy surfaces in build logs rather than in user
 *     queries.
 *   - If at least ONE key is set, register live providers for the keys
 *     present and fail-closed stubs for the missing ones. Calling
 *     `complete()` on a fail-closed stub throws LLMProviderUnavailableError
 *     with a clear "<X>_API_KEY not set" detail so the routing layer can
 *     either fall back to another provider or surface a structured error
 *     to the caller.
 */

import { LLMProviderUnavailableError } from './errors'
import { initRegistry, LLMProvider } from './provider'
import { ClaudeProvider } from './providers/claude'
import { GeminiProvider } from './providers/gemini'
import { MistralProvider } from './providers/mistral'
import type { LLMProviderName, LLMRequest, LLMResponse, LLMStreamChunk } from './types'

export type InitLLMRegistryOptions = {
  mistralApiKey?: string
  anthropicApiKey?: string
  geminiApiKey?: string
}

export function initLLMRegistryFromEnv(opts: InitLLMRegistryOptions = {}): void {
  const mistralApiKey = opts.mistralApiKey ?? process.env.MISTRAL_API_KEY
  const anthropicApiKey = opts.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY
  const geminiApiKey = opts.geminiApiKey ?? process.env.GEMINI_API_KEY

  if (!mistralApiKey && !anthropicApiKey && !geminiApiKey) {
    throw new Error(
      'LLM registry init: no provider API key found (MISTRAL_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY). At least one required.'
    )
  }

  initRegistry({
    mistral: mistralApiKey
      ? new MistralProvider(mistralApiKey)
      : makeUnavailableProvider('mistral', 'MISTRAL_API_KEY not set'),
    claude: anthropicApiKey
      ? new ClaudeProvider(anthropicApiKey)
      : makeUnavailableProvider('claude', 'ANTHROPIC_API_KEY not set'),
    gemini: geminiApiKey
      ? new GeminiProvider(geminiApiKey)
      : makeUnavailableProvider('gemini', 'GEMINI_API_KEY not set'),
  })
}

class UnavailableProvider extends LLMProvider {
  readonly name: LLMProviderName
  readonly defaultModel: string
  private readonly reason: string

  constructor(name: LLMProviderName, defaultModel: string, reason: string) {
    super()
    this.name = name
    this.defaultModel = defaultModel
    this.reason = reason
  }

  async complete(_req: LLMRequest): Promise<LLMResponse> {
    throw new LLMProviderUnavailableError(this.name, this.reason)
  }

  // eslint-disable-next-line require-yield -- fail-closed stub
  async *stream(_req: LLMRequest): AsyncIterable<LLMStreamChunk> {
    throw new LLMProviderUnavailableError(this.name, this.reason)
  }
}

function makeUnavailableProvider(name: LLMProviderName, reason: string): LLMProvider {
  const defaultModel =
    name === 'mistral'
      ? 'mistral-large-latest'
      : name === 'claude'
        ? 'claude-sonnet-4-6'
        : 'gemini-2.5-pro'
  return new UnavailableProvider(name, defaultModel, reason)
}
