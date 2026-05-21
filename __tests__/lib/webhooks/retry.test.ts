/**
 * Tests — src/lib/webhooks/retry.ts
 *
 * The orchestrator is fully dependency-injected, so every test wires a
 * fake `WebhooksRetryDeps` and asserts which dep was called with what.
 * No Supabase, no network, no Sentry — all I/O is in the cron route file.
 */

import { describe, it, expect, vi } from 'vitest'

import { runWebhookRetry, type EligibleRow, type WebhooksRetryDeps } from '@/lib/webhooks/retry'
import type { DeliveryResult } from '@/lib/webhooks/delivery'

function buildRow(overrides: Partial<EligibleRow> = {}): EligibleRow {
  return {
    delivery_id: 1,
    webhook_id: 'hook-1',
    event: 'rge.snapshot.refreshed',
    payload: { snapshot_date: '2026-05-21', providers_count: 1, qualifications_count: 1 },
    attempt: 1,
    url: 'https://example.com/h',
    secret: 'secret-aaa',
    active: true,
    consecutive_failures: 0,
    ...overrides,
  }
}

function buildDeps(overrides: Partial<WebhooksRetryDeps> = {}): WebhooksRetryDeps {
  return {
    fetchEligibleRows: vi.fn().mockResolvedValue([]),
    insertRetryDelivery: vi.fn().mockResolvedValue(undefined),
    stampFinal: vi.fn().mockResolvedValue(undefined),
    bumpWebhookFailures: vi.fn().mockResolvedValue({ consecutive_failures: 0 }),
    disableWebhook: vi.fn().mockResolvedValue(undefined),
    deliver: vi.fn().mockResolvedValue({
      status: 200,
      duration_ms: 10,
      body_excerpt: 'ok',
      error: null,
    } satisfies DeliveryResult) as WebhooksRetryDeps['deliver'],
    now: () => new Date('2026-05-21T10:00:00.000Z'),
    ...overrides,
  }
}

describe('webhooks/retry — runWebhookRetry', () => {
  it('empty fetch → all counters zero', async () => {
    const deps = buildDeps()
    const summary = await runWebhookRetry(deps)
    expect(summary).toEqual({
      processed: 0,
      retried: 0,
      terminal_success: 0,
      terminal_failure: 0,
      circuit_broken: 0,
      skipped_inactive: 0,
    })
    expect(deps.deliver).not.toHaveBeenCalled()
  })

  it('inactive hook row → skipped + stampFinal(null) + no delivery attempted', async () => {
    const row = buildRow({ active: false })
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
    })
    const summary = await runWebhookRetry(deps)

    expect(summary.skipped_inactive).toBe(1)
    expect(summary.processed).toBe(1)
    expect(summary.retried).toBe(0)
    expect(deps.deliver).not.toHaveBeenCalled()
    expect(deps.stampFinal).toHaveBeenCalledTimes(1)
    expect(deps.stampFinal).toHaveBeenCalledWith(row.delivery_id, expect.any(Date), null)
  })

  it('200 response → terminal_success + bumpFailures resets + stampFinal(200)', async () => {
    const row = buildRow()
    const deliver = vi.fn().mockResolvedValue({
      status: 200,
      duration_ms: 12,
      body_excerpt: 'ok',
      error: null,
    } satisfies DeliveryResult)
    const bumpWebhookFailures = vi.fn().mockResolvedValue({ consecutive_failures: 0 })
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
      deliver: deliver as WebhooksRetryDeps['deliver'],
      bumpWebhookFailures,
    })

    const summary = await runWebhookRetry(deps)

    expect(summary.terminal_success).toBe(1)
    expect(summary.processed).toBe(1)
    expect(deliver).toHaveBeenCalledTimes(1)
    expect(bumpWebhookFailures).toHaveBeenCalledWith('hook-1', 200)
    expect(deps.stampFinal).toHaveBeenCalledWith(row.delivery_id, expect.any(Date), 200)
    expect(deps.insertRetryDelivery).toHaveBeenCalledTimes(1)
  })

  it('500 attempt=1 → retried + insertRetryDelivery captures next_retry_at', async () => {
    const row = buildRow({ attempt: 1 })
    const deliver = vi.fn().mockResolvedValue({
      status: 500,
      duration_ms: 30,
      body_excerpt: 'boom',
      error: null,
    } satisfies DeliveryResult)
    const insertRetryDelivery = vi.fn().mockResolvedValue(undefined)
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
      deliver: deliver as WebhooksRetryDeps['deliver'],
      insertRetryDelivery,
      bumpWebhookFailures: vi.fn().mockResolvedValue({ consecutive_failures: 1 }),
    })

    const summary = await runWebhookRetry(deps)

    expect(summary.retried).toBe(1)
    expect(summary.terminal_failure).toBe(0)
    expect(insertRetryDelivery).toHaveBeenCalledTimes(1)
    const arg = insertRetryDelivery.mock.calls[0][0]
    expect(arg.next_retry_at).toBeInstanceOf(Date)
    expect(arg.attempt).toBe(2)
    expect(arg.status).toBe(500)
    expect(deps.stampFinal).not.toHaveBeenCalled()
  })

  it('500 attempt at MAX → terminal_failure max_attempts (no retry, no infinite loop)', async () => {
    const row = buildRow({ attempt: 5 })
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
    })

    const summary = await runWebhookRetry(deps)

    // attempt=5 → nextAttempt=6 → over MAX before even delivering.
    expect(summary.terminal_failure).toBe(1)
    expect(summary.retried).toBe(0)
    expect(deps.deliver).not.toHaveBeenCalled()
    expect(deps.stampFinal).toHaveBeenCalledWith(row.delivery_id, expect.any(Date), null)
  })

  it('500 + consecutive_failures=10 → circuit_broken + disableWebhook called', async () => {
    const row = buildRow({ attempt: 1 })
    const deliver = vi.fn().mockResolvedValue({
      status: 503,
      duration_ms: 5,
      body_excerpt: '',
      error: null,
    } satisfies DeliveryResult)
    const disableWebhook = vi.fn().mockResolvedValue(undefined)
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
      deliver: deliver as WebhooksRetryDeps['deliver'],
      bumpWebhookFailures: vi.fn().mockResolvedValue({ consecutive_failures: 10 }),
      disableWebhook,
    })

    const summary = await runWebhookRetry(deps)

    expect(summary.circuit_broken).toBe(1)
    expect(summary.terminal_failure).toBe(1)
    expect(disableWebhook).toHaveBeenCalledWith('hook-1')
    expect(deps.stampFinal).toHaveBeenCalledWith(row.delivery_id, expect.any(Date), 503)
  })

  it('404 → terminal_failure client_error + NO retry', async () => {
    const row = buildRow({ attempt: 1 })
    const deliver = vi.fn().mockResolvedValue({
      status: 404,
      duration_ms: 8,
      body_excerpt: 'not found',
      error: null,
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
      deliver: deliver as WebhooksRetryDeps['deliver'],
      bumpWebhookFailures: vi.fn().mockResolvedValue({ consecutive_failures: 1 }),
    })

    const summary = await runWebhookRetry(deps)

    expect(summary.retried).toBe(0)
    expect(summary.terminal_failure).toBe(1)
    expect(summary.circuit_broken).toBe(0)
    expect(deps.disableWebhook).not.toHaveBeenCalled()
    const insertArg = (deps.insertRetryDelivery as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(insertArg.next_retry_at).toBeNull()
  })

  it('mixed batch (1 ok + 1 5xx) → both counted correctly', async () => {
    const rowA = buildRow({ delivery_id: 10, webhook_id: 'hook-A' })
    const rowB = buildRow({ delivery_id: 11, webhook_id: 'hook-B' })
    const deliver = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        duration_ms: 5,
        body_excerpt: 'ok',
        error: null,
      } satisfies DeliveryResult)
      .mockResolvedValueOnce({
        status: 500,
        duration_ms: 20,
        body_excerpt: 'boom',
        error: null,
      } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([rowA, rowB]),
      deliver: deliver as WebhooksRetryDeps['deliver'],
      bumpWebhookFailures: vi
        .fn()
        .mockResolvedValueOnce({ consecutive_failures: 0 })
        .mockResolvedValueOnce({ consecutive_failures: 1 }),
    })

    const summary = await runWebhookRetry(deps)

    expect(summary.processed).toBe(2)
    expect(summary.terminal_success).toBe(1)
    expect(summary.retried).toBe(1)
    expect(summary.terminal_failure).toBe(0)
    expect(deliver).toHaveBeenCalledTimes(2)
  })

  it('network error (status null) → retried with backoff', async () => {
    const row = buildRow({ attempt: 1 })
    const deliver = vi.fn().mockResolvedValue({
      status: null,
      duration_ms: 10_000,
      body_excerpt: '',
      error: 'AbortError: timeout',
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchEligibleRows: vi.fn().mockResolvedValue([row]),
      deliver: deliver as WebhooksRetryDeps['deliver'],
      bumpWebhookFailures: vi.fn().mockResolvedValue({ consecutive_failures: 1 }),
    })

    const summary = await runWebhookRetry(deps)

    expect(summary.retried).toBe(1)
    const insertArg = (deps.insertRetryDelivery as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(insertArg.next_retry_at).toBeInstanceOf(Date)
    expect(insertArg.status).toBeNull()
    expect(insertArg.error).toMatch(/AbortError/)
  })
})
