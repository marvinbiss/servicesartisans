/**
 * Lazy LLM registry boot — singleton guard.
 *
 * Why per-worker lazy boot rather than top-level side-effect import:
 * Vercel cold-starts a Node worker per /api/v1/ask invocation burst. We
 * want `initLLMRegistryFromEnv()` (Ralph 10) called exactly once per
 * worker process, on the FIRST request that needs it, so that:
 *   - The unit tests for `_validation.ts` and other route tests can mock
 *     this module and never touch the real `@/lib/llm/registry-init`.
 *   - If env keys are missing, the route still boots and we return a
 *     structured 503 `service_unavailable` (fail-CLOSED, NOT a silent
 *     degraded response) instead of crashing the worker.
 *   - The error is cached so we don't repeat the same throw on every
 *     request during an incident — Vercel logs would explode.
 *
 * `instrumentation.ts` will eventually call this at boot in a separate
 * sprint; until then, the route owns the initialization.
 */

import { initLLMRegistryFromEnv } from '@/lib/llm/registry-init'
import { logger } from '@/lib/logger'

let bootDone = false
let bootError: Error | null = null

export type BootResult = { ok: true } | { ok: false; error: string }

export function ensureRegistryBooted(): BootResult {
  if (bootDone) {
    return bootError ? { ok: false, error: bootError.message } : { ok: true }
  }
  bootDone = true
  try {
    initLLMRegistryFromEnv()
    logger.info('llm.registry.booted', { env: process.env.NODE_ENV })
    return { ok: true }
  } catch (err) {
    bootError = err instanceof Error ? err : new Error(String(err))
    logger.error('llm.registry.boot_failed', { error: bootError.message })
    return { ok: false, error: bootError.message }
  }
}

/**
 * Reset the singleton for unit tests. NEVER call this from production code.
 */
export function _resetBootForTests(): void {
  bootDone = false
  bootError = null
}
