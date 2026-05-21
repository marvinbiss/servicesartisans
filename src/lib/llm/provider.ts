/**
 * Provider abstraction + registry singleton.
 *
 * The registry is a module-level singleton because:
 * 1. provider construction allocates HTTP clients / token buckets we want to
 *    share across the process,
 * 2. agents must NEVER instantiate providers themselves — that path leaks
 *    SDK choices into business code.
 *
 * `initRegistry` is meant to be called at boot (instrumentation.ts) once
 * environment is validated. `resetRegistry` exists for tests only.
 */

import type { LLMProviderName, LLMRequest, LLMResponse, LLMStreamChunk } from './types'

export abstract class LLMProvider {
  abstract readonly name: LLMProviderName
  abstract readonly defaultModel: string
  abstract complete(req: LLMRequest): Promise<LLMResponse>
  abstract stream(req: LLMRequest): AsyncIterable<LLMStreamChunk>
}

export type ProviderRegistry = {
  mistral: LLMProvider
  claude: LLMProvider
  gemini: LLMProvider
}

let registryInstance: ProviderRegistry | null = null

export function initRegistry(providers: ProviderRegistry): void {
  registryInstance = providers
}

export function getRegistry(): ProviderRegistry {
  if (!registryInstance) {
    throw new Error('LLM registry not initialized — call initRegistry() at boot')
  }
  return registryInstance
}

export function resetRegistry(): void {
  registryInstance = null
}
