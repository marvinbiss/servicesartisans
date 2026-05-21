/**
 * Tests — src/lib/webhooks/retry-policy.ts
 *
 * Pure state-machine unit tests. No I/O, no mocks.
 */

import { describe, it, expect } from 'vitest'

import {
  BACKOFF_SCHEDULE_SECONDS,
  MAX_ATTEMPTS,
  MAX_CONSECUTIVE_FAILURES,
  computeNextRetryAt,
  decideRetry,
  isClientError,
  isTerminalStatus,
} from '@/lib/webhooks/retry-policy'

describe('webhooks/retry-policy — isTerminalStatus', () => {
  it('treats 2xx as terminal success', () => {
    expect(isTerminalStatus(200)).toBe(true)
    expect(isTerminalStatus(204)).toBe(true)
    expect(isTerminalStatus(299)).toBe(true)
  })

  it('treats non-2xx and null as non-terminal', () => {
    expect(isTerminalStatus(199)).toBe(false)
    expect(isTerminalStatus(300)).toBe(false)
    expect(isTerminalStatus(404)).toBe(false)
    expect(isTerminalStatus(500)).toBe(false)
    expect(isTerminalStatus(null)).toBe(false)
  })
})

describe('webhooks/retry-policy — isClientError', () => {
  it('flags 4xx as client error', () => {
    expect(isClientError(400)).toBe(true)
    expect(isClientError(404)).toBe(true)
    expect(isClientError(422)).toBe(true)
    expect(isClientError(499)).toBe(true)
  })

  it('does NOT flag 2xx / 5xx / null', () => {
    expect(isClientError(200)).toBe(false)
    expect(isClientError(500)).toBe(false)
    expect(isClientError(503)).toBe(false)
    expect(isClientError(null)).toBe(false)
  })
})

describe('webhooks/retry-policy — computeNextRetryAt', () => {
  const baseNow = new Date('2026-05-21T10:00:00.000Z')

  it('returns null when next attempt would exceed MAX_ATTEMPTS', () => {
    expect(computeNextRetryAt(MAX_ATTEMPTS, baseNow)).toBeNull()
    expect(computeNextRetryAt(MAX_ATTEMPTS + 1, baseNow)).toBeNull()
  })

  it('produces the documented backoff schedule for valid attempts', () => {
    // schedule indexed by attempt - 1, so attempt=2 → BACKOFF[1] = 300s.
    const at2 = computeNextRetryAt(2, baseNow)
    expect(at2).not.toBeNull()
    expect(at2!.getTime() - baseNow.getTime()).toBe(BACKOFF_SCHEDULE_SECONDS[1] * 1000)

    // attempt=4 (highest below MAX_ATTEMPTS=5) → BACKOFF[3] = 10_800s (3h).
    const at4 = computeNextRetryAt(4, baseNow)
    expect(at4).not.toBeNull()
    expect(at4!.getTime() - baseNow.getTime()).toBe(BACKOFF_SCHEDULE_SECONDS[3] * 1000)
  })
})

describe('webhooks/retry-policy — decideRetry', () => {
  const baseNow = new Date('2026-05-21T10:00:00.000Z')

  it('200 → terminal success regardless of attempt / failures', () => {
    expect(decideRetry(1, 200, 0, baseNow)).toEqual({ action: 'terminal', reason: 'success' })
    expect(decideRetry(5, 204, 9, baseNow)).toEqual({ action: 'terminal', reason: 'success' })
  })

  it('404 → terminal client_error (no retry, integrator bug)', () => {
    expect(decideRetry(1, 404, 0, baseNow)).toEqual({
      action: 'terminal',
      reason: 'client_error',
    })
    expect(decideRetry(3, 422, 0, baseNow)).toEqual({
      action: 'terminal',
      reason: 'client_error',
    })
  })

  it('500 attempt=1 → retry with nextRetryAt +5min (schedule[1])', () => {
    const decision = decideRetry(1, 500, 0, baseNow)
    expect(decision.action).toBe('retry')
    if (decision.action === 'retry') {
      expect(decision.nextRetryAt.getTime() - baseNow.getTime()).toBe(
        BACKOFF_SCHEDULE_SECONDS[1] * 1000
      )
    }
  })

  it('500 attempt=MAX_ATTEMPTS → terminal max_attempts', () => {
    expect(decideRetry(MAX_ATTEMPTS, 500, 0, baseNow)).toEqual({
      action: 'terminal',
      reason: 'max_attempts',
    })
  })

  it('null status (network error) attempt=2 → retry with nextRetryAt +30min', () => {
    const decision = decideRetry(2, null, 0, baseNow)
    expect(decision.action).toBe('retry')
    if (decision.action === 'retry') {
      expect(decision.nextRetryAt.getTime() - baseNow.getTime()).toBe(
        BACKOFF_SCHEDULE_SECONDS[2] * 1000
      )
    }
  })

  it('consecutive_failures >= MAX_CONSECUTIVE_FAILURES → circuit_breaker (even at attempt 1)', () => {
    expect(decideRetry(1, 500, MAX_CONSECUTIVE_FAILURES, baseNow)).toEqual({
      action: 'terminal',
      reason: 'circuit_breaker',
    })
    expect(decideRetry(2, null, MAX_CONSECUTIVE_FAILURES + 3, baseNow)).toEqual({
      action: 'terminal',
      reason: 'circuit_breaker',
    })
  })

  it('circuit_breaker takes precedence over max_attempts', () => {
    // success > client_error > circuit_breaker > max_attempts > retry
    const d = decideRetry(MAX_ATTEMPTS, 500, MAX_CONSECUTIVE_FAILURES, baseNow)
    expect(d).toEqual({ action: 'terminal', reason: 'circuit_breaker' })
  })

  it('success takes precedence over circuit_breaker (always honour 2xx)', () => {
    const d = decideRetry(1, 200, MAX_CONSECUTIVE_FAILURES, baseNow)
    expect(d).toEqual({ action: 'terminal', reason: 'success' })
  })
})
