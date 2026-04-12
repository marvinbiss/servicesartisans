import { describe, it, expect } from 'vitest'
import { computeNextRetryAt, MAX_SYNC_ATTEMPTS } from '@/lib/integrations/pipedrive'

describe('Pipedrive DLQ — exponential backoff', () => {
  const now = new Date('2026-04-12T10:00:00.000Z')

  it('waits 30s after the first failure (attempts=1)', () => {
    const next = computeNextRetryAt(1, now)
    expect(next.getTime() - now.getTime()).toBe(30 * 1000)
  })

  it('waits 2 minutes after the second failure (attempts=2)', () => {
    const next = computeNextRetryAt(2, now)
    expect(next.getTime() - now.getTime()).toBe(120 * 1000)
  })

  it('waits 8 minutes after the third failure (attempts=3)', () => {
    const next = computeNextRetryAt(3, now)
    expect(next.getTime() - now.getTime()).toBe(480 * 1000)
  })

  it('waits 32 minutes after the fourth failure (attempts=4)', () => {
    const next = computeNextRetryAt(4, now)
    expect(next.getTime() - now.getTime()).toBe(1920 * 1000)
  })

  it('produces a strictly monotonic backoff schedule', () => {
    const delays = [1, 2, 3, 4].map((a) => computeNextRetryAt(a, now).getTime() - now.getTime())
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1])
    }
  })

  it('caps retry at MAX_SYNC_ATTEMPTS = 5', () => {
    expect(MAX_SYNC_ATTEMPTS).toBe(5)
  })
})
