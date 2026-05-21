/**
 * Tests — src/lib/webhooks/emit.ts
 *
 * The emitter is fully dependency-injected, so every test wires a fake
 * `EmitDeps` and asserts the per-subscriber state machine.
 * No Supabase, no network — all I/O is in the admin-emit route file.
 */
import { describe, it, expect, vi } from 'vitest'

import type { DeliveryResult } from '@/lib/webhooks/delivery'
import {
  emitWebhookEvent,
  MAX_FANOUT_PARALLELISM,
  type EmitDeps,
  type SubscriberRow,
} from '@/lib/webhooks/emit'
import type { WebhookPayloadByEvent } from '@/lib/webhooks/events'

const SAMPLE_PAYLOAD: WebhookPayloadByEvent['rge.snapshot.refreshed'] = {
  snapshot_date: '2026-05-21',
  providers_count: 49228,
  qualifications_count: 165432,
}

function buildSub(overrides: Partial<SubscriberRow> = {}): SubscriberRow {
  return {
    id: 'hook-1',
    url: 'https://example.com/h',
    secret: 'secret-aaa',
    consecutive_failures: 0,
    ...overrides,
  }
}

function buildDeps(overrides: Partial<EmitDeps> = {}): EmitDeps {
  return {
    fetchSubscribers: vi.fn().mockResolvedValue([]),
    recordDelivery: vi.fn().mockResolvedValue(undefined),
    updateHookBookkeeping: vi.fn().mockResolvedValue(undefined),
    disableHook: vi.fn().mockResolvedValue(undefined),
    deliver: vi.fn().mockResolvedValue({
      status: 200,
      duration_ms: 10,
      body_excerpt: 'ok',
      error: null,
    } satisfies DeliveryResult) as EmitDeps['deliver'],
    now: () => new Date('2026-05-21T10:00:00.000Z'),
    ...overrides,
  }
}

describe('webhooks/emit — emitWebhookEvent', () => {
  it('0 subscribers → matched=0 + no deliver/record/bookkeeping calls', async () => {
    const deps = buildDeps()
    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary).toEqual({
      event: 'rge.snapshot.refreshed',
      matched: 0,
      delivered: 0,
      failed_initial: 0,
      scheduled_retry: 0,
      circuit_broken: 0,
    })
    expect(deps.deliver).not.toHaveBeenCalled()
    expect(deps.recordDelivery).not.toHaveBeenCalled()
    expect(deps.updateHookBookkeeping).not.toHaveBeenCalled()
    expect(deps.disableHook).not.toHaveBeenCalled()
  })

  it('1 sub + 200 → delivered=1, record(final_status_at), bookkeeping(failures=0)', async () => {
    const sub = buildSub({ consecutive_failures: 3 })
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const updateHookBookkeeping = vi.fn().mockResolvedValue(undefined)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      recordDelivery,
      updateHookBookkeeping,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.matched).toBe(1)
    expect(summary.delivered).toBe(1)
    expect(summary.failed_initial).toBe(0)
    expect(summary.scheduled_retry).toBe(0)
    expect(summary.circuit_broken).toBe(0)

    expect(recordDelivery).toHaveBeenCalledTimes(1)
    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.webhook_id).toBe('hook-1')
    expect(recArg.event).toBe('rge.snapshot.refreshed')
    expect(recArg.attempt).toBe(1)
    expect(recArg.status).toBe(200)
    expect(recArg.next_retry_at).toBeNull()
    expect(recArg.final_status_at).toBeInstanceOf(Date)

    expect(updateHookBookkeeping).toHaveBeenCalledTimes(1)
    expect(updateHookBookkeeping.mock.calls[0][0].consecutive_failures).toBe(0)
    expect(deps.disableHook).not.toHaveBeenCalled()
  })

  it('1 sub + 404 → failed_initial=1, record(final_status_at), bookkeeping(failures+1)', async () => {
    const sub = buildSub({ consecutive_failures: 2 })
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const updateHookBookkeeping = vi.fn().mockResolvedValue(undefined)
    const deliver = vi.fn().mockResolvedValue({
      status: 404,
      duration_ms: 8,
      body_excerpt: 'not found',
      error: null,
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
      updateHookBookkeeping,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.failed_initial).toBe(1)
    expect(summary.delivered).toBe(0)
    expect(summary.scheduled_retry).toBe(0)
    expect(summary.circuit_broken).toBe(0)

    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.status).toBe(404)
    expect(recArg.next_retry_at).toBeNull()
    expect(recArg.final_status_at).toBeInstanceOf(Date)

    expect(updateHookBookkeeping.mock.calls[0][0].consecutive_failures).toBe(3)
    expect(deps.disableHook).not.toHaveBeenCalled()
  })

  it('1 sub + 500 → scheduled_retry=1, record(next_retry_at set), bookkeeping(failures+1)', async () => {
    const sub = buildSub({ consecutive_failures: 1 })
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const updateHookBookkeeping = vi.fn().mockResolvedValue(undefined)
    const deliver = vi.fn().mockResolvedValue({
      status: 500,
      duration_ms: 30,
      body_excerpt: 'boom',
      error: null,
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
      updateHookBookkeeping,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.scheduled_retry).toBe(1)
    expect(summary.delivered).toBe(0)
    expect(summary.failed_initial).toBe(0)
    expect(summary.circuit_broken).toBe(0)

    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.status).toBe(500)
    expect(recArg.next_retry_at).toBeInstanceOf(Date)
    expect(recArg.final_status_at).toBeNull()

    expect(updateHookBookkeeping.mock.calls[0][0].consecutive_failures).toBe(2)
    expect(deps.disableHook).not.toHaveBeenCalled()
  })

  it('1 sub + network error (status=null) → scheduled_retry=1', async () => {
    const sub = buildSub()
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const deliver = vi.fn().mockResolvedValue({
      status: null,
      duration_ms: 10_000,
      body_excerpt: '',
      error: 'AbortError: timeout',
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.scheduled_retry).toBe(1)
    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.status).toBeNull()
    expect(recArg.error).toMatch(/AbortError/)
    expect(recArg.next_retry_at).toBeInstanceOf(Date)
    expect(recArg.final_status_at).toBeNull()
  })

  it('1 sub + consecutive_failures=9 + 500 → circuit_broken=1 + disableHook called', async () => {
    const sub = buildSub({ consecutive_failures: 9 })
    const disableHook = vi.fn().mockResolvedValue(undefined)
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const deliver = vi.fn().mockResolvedValue({
      status: 503,
      duration_ms: 5,
      body_excerpt: '',
      error: null,
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
      disableHook,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.circuit_broken).toBe(1)
    expect(summary.scheduled_retry).toBe(0)
    expect(disableHook).toHaveBeenCalledTimes(1)
    expect(disableHook).toHaveBeenCalledWith('hook-1')

    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.final_status_at).toBeInstanceOf(Date)
    expect(recArg.next_retry_at).toBeNull()
  })

  it('2 subs (200 + 500) → delivered=1 + scheduled_retry=1', async () => {
    const subA = buildSub({ id: 'hook-A' })
    const subB = buildSub({ id: 'hook-B', consecutive_failures: 0 })
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
      fetchSubscribers: vi.fn().mockResolvedValue([subA, subB]),
      deliver: deliver as EmitDeps['deliver'],
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.matched).toBe(2)
    expect(summary.delivered).toBe(1)
    expect(summary.scheduled_retry).toBe(1)
    expect(deliver).toHaveBeenCalledTimes(2)
  })

  it('9 subscribers (> MAX_FANOUT_PARALLELISM=8) → all 9 processed via chunked fan-out', async () => {
    const subs: SubscriberRow[] = Array.from({ length: 9 }, (_, i) => buildSub({ id: `hook-${i}` }))
    const deliver = vi.fn().mockResolvedValue({
      status: 200,
      duration_ms: 5,
      body_excerpt: 'ok',
      error: null,
    } satisfies DeliveryResult)
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue(subs),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(MAX_FANOUT_PARALLELISM).toBe(8)
    expect(summary.matched).toBe(9)
    expect(summary.delivered).toBe(9)
    expect(deliver).toHaveBeenCalledTimes(9)
    expect(recordDelivery).toHaveBeenCalledTimes(9)
  })

  it('deliver throws → result.status=null recorded + scheduled retry', async () => {
    const sub = buildSub({ consecutive_failures: 0 })
    const deliver = vi.fn().mockRejectedValue(new Error('boom-thrown'))
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.scheduled_retry).toBe(1)
    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.status).toBeNull()
    expect(recArg.error).toBe('boom-thrown')
    expect(recArg.next_retry_at).toBeInstanceOf(Date)
  })

  it('recordDelivery throws → logger.warn but bookkeeping still runs', async () => {
    const sub = buildSub()
    const recordDelivery = vi.fn().mockRejectedValue(new Error('insert-failed'))
    const updateHookBookkeeping = vi.fn().mockResolvedValue(undefined)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      recordDelivery,
      updateHookBookkeeping,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.delivered).toBe(1)
    expect(recordDelivery).toHaveBeenCalledTimes(1)
    expect(updateHookBookkeeping).toHaveBeenCalledTimes(1)
  })

  it('updateHookBookkeeping throws → does not crash the emitter', async () => {
    const sub = buildSub()
    const updateHookBookkeeping = vi.fn().mockRejectedValue(new Error('update-failed'))
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      updateHookBookkeeping,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.delivered).toBe(1)
  })

  it('disableHook throws on circuit-break → emitter logs but still increments circuit_broken', async () => {
    const sub = buildSub({ consecutive_failures: 9 })
    const disableHook = vi.fn().mockRejectedValue(new Error('disable-failed'))
    const deliver = vi.fn().mockResolvedValue({
      status: 502,
      duration_ms: 5,
      body_excerpt: '',
      error: null,
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      disableHook,
    })

    const summary = await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    expect(summary.circuit_broken).toBe(1)
    expect(disableHook).toHaveBeenCalledTimes(1)
  })

  it('event payload is forwarded verbatim to deliver()', async () => {
    const sub = buildSub()
    const deliver = vi.fn().mockResolvedValue({
      status: 200,
      duration_ms: 5,
      body_excerpt: 'ok',
      error: null,
    } satisfies DeliveryResult)
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
    })

    const customPayload: WebhookPayloadByEvent['aides.bareme.updated'] = {
      aide: 'maprimerenov',
      version_id: '2026-q3',
      snapshot_date: '2026-07-01',
    }
    await emitWebhookEvent('aides.bareme.updated', customPayload, deps)

    expect(deliver).toHaveBeenCalledWith(sub.url, sub.secret, 'aides.bareme.updated', customPayload)
  })

  it('respects now() override for deterministic timestamps', async () => {
    const sub = buildSub()
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const fakeNow = new Date('2030-01-01T00:00:00.000Z')
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      recordDelivery,
      now: () => fakeNow,
    })

    await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    const recArg = recordDelivery.mock.calls[0][0]
    expect(recArg.final_status_at).toEqual(fakeNow)
  })

  it('500 with consecutive_failures jumping from 0 → next_retry_at +5min (BACKOFF_SCHEDULE_SECONDS[1])', async () => {
    const sub = buildSub({ consecutive_failures: 0 })
    const recordDelivery = vi.fn().mockResolvedValue(undefined)
    const deliver = vi.fn().mockResolvedValue({
      status: 500,
      duration_ms: 5,
      body_excerpt: '',
      error: null,
    } satisfies DeliveryResult)
    const fakeNow = new Date('2026-05-21T10:00:00.000Z')
    const deps = buildDeps({
      fetchSubscribers: vi.fn().mockResolvedValue([sub]),
      deliver: deliver as EmitDeps['deliver'],
      recordDelivery,
      now: () => fakeNow,
    })

    await emitWebhookEvent('rge.snapshot.refreshed', SAMPLE_PAYLOAD, deps)

    const recArg = recordDelivery.mock.calls[0][0]
    const nextRetry = recArg.next_retry_at as Date
    expect(nextRetry).toBeInstanceOf(Date)
    // attempt=2 slot from BACKOFF_SCHEDULE_SECONDS[1] = 300s = +5min
    expect(nextRetry.getTime() - fakeNow.getTime()).toBe(300_000)
  })
})
