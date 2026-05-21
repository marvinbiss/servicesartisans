/**
 * LLM error hierarchy.
 *
 * Why a dedicated hierarchy: the registry / agents must distinguish
 * "retry with backoff" (rate limit), "circuit-break this provider" (unavailable),
 * and "hard fail the request" (timeout > SLA budget) without string matching
 * provider-specific messages.
 */

export class LLMError extends Error {
  readonly provider: string
  readonly cause?: unknown

  constructor(message: string, provider: string, cause?: unknown) {
    super(message)
    this.name = 'LLMError'
    this.provider = provider
    this.cause = cause
  }
}

export class LLMTimeoutError extends LLMError {
  readonly timeoutMs: number

  constructor(provider: string, timeoutMs: number, cause?: unknown) {
    super(`LLM ${provider} timeout after ${timeoutMs}ms`, provider, cause)
    this.name = 'LLMTimeoutError'
    this.timeoutMs = timeoutMs
  }
}

export class LLMRateLimitError extends LLMError {
  readonly retryAfterMs?: number

  constructor(provider: string, retryAfterMs?: number, cause?: unknown) {
    super(`LLM ${provider} rate limit hit`, provider, cause)
    this.name = 'LLMRateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

export class LLMProviderUnavailableError extends LLMError {
  readonly detail: string

  constructor(provider: string, detail: string, cause?: unknown) {
    super(`LLM ${provider} unavailable: ${detail}`, provider, cause)
    this.name = 'LLMProviderUnavailableError'
    this.detail = detail
  }
}
