/**
 * LLM response cache interface.
 *
 * The Upstash Redis implementation lands with the prompt-cache rollout.
 * `NoopCache` is the default so consumer code paths can be wired now
 * without forcing a cache backend choice on agent authors.
 *
 * Cache key carries an explicit `version` so a prompt template change
 * invalidates entries without manual flushing.
 */

import type { LLMResponse } from './types'

export type LLMCacheKey = {
  promptHash: string
  modelId: string
  version: number
}

export type LLMCache = {
  get(key: LLMCacheKey): Promise<LLMResponse | null>
  set(key: LLMCacheKey, value: LLMResponse, ttlSeconds: number): Promise<void>
  invalidate(prefix: string): Promise<void>
}

export class NoopCache implements LLMCache {
  async get(_key: LLMCacheKey): Promise<LLMResponse | null> {
    return null
  }

  async set(_key: LLMCacheKey, _value: LLMResponse, _ttlSeconds: number): Promise<void> {
    return
  }

  async invalidate(_prefix: string): Promise<void> {
    return
  }
}

export function serializeCacheKey(key: LLMCacheKey): string {
  return `llm:${key.modelId}:v${key.version}:${key.promptHash}`
}
