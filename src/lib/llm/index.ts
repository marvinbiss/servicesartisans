/**
 * Public surface of the LLM abstraction.
 *
 * Agents import from `@/lib/llm` only — never from a subpath, never from a
 * vendor SDK directly. Adding a provider = updating this barrel + the
 * registry, nothing else in agent code.
 */

export type {
  LLMRole,
  LLMToolCall,
  LLMMessage,
  LLMClassification,
  LLMToolDefinition,
  LLMRequest,
  LLMProviderName,
  LLMStopReason,
  LLMUsage,
  LLMResponse,
  LLMStreamChunk,
} from './types'

export { LLMProvider, initRegistry, getRegistry, resetRegistry } from './provider'
export type { ProviderRegistry } from './provider'

export { chooseModel } from './routing'
export type { ModelChoice } from './routing'

export { MistralProvider } from './providers/mistral'
export { ClaudeProvider } from './providers/claude'
export { GeminiProvider } from './providers/gemini'

export { LLMError, LLMTimeoutError, LLMRateLimitError, LLMProviderUnavailableError } from './errors'

export { NoopCache, serializeCacheKey } from './cache'
export type { LLMCache, LLMCacheKey } from './cache'

export { logLLMRequest, logLLMResponse, logLLMError } from './telemetry'
