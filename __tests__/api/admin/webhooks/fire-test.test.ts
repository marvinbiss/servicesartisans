/**
 * Tests — POST /api/admin/webhooks/fire-test
 *
 * Covers :
 *   - 403 when requirePermission rejects
 *   - 400 invalid body / missing id / non-uuid / unknown event
 *   - 404 when webhook missing
 *   - 200 + deliverWebhook called + delivery inserted + hook updated
 *   - 200 + delivered:false when subscriber returns 5xx (still recorded)
 *   - 500 on supabase fetch error
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ADMIN_ID = '00000000-0000-0000-0000-000000000099'
const HOOK_ID = '11111111-1111-1111-1111-111111111111'

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
  loggerError: vi.fn(),
  loggerWarn: vi.fn(),
  deliverWebhook: vi.fn(),
  fetchRow: vi.fn(),
  insertDelivery: vi.fn(),
  updateHook: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({
  requirePermission: mocks.requirePermission,
  logAdminAction: mocks.logAdminAction,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: mocks.loggerWarn,
    error: mocks.loggerError,
  },
}))

vi.mock('@/lib/webhooks', async () => {
  const actual = await vi.importActual<typeof import('@/lib/webhooks')>('@/lib/webhooks')
  return {
    ...actual,
    deliverWebhook: mocks.deliverWebhook,
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'rge_os_webhooks') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => mocks.fetchRow(),
            }),
          }),
          update: (patch: unknown) => ({
            eq: async (col: string, val: unknown) => {
              return mocks.updateHook(patch, col, val)
            },
          }),
        }
      }
      // rge_os_webhook_deliveries
      return {
        insert: async (row: unknown) => mocks.insertDelivery(row),
      }
    },
  }),
}))

import { POST } from '@/app/api/admin/webhooks/fire-test/route'

function buildPost(body: unknown): unknown {
  return {
    json: async () => {
      if (body === '__INVALID__') throw new Error('parse')
      return body
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requirePermission.mockResolvedValue({
    success: true,
    admin: { id: ADMIN_ID, email: 'op@sa.fr', role: 'admin', permissions: {} },
  })
  mocks.fetchRow.mockResolvedValue({
    data: { id: HOOK_ID, url: 'https://example.com/h', secret: 'secret-xyz', active: true },
    error: null,
  })
  mocks.deliverWebhook.mockResolvedValue({
    status: 200,
    duration_ms: 42,
    body_excerpt: 'ok',
    error: null,
  })
  mocks.insertDelivery.mockResolvedValue({ error: null })
  mocks.updateHook.mockResolvedValue({ error: null })
  mocks.logAdminAction.mockResolvedValue(undefined)
})

describe('POST /api/admin/webhooks/fire-test — auth', () => {
  it('returns the auth error when requirePermission rejects', async () => {
    const errResponse = { status: 403 }
    mocks.requirePermission.mockResolvedValueOnce({ success: false, error: errResponse })
    const res = (await POST(
      buildPost({ id: HOOK_ID, event: 'rge.snapshot.refreshed' }) as never
    )) as unknown
    expect(res).toBe(errResponse)
    expect(mocks.deliverWebhook).not.toHaveBeenCalled()
  })
})

describe('POST /api/admin/webhooks/fire-test — validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await POST(buildPost('__INVALID__') as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id is missing', async () => {
    const res = await POST(buildPost({ event: 'rge.snapshot.refreshed' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id is not a uuid', async () => {
    const res = await POST(buildPost({ id: 'nope', event: 'rge.snapshot.refreshed' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when event is unknown', async () => {
    const res = await POST(buildPost({ id: HOOK_ID, event: 'user.banned' }) as never)
    expect(res.status).toBe(400)
    expect(mocks.deliverWebhook).not.toHaveBeenCalled()
  })
})

describe('POST /api/admin/webhooks/fire-test — delivery', () => {
  it('returns 404 when webhook does not exist', async () => {
    mocks.fetchRow.mockResolvedValueOnce({ data: null, error: null })
    const res = await POST(buildPost({ id: HOOK_ID, event: 'rge.snapshot.refreshed' }) as never)
    expect(res.status).toBe(404)
    expect(mocks.deliverWebhook).not.toHaveBeenCalled()
  })

  it('returns 200 + delivered:true + inserts delivery row + updates hook', async () => {
    const res = await POST(buildPost({ id: HOOK_ID, event: 'rge.snapshot.refreshed' }) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok: boolean
      delivered: boolean
      status: number | null
      duration_ms: number | null
    }
    expect(body.ok).toBe(true)
    expect(body.delivered).toBe(true)
    expect(body.status).toBe(200)
    expect(mocks.deliverWebhook).toHaveBeenCalledTimes(1)
    const [url, secret, event] = mocks.deliverWebhook.mock.calls[0]
    expect(url).toBe('https://example.com/h')
    expect(secret).toBe('secret-xyz')
    expect(event).toBe('rge.snapshot.refreshed')

    expect(mocks.insertDelivery).toHaveBeenCalledTimes(1)
    const inserted = mocks.insertDelivery.mock.calls[0][0] as Record<string, unknown>
    expect(inserted.webhook_id).toBe(HOOK_ID)
    expect(inserted.event).toBe('rge.snapshot.refreshed')
    expect(inserted.status).toBe(200)
    expect(inserted.response_body_excerpt).toBe('ok')
    expect(inserted.attempt).toBe(1)

    expect(mocks.updateHook).toHaveBeenCalledTimes(1)
    const [patch] = mocks.updateHook.mock.calls[0]
    expect(patch).toMatchObject({ last_delivery_status: 200 })

    expect(mocks.logAdminAction).toHaveBeenCalledTimes(1)
    const [, action, resource] = mocks.logAdminAction.mock.calls[0]
    expect(action).toBe('webhook_test_fired')
    expect(resource).toBe('settings')
  })

  it('returns 200 + delivered:false when subscriber returns 500 (still records)', async () => {
    mocks.deliverWebhook.mockResolvedValueOnce({
      status: 500,
      duration_ms: 33,
      body_excerpt: 'down',
      error: null,
    })
    const res = await POST(buildPost({ id: HOOK_ID, event: 'aides.bareme.updated' }) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { delivered: boolean; status: number }
    expect(body.delivered).toBe(false)
    expect(body.status).toBe(500)
    expect(mocks.insertDelivery).toHaveBeenCalledTimes(1)
  })

  it('records network error as status null with error message', async () => {
    mocks.deliverWebhook.mockResolvedValueOnce({
      status: null,
      duration_ms: 10010,
      body_excerpt: '',
      error: 'AbortError: timeout',
    })
    const res = await POST(buildPost({ id: HOOK_ID, event: 'rge.snapshot.refreshed' }) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      delivered: boolean
      status: number | null
      error: string | null
    }
    expect(body.delivered).toBe(false)
    expect(body.status).toBeNull()
    expect(body.error).toBe('AbortError: timeout')
  })
})

describe('POST /api/admin/webhooks/fire-test — supabase error', () => {
  it('returns 500 when hook fetch fails', async () => {
    mocks.fetchRow.mockResolvedValueOnce({ data: null, error: { message: 'pgrst' } })
    const res = await POST(buildPost({ id: HOOK_ID, event: 'rge.snapshot.refreshed' }) as never)
    expect(res.status).toBe(500)
    expect(mocks.deliverWebhook).not.toHaveBeenCalled()
    expect(mocks.loggerError).toHaveBeenCalled()
  })
})
