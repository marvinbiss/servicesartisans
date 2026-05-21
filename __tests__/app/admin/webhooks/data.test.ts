/**
 * Tests — src/app/admin/(dashboard)/webhooks/_data.ts
 *
 * Covers :
 *   - projectWebhookSummary computes success_count from joined deliveries
 *   - projectWebhookSummary defaults missing fields (events null, active null)
 *   - projectDeliveryRow renames response_body_excerpt → body_excerpt
 *   - listWebhooksWithStats wraps Supabase + projects
 *   - listRecentDeliveries wraps Supabase + projects
 *   - error from Supabase propagates as Error
 *
 * We use a relative path import (not `@/`) because path aliases with
 * parentheses (`(dashboard)`) are not handled by some IDE tooling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  selectWebhooks: vi.fn(),
  selectDeliveries: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'rge_os_webhooks') {
        return {
          select: () => ({
            order: () => ({
              limit: async () => mocks.selectWebhooks(),
            }),
          }),
        }
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => mocks.selectDeliveries(),
            }),
          }),
        }),
      }
    },
  }),
}))

import {
  listRecentDeliveries,
  listWebhooksWithStats,
  projectDeliveryRow,
  projectWebhookSummary,
} from '../../../../src/app/admin/(dashboard)/webhooks/_data'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('projectWebhookSummary', () => {
  it('computes success_count from deliveries with 2xx status', () => {
    const summary = projectWebhookSummary({
      id: 'a',
      url: 'https://x',
      events: ['rge.snapshot.refreshed'],
      active: true,
      created_at: '2026-01-01',
      last_delivery_at: '2026-05-01',
      last_delivery_status: 200,
      email: 'sub@x.com',
      consecutive_failures: 0,
      rge_os_webhook_deliveries: [
        { id: 1, status: 200 },
        { id: 2, status: 204 },
        { id: 3, status: 500 },
        { id: 4, status: null },
      ],
    })
    expect(summary.delivery_count).toBe(4)
    expect(summary.success_count).toBe(2)
    expect(summary.active).toBe(true)
  })

  it('defaults events to [] and active to false when null', () => {
    const summary = projectWebhookSummary({
      id: 'b',
      url: 'https://y',
      events: null,
      active: null,
      created_at: '2026-01-01',
      last_delivery_at: null,
      last_delivery_status: null,
      email: null,
      consecutive_failures: null,
      rge_os_webhook_deliveries: null,
    })
    expect(summary.events).toEqual([])
    expect(summary.active).toBe(false)
    expect(summary.delivery_count).toBe(0)
    expect(summary.consecutive_failures).toBe(0)
  })

  it('handles deliveries returned as a single object (PostgREST quirk)', () => {
    const summary = projectWebhookSummary({
      id: 'c',
      url: 'https://z',
      events: [],
      active: true,
      created_at: '2026-01-01',
      last_delivery_at: null,
      last_delivery_status: null,
      email: null,
      consecutive_failures: 0,
      rge_os_webhook_deliveries: { id: 9, status: 200 },
    })
    expect(summary.delivery_count).toBe(1)
    expect(summary.success_count).toBe(1)
  })
})

describe('projectDeliveryRow', () => {
  it('renames response_body_excerpt to body_excerpt', () => {
    const row = projectDeliveryRow({
      id: 5,
      event: 'rge.snapshot.refreshed',
      status: 200,
      duration_ms: 42,
      response_body_excerpt: 'hello',
      error: null,
      created_at: '2026-05-01T00:00:00.000Z',
      attempt: 2,
    })
    expect(row.body_excerpt).toBe('hello')
    expect(row.attempt).toBe(2)
  })

  it('defaults attempt to 1 when null', () => {
    const row = projectDeliveryRow({
      id: 6,
      event: 'rge.snapshot.refreshed',
      status: null,
      duration_ms: null,
      response_body_excerpt: null,
      error: 'timeout',
      created_at: '2026-05-01T00:00:00.000Z',
      attempt: null,
    })
    expect(row.attempt).toBe(1)
    expect(row.body_excerpt).toBeNull()
  })
})

describe('listWebhooksWithStats', () => {
  it('projects supabase rows + computes stats', async () => {
    mocks.selectWebhooks.mockResolvedValueOnce({
      data: [
        {
          id: 'h1',
          url: 'https://a',
          events: ['rge.snapshot.refreshed'],
          active: true,
          created_at: '2026-01-01',
          last_delivery_at: null,
          last_delivery_status: null,
          email: null,
          consecutive_failures: 0,
          rge_os_webhook_deliveries: [{ id: 1, status: 200 }],
        },
      ],
      error: null,
    })
    const rows = await listWebhooksWithStats()
    expect(rows).toHaveLength(1)
    expect(rows[0].success_count).toBe(1)
  })

  it('propagates supabase error as Error', async () => {
    mocks.selectWebhooks.mockResolvedValueOnce({ data: null, error: { message: 'pgrst' } })
    await expect(listWebhooksWithStats()).rejects.toThrow(/pgrst/)
  })

  it('handles empty rows', async () => {
    mocks.selectWebhooks.mockResolvedValueOnce({ data: [], error: null })
    const rows = await listWebhooksWithStats()
    expect(rows).toEqual([])
  })
})

describe('listRecentDeliveries', () => {
  it('projects supabase rows', async () => {
    mocks.selectDeliveries.mockResolvedValueOnce({
      data: [
        {
          id: 10,
          event: 'rge.snapshot.refreshed',
          status: 200,
          duration_ms: 11,
          response_body_excerpt: 'k',
          error: null,
          created_at: '2026-05-01T00:00:00.000Z',
          attempt: 1,
        },
      ],
      error: null,
    })
    const rows = await listRecentDeliveries('h1', 20)
    expect(rows).toHaveLength(1)
    expect(rows[0].body_excerpt).toBe('k')
  })

  it('propagates supabase error', async () => {
    mocks.selectDeliveries.mockResolvedValueOnce({ data: null, error: { message: 'down' } })
    await expect(listRecentDeliveries('h1', 20)).rejects.toThrow(/down/)
  })
})
