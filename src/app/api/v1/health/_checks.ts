/**
 * Health check primitives. Pure functions that wrap external dependency
 * pings with bounded timeout + structured result.
 *
 * Each check returns `{ status: 'ok' | 'degraded' | 'fail', latency_ms,
 * details? }`. The route handlers aggregate per-check results into the
 * overall response.
 *
 * "degraded" = the dep responded but in a way that suggests partial
 * degradation (e.g., Supabase 200 but slow > threshold). "fail" = the
 * dep did not respond or returned an error status.
 *
 * Design notes
 * ------------
 * - Dependency injection : the actual Supabase/Upstash pings live in the
 *   deep route handler (which has access to the admin client and env vars).
 *   These primitives only encapsulate the timeout + classification logic,
 *   keeping them trivially unit-testable without HTTP mocking.
 * - The `now` injection is used by tests to assert latency_ms branches
 *   (slow > threshold ⇒ degraded) deterministically.
 * - Upstash check downgrade : a hard fail on Upstash returns "degraded",
 *   not "fail" — the site survives a Redis outage (rate-limiter has
 *   failOpen fallback to memoryLimiter). Supabase fail = site fail.
 */

const CHECK_TIMEOUT_MS = 5_000
const SLOW_THRESHOLD_MS = 1_500

export type HealthStatus = 'ok' | 'degraded' | 'fail'

export type HealthCheck = {
  name: string
  status: HealthStatus
  latency_ms: number
  details?: string
}

export type HealthCheckDeps = {
  supabasePing?: () => Promise<{ ok: boolean; error?: string }>
  upstashPing?: () => Promise<{ ok: boolean; error?: string }>
  envProbe?: (keys: string[]) => Record<string, boolean>
  now?: () => number
}

export async function checkSupabase(deps: HealthCheckDeps): Promise<HealthCheck> {
  const now = deps.now ?? Date.now
  const start = now()
  if (!deps.supabasePing) {
    return { name: 'supabase', status: 'fail', latency_ms: 0, details: 'no_dep_injected' }
  }
  const timeoutPromise = new Promise<{ ok: false; error: string }>((resolve) =>
    setTimeout(() => resolve({ ok: false, error: 'timeout' }), CHECK_TIMEOUT_MS)
  )
  const result = await Promise.race([deps.supabasePing(), timeoutPromise])
  const latency_ms = now() - start
  if (!result.ok) {
    return {
      name: 'supabase',
      status: 'fail',
      latency_ms,
      details: result.error ?? 'unknown_error',
    }
  }
  if (latency_ms > SLOW_THRESHOLD_MS) {
    return { name: 'supabase', status: 'degraded', latency_ms, details: 'slow_response' }
  }
  return { name: 'supabase', status: 'ok', latency_ms }
}

export async function checkUpstash(deps: HealthCheckDeps): Promise<HealthCheck> {
  const now = deps.now ?? Date.now
  const start = now()
  if (!deps.upstashPing) {
    return { name: 'upstash', status: 'fail', latency_ms: 0, details: 'no_dep_injected' }
  }
  const timeoutPromise = new Promise<{ ok: false; error: string }>((resolve) =>
    setTimeout(() => resolve({ ok: false, error: 'timeout' }), CHECK_TIMEOUT_MS)
  )
  const result = await Promise.race([deps.upstashPing(), timeoutPromise])
  const latency_ms = now() - start
  if (!result.ok) {
    return {
      name: 'upstash',
      status: 'degraded',
      latency_ms,
      details: result.error ?? 'unknown_error',
    }
  }
  if (latency_ms > SLOW_THRESHOLD_MS) {
    return { name: 'upstash', status: 'degraded', latency_ms, details: 'slow_response' }
  }
  return { name: 'upstash', status: 'ok', latency_ms }
}

export function checkLlmKeysPresent(deps: HealthCheckDeps): HealthCheck {
  const now = deps.now ?? Date.now
  const start = now()
  const probe =
    deps.envProbe ??
    ((keys: string[]) => Object.fromEntries(keys.map((k) => [k, !!process.env[k]])))
  const keys = ['MISTRAL_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY']
  const present = probe(keys)
  const presentCount = Object.values(present).filter(Boolean).length
  const latency_ms = now() - start
  if (presentCount === 0) {
    return {
      name: 'llm_keys',
      status: 'fail',
      latency_ms,
      details: 'no LLM provider keys configured',
    }
  }
  if (presentCount < 2) {
    return {
      name: 'llm_keys',
      status: 'degraded',
      latency_ms,
      details: `only ${presentCount}/3 providers configured`,
    }
  }
  return {
    name: 'llm_keys',
    status: 'ok',
    latency_ms,
    details: `${presentCount}/3 providers configured`,
  }
}

export function aggregateStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some((c) => c.status === 'fail')) return 'fail'
  if (checks.some((c) => c.status === 'degraded')) return 'degraded'
  return 'ok'
}
