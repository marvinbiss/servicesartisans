/**
 * Tests — health check primitives (`src/app/api/v1/health/_checks.ts`).
 *
 * Couvre :
 *  - checkSupabase with no dep injected → fail
 *  - checkSupabase ok fast → status ok
 *  - checkSupabase ok slow > threshold → degraded
 *  - checkSupabase error → fail
 *  - checkSupabase timeout (5s) → fail
 *  - checkUpstash ok → ok
 *  - checkUpstash fail → degraded (not fail — Upstash not critical)
 *  - checkLlmKeysPresent 0 keys → fail
 *  - checkLlmKeysPresent 1 key → degraded
 *  - checkLlmKeysPresent 3 keys → ok
 *  - aggregateStatus mixes : any fail → fail, any degraded → degraded,
 *    all ok → ok
 */
import { describe, it, expect } from 'vitest'

import {
  aggregateStatus,
  checkLlmKeysPresent,
  checkSupabase,
  checkUpstash,
  type HealthCheck,
} from '@/app/api/v1/health/_checks'

describe('checkSupabase', () => {
  it('no dep injected → fail (no_dep_injected)', async () => {
    const result = await checkSupabase({})
    expect(result.name).toBe('supabase')
    expect(result.status).toBe('fail')
    expect(result.details).toBe('no_dep_injected')
  })

  it('ok fast → status ok', async () => {
    // Use injected `now()` to simulate fast response (100ms total).
    let t = 1_000_000
    const now = (): number => {
      const v = t
      t += 100
      return v
    }
    const result = await checkSupabase({
      supabasePing: async () => ({ ok: true }),
      now,
    })
    expect(result.status).toBe('ok')
    expect(result.latency_ms).toBeLessThanOrEqual(1500)
    expect(result.details).toBeUndefined()
  })

  it('ok but slow > 1.5s → degraded (slow_response)', async () => {
    // First `now()` returns 0, second returns 2000 → latency 2000ms.
    const values = [0, 2000]
    const now = (): number => values.shift() ?? 0
    const result = await checkSupabase({
      supabasePing: async () => ({ ok: true }),
      now,
    })
    expect(result.status).toBe('degraded')
    expect(result.latency_ms).toBe(2000)
    expect(result.details).toBe('slow_response')
  })

  it('ping returns error → fail with error details', async () => {
    const result = await checkSupabase({
      supabasePing: async () => ({ ok: false, error: 'connection_refused' }),
    })
    expect(result.status).toBe('fail')
    expect(result.details).toBe('connection_refused')
  })

  it('ping hangs > 5s → fail with timeout details', async () => {
    // The ping never resolves; the internal timeoutPromise (5s) wins the race.
    // To keep the test fast we tighten by stubbing setTimeout? Not necessary —
    // the spec's 5s budget is acceptable; we just verify the timeout branch
    // produces a fail. We resolve the ping after 6s so the 5s timeout fires.
    const hangPromise = new Promise<{ ok: false; error: string }>((resolve) => {
      setTimeout(() => resolve({ ok: false, error: 'late' }), 6_000)
    })
    const result = await checkSupabase({ supabasePing: () => hangPromise })
    expect(result.status).toBe('fail')
    expect(result.details).toBe('timeout')
  }, 10_000)
})

describe('checkUpstash', () => {
  it('ok → ok', async () => {
    let t = 0
    const now = (): number => {
      const v = t
      t += 50
      return v
    }
    const result = await checkUpstash({
      upstashPing: async () => ({ ok: true }),
      now,
    })
    expect(result.name).toBe('upstash')
    expect(result.status).toBe('ok')
  })

  it('fail → degraded (NOT fail — Upstash is not site-critical)', async () => {
    const result = await checkUpstash({
      upstashPing: async () => ({ ok: false, error: 'redis_unreachable' }),
    })
    expect(result.status).toBe('degraded')
    expect(result.details).toBe('redis_unreachable')
  })

  it('no dep injected → fail (no_dep_injected)', async () => {
    const result = await checkUpstash({})
    expect(result.status).toBe('fail')
    expect(result.details).toBe('no_dep_injected')
  })
})

describe('checkLlmKeysPresent', () => {
  it('0 keys present → fail', () => {
    const probe = (keys: string[]): Record<string, boolean> =>
      Object.fromEntries(keys.map((k) => [k, false]))
    const result = checkLlmKeysPresent({ envProbe: probe })
    expect(result.name).toBe('llm_keys')
    expect(result.status).toBe('fail')
    expect(result.details).toMatch(/no LLM provider/)
  })

  it('1 key present → degraded', () => {
    const probe = (keys: string[]): Record<string, boolean> =>
      Object.fromEntries(keys.map((k, i) => [k, i === 0]))
    const result = checkLlmKeysPresent({ envProbe: probe })
    expect(result.status).toBe('degraded')
    expect(result.details).toMatch(/only 1\/3/)
  })

  it('3 keys present → ok', () => {
    const probe = (keys: string[]): Record<string, boolean> =>
      Object.fromEntries(keys.map((k) => [k, true]))
    const result = checkLlmKeysPresent({ envProbe: probe })
    expect(result.status).toBe('ok')
    expect(result.details).toMatch(/3\/3/)
  })

  it('2 keys present → ok (>= 2 threshold)', () => {
    const probe = (keys: string[]): Record<string, boolean> =>
      Object.fromEntries(keys.map((k, i) => [k, i < 2]))
    const result = checkLlmKeysPresent({ envProbe: probe })
    expect(result.status).toBe('ok')
    expect(result.details).toMatch(/2\/3/)
  })
})

describe('aggregateStatus', () => {
  it('all ok → ok', () => {
    const checks: HealthCheck[] = [
      { name: 'a', status: 'ok', latency_ms: 1 },
      { name: 'b', status: 'ok', latency_ms: 2 },
    ]
    expect(aggregateStatus(checks)).toBe('ok')
  })

  it('any degraded (no fail) → degraded', () => {
    const checks: HealthCheck[] = [
      { name: 'a', status: 'ok', latency_ms: 1 },
      { name: 'b', status: 'degraded', latency_ms: 2 },
    ]
    expect(aggregateStatus(checks)).toBe('degraded')
  })

  it('any fail (even with degraded) → fail', () => {
    const checks: HealthCheck[] = [
      { name: 'a', status: 'ok', latency_ms: 1 },
      { name: 'b', status: 'degraded', latency_ms: 2 },
      { name: 'c', status: 'fail', latency_ms: 3 },
    ]
    expect(aggregateStatus(checks)).toBe('fail')
  })

  it('empty array → ok', () => {
    expect(aggregateStatus([])).toBe('ok')
  })
})
