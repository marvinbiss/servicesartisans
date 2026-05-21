/**
 * Tests — POST /api/admin/webhooks/toggle
 *
 * Covers :
 *   - 403 when requirePermission rejects
 *   - 400 on invalid JSON body / missing id / non-uuid
 *   - 200 happy path + supabase.update called with correct flag
 *   - 200 + audit_logs row inserted via logAdminAction
 *   - 500 on supabase error
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ADMIN_ID = '00000000-0000-0000-0000-000000000001'

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
  loggerError: vi.fn(),
  loggerWarn: vi.fn(),
  hookUpdate: vi.fn(),
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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'rge_os_webhooks') {
        return {
          update: (patch: unknown) => ({
            eq: async (col: string, val: unknown) => {
              return mocks.hookUpdate(patch, col, val)
            },
          }),
        }
      }
      return {}
    },
  }),
}))

import { POST } from '@/app/api/admin/webhooks/toggle/route'

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
  mocks.hookUpdate.mockResolvedValue({ error: null })
  mocks.logAdminAction.mockResolvedValue(undefined)
})

describe('POST /api/admin/webhooks/toggle — auth', () => {
  it('returns the auth error when requirePermission rejects', async () => {
    const errResponse = { status: 403, body: { error: 'forbidden' } }
    mocks.requirePermission.mockResolvedValueOnce({ success: false, error: errResponse })
    const res = (await POST(
      buildPost({ id: '11111111-1111-1111-1111-111111111111', active: false }) as never
    )) as unknown
    expect(res).toBe(errResponse)
  })
})

describe('POST /api/admin/webhooks/toggle — validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await POST(buildPost('__INVALID__') as never)
    expect(res.status).toBe(400)
    expect(mocks.hookUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 when id is missing', async () => {
    const res = await POST(buildPost({ active: true }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id is not a uuid', async () => {
    const res = await POST(buildPost({ id: 'not-a-uuid', active: true }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when body is not an object', async () => {
    const res = await POST(buildPost(null) as never)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/admin/webhooks/toggle — happy path', () => {
  it('returns 200 + calls supabase.update with active flag', async () => {
    const res = await POST(
      buildPost({ id: '11111111-1111-1111-1111-111111111111', active: false }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; active: boolean }
    expect(body).toEqual({ ok: true, active: false })
    expect(mocks.hookUpdate).toHaveBeenCalledTimes(1)
    const [patch, col, val] = mocks.hookUpdate.mock.calls[0]
    expect(patch).toEqual({ active: false })
    expect(col).toBe('id')
    expect(val).toBe('11111111-1111-1111-1111-111111111111')
  })

  it('coerces active=truthy to boolean true only when strictly === true', async () => {
    const res = await POST(
      buildPost({ id: '11111111-1111-1111-1111-111111111111', active: 'yes' }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { active: boolean }
    expect(body.active).toBe(false)
  })

  it('writes an audit log via logAdminAction', async () => {
    await POST(buildPost({ id: '22222222-2222-2222-2222-222222222222', active: true }) as never)
    expect(mocks.logAdminAction).toHaveBeenCalledTimes(1)
    const [adminId, action, resource, resourceId, meta] = mocks.logAdminAction.mock.calls[0]
    expect(adminId).toBe(ADMIN_ID)
    expect(action).toBe('webhook_enabled')
    expect(resource).toBe('settings')
    expect(resourceId).toBe('22222222-2222-2222-2222-222222222222')
    expect(meta).toMatchObject({ webhook_id: '22222222-2222-2222-2222-222222222222', active: true })
  })
})

describe('POST /api/admin/webhooks/toggle — error path', () => {
  it('returns 500 when supabase returns error', async () => {
    mocks.hookUpdate.mockResolvedValueOnce({ error: { message: 'boom' } })
    const res = await POST(
      buildPost({ id: '11111111-1111-1111-1111-111111111111', active: false }) as never
    )
    expect(res.status).toBe(500)
    expect(mocks.loggerError).toHaveBeenCalled()
  })
})
