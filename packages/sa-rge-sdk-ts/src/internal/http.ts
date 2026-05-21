/**
 * Internal fetch wrapper for the SDK.
 *
 * Responsibilities:
 *  - Build URL with query params (skipping undefined/null)
 *  - Set Accept + User-Agent + Content-Type headers
 *  - AbortController-based timeout
 *  - Map HTTP status codes to typed errors (validation, rate-limit, 503, ...)
 *  - Best-effort JSON parsing with raw-text fallback
 *
 * Zero runtime dependencies: relies on Node 18+ native fetch / AbortController.
 */

import {
  SARgeError,
  SARgeNetworkError,
  SARgeRateLimitError,
  SARgeServiceUnavailableError,
  SARgeValidationError,
} from '../errors.js'

export type HttpOptions = {
  baseUrl: string
  timeoutMs: number
  userAgent: string
}

export type QueryParam = string | number | undefined | null

export async function httpGet<T>(
  path: string,
  params: Record<string, QueryParam>,
  opts: HttpOptions
): Promise<T> {
  const url = new URL(path, opts.baseUrl)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }
  return doRequest<T>(url, { method: 'GET' }, opts)
}

export async function httpPost<T>(path: string, body: unknown, opts: HttpOptions): Promise<T> {
  const url = new URL(path, opts.baseUrl)
  return doRequest<T>(
    url,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    },
    opts
  )
}

async function doRequest<T>(url: URL, init: RequestInit, opts: HttpOptions): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs)
  try {
    const response = await fetch(url.toString(), {
      ...init,
      headers: {
        Accept: 'application/json',
        'User-Agent': opts.userAgent,
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    })
    const text = await response.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { _raw: text }
    }

    if (response.status === 400) {
      throw new SARgeValidationError(getErrMessage(parsed) ?? 'Validation failed', parsed)
    }
    if (response.status === 429) {
      throw new SARgeRateLimitError()
    }
    if (response.status === 503) {
      throw new SARgeServiceUnavailableError(getErrMessage(parsed) ?? 'Service unavailable')
    }
    if (response.status >= 400) {
      throw new SARgeError(
        'HTTP_ERROR',
        `HTTP ${response.status}: ${getErrMessage(parsed) ?? text.slice(0, 200)}`,
        {
          statusCode: response.status,
          details: parsed,
        }
      )
    }
    return parsed as T
  } catch (err) {
    if (err instanceof SARgeError) throw err
    if (
      err instanceof Error &&
      (err.name === 'AbortError' || err.message === 'The operation was aborted.')
    ) {
      throw new SARgeNetworkError(`Timeout after ${opts.timeoutMs}ms`)
    }
    throw new SARgeNetworkError(err instanceof Error ? err.message : String(err))
  } finally {
    clearTimeout(timer)
  }
}

function getErrMessage(parsed: unknown): string | undefined {
  if (parsed && typeof parsed === 'object' && 'error' in parsed) {
    const e = (parsed as { error: unknown }).error
    if (typeof e === 'string') return e
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message
      if (typeof m === 'string') return m
    }
  }
  if (parsed && typeof parsed === 'object' && 'message' in parsed) {
    const m = (parsed as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  return undefined
}
