/**
 * HTTP transport helpers shared by all three live LLM providers.
 *
 * Centralizing the error mapping keeps the providers thin and ensures
 * downstream agents see the same error hierarchy regardless of which
 * vendor failed: 429 -> LLMRateLimitError(retryAfterMs), AbortError ->
 * LLMTimeoutError, anything else non-2xx -> LLMProviderUnavailableError
 * with a body excerpt (truncated 500 chars) for log forensics.
 */

import { LLMProviderUnavailableError, LLMRateLimitError, LLMTimeoutError } from './errors'
import type { LLMProviderName } from './types'

export type HttpRequestOptions = {
  url: string
  method?: 'POST' | 'GET'
  headers: Record<string, string>
  body?: unknown
  timeoutMs?: number
  provider: LLMProviderName
}

export async function httpJsonRequest<T>(opts: HttpRequestOptions): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? 60_000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(opts.url, {
      method: opts.method ?? 'POST',
      headers: opts.headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    })

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : undefined
      throw new LLMRateLimitError(
        opts.provider,
        Number.isFinite(retryAfterMs) ? retryAfterMs : undefined
      )
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '<unreadable>')
      throw new LLMProviderUnavailableError(
        opts.provider,
        `HTTP ${response.status}: ${text.slice(0, 500)}`
      )
    }

    return (await response.json()) as T
  } catch (err) {
    if (err instanceof LLMRateLimitError || err instanceof LLMProviderUnavailableError) {
      throw err
    }
    const errName = (err as { name?: string } | null)?.name
    if (errName === 'AbortError') {
      throw new LLMTimeoutError(opts.provider, timeoutMs, err)
    }
    throw new LLMProviderUnavailableError(
      opts.provider,
      `network error: ${(err as Error | null)?.message ?? String(err)}`,
      err
    )
  } finally {
    clearTimeout(timer)
  }
}
