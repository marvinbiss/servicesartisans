/**
 * Shared fixtures for the API v1 RGE-OS Playwright smoke pack (Ralph 35).
 *
 * Smoke pack philosophy : exercise each public v1 endpoint at the wire
 * level (status code + envelope shape + critical headers) without
 * touching the LLM-bound paths that would cost money on every CI tick.
 * The expensive endpoints (/api/v1/ask POST, /ask/stream POST,
 * /sessions/messages POST) are only smoked via their GET metadata or
 * 400/401 body-validation paths.
 *
 * Env gating : these specs assume a running Next.js dev server on
 * `BASE_URL` (defaults to `http://localhost:3099` to match
 * `playwright.config.ts`). Tests skip gracefully when
 * `E2E_RUN_SMOKE` is not set AND no server is reachable on `BASE_URL`,
 * so the default CI tick stays cheap.
 */

import { request, type APIRequestContext, type APIResponse } from '@playwright/test'

export const BASE_URL =
  process.env.E2E_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.BASE_URL ??
  'http://localhost:3099'

export const SHOULD_RUN_SMOKE = process.env.E2E_RUN_SMOKE === '1'

export type ParsedBody = unknown

export type FetchResult = {
  response: APIResponse
  body: ParsedBody
}

function toUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, BASE_URL)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

function safeParse(text: string): ParsedBody {
  try {
    return JSON.parse(text)
  } catch {
    return { _raw: text }
  }
}

export async function getJson(
  ctx: APIRequestContext,
  path: string,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<FetchResult> {
  const response = await ctx.get(toUrl(path, params), { headers })
  const body = safeParse(await response.text())
  return { response, body }
}

export async function postJson(
  ctx: APIRequestContext,
  path: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<FetchResult> {
  const response = await ctx.post(toUrl(path), {
    data: body,
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
  })
  const parsed = safeParse(await response.text())
  return { response, body: parsed }
}

export async function postRaw(
  ctx: APIRequestContext,
  path: string,
  rawBody: string,
  contentType: string
): Promise<FetchResult> {
  const response = await ctx.post(toUrl(path), {
    data: rawBody,
    headers: { 'Content-Type': contentType },
  })
  const parsed = safeParse(await response.text())
  return { response, body: parsed }
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/**
 * Assert the standard `_meta` envelope present on most v1 endpoints.
 * Tolerates the absence of `_meta` for raw-payload endpoints (e.g.
 * /openapi/yaml). For JSON envelopes we expect `_meta.api_version='v1'`
 * + `_meta.license='CC-BY-4.0'`.
 */
export function expectV1Meta(body: ParsedBody): void {
  if (!isObject(body)) throw new Error('expectV1Meta: body is not a JSON object')
  const meta = body._meta
  if (!isObject(meta)) throw new Error('expectV1Meta: missing _meta object')
  if (meta.api_version !== 'v1') {
    throw new Error(`expectV1Meta: api_version mismatch (got ${String(meta.api_version)})`)
  }
  if (meta.license !== 'CC-BY-4.0') {
    throw new Error(`expectV1Meta: license mismatch (got ${String(meta.license)})`)
  }
}

/**
 * Acquire a Playwright `APIRequestContext` against the configured
 * BASE_URL. Each spec calls `await ctx.dispose()` in its teardown to
 * release the underlying connection pool deterministically.
 */
export async function newApiContext(): Promise<APIRequestContext> {
  return request.newContext({ baseURL: BASE_URL })
}

/**
 * Probe a single `/api/v1/health` request to decide whether the
 * smoke pack should auto-skip when no server is reachable. We use a
 * short timeout so CI never blocks waiting for a server that will
 * never come up.
 */
export async function isServerReachable(): Promise<boolean> {
  try {
    const ctx = await request.newContext({ baseURL: BASE_URL, timeout: 2000 })
    try {
      const response = await ctx.get(toUrl('/api/v1/health'))
      return response.status() < 500
    } finally {
      await ctx.dispose()
    }
  } catch {
    return false
  }
}
