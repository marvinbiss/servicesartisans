import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before imports so hoisting works
// ---------------------------------------------------------------------------

const mockAdminFrom = vi.fn()
const mockAdminClient = { from: mockAdminFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('@/lib/email/resend', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: 'email-id' }),
}))

vi.mock('@/lib/email/templates/new-lead-alert', () => ({
  getNewLeadAlertEmail: vi.fn().mockReturnValue({
    subject: 'Nouvelle demande',
    html: '<p>Alerte</p>',
  }),
}))

vi.mock('@/lib/sms/twilio', () => ({
  sendSMS: vi.fn().mockResolvedValue({ success: true, sid: 'sms-id' }),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  sendLeadAlert,
} from '@/lib/services/notifications-service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockQueryBuilder(finalResult: Record<string, unknown> = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainable = (name: string) => {
    builder[name] = vi.fn().mockReturnValue(builder)
  }
  ;['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'limit', 'single', 'head'].forEach(
    chainable
  )

  builder.single = vi.fn().mockResolvedValue(finalResult)

  // Make builder thenable so await resolves to finalResult
  // This allows chaining like .limit(n).eq('read', false) then await
  builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
    resolve(finalResult)
    return Promise.resolve(finalResult)
  })

  return builder
}

function createMockSupabase() {
  const fromMock = vi.fn()
  return { from: fromMock }
}

const USER_ID = 'user-uuid-001'

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// listNotifications
// ===========================================================================

describe('listNotifications', () => {
  it('returns all notifications with unread count', async () => {
    const notifications = [
      { id: '1', type: 'new_lead', title: 'Lead', read: false },
      { id: '2', type: 'info', title: 'Info', read: true },
    ]
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        // Fetch notifications — thenable resolves to data
        const b = createMockQueryBuilder({ data: notifications, error: null })
        return b
      }
      // Count unread — .select().eq().eq() with thenable
      const b = createMockQueryBuilder({ count: 1 })
      return b
    })

    const result = await listNotifications(supabase as never, {
      userId: USER_ID,
      limit: 20,
      unreadOnly: false,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.notifications).toEqual(notifications)
      expect(result.data.unreadCount).toBe(1)
    }
  })

  it('filters unread only when requested', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        // thenable resolves to data, .eq('read', false) chains before await
        const b = createMockQueryBuilder({ data: [{ id: '1', read: false }], error: null })
        return b
      }
      const b = createMockQueryBuilder({ count: 1 })
      return b
    })

    const result = await listNotifications(supabase as never, {
      userId: USER_ID,
      limit: 20,
      unreadOnly: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.notifications).toHaveLength(1)
    }
  })

  it('returns empty notifications', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        const b = createMockQueryBuilder({ data: [], error: null })
        return b
      }
      const b = createMockQueryBuilder({ count: 0 })
      return b
    })

    const result = await listNotifications(supabase as never, {
      userId: USER_ID,
      limit: 20,
      unreadOnly: false,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.notifications).toEqual([])
      expect(result.data.unreadCount).toBe(0)
    }
  })

  it('respects limit parameter', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        const b = createMockQueryBuilder({ data: [], error: null })
        return b
      }
      const b = createMockQueryBuilder({ count: 0 })
      return b
    })

    await listNotifications(supabase as never, {
      userId: USER_ID,
      limit: 5,
      unreadOnly: false,
    })
  })

  it('returns error on DB failure', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ data: null, error: { message: 'fail' } })
    supabase.from.mockReturnValue(builder)

    const result = await listNotifications(supabase as never, {
      userId: USER_ID,
      limit: 20,
      unreadOnly: false,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// markAsRead
// ===========================================================================

describe('markAsRead', () => {
  it('marks a notification as read successfully', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ error: null })
    supabase.from.mockReturnValue(builder)

    const result = await markAsRead(supabase as never, 'notif-1', USER_ID)

    expect(result.success).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('notifications')
  })

  it('handles already-read notification (no-op, still succeeds)', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ error: null })
    supabase.from.mockReturnValue(builder)

    const result = await markAsRead(supabase as never, 'notif-already-read', USER_ID)

    expect(result.success).toBe(true)
  })

  it('returns error on DB failure', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ error: { message: 'RLS denied' } })
    supabase.from.mockReturnValue(builder)

    const result = await markAsRead(supabase as never, 'notif-1', USER_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// markAllAsRead
// ===========================================================================

describe('markAllAsRead', () => {
  it('marks all notifications as read', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ error: null })
    supabase.from.mockReturnValue(builder)

    const result = await markAllAsRead(supabase as never, USER_ID)

    expect(result.success).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('notifications')
  })

  it('succeeds even when no unread notifications exist', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ error: null })
    supabase.from.mockReturnValue(builder)

    const result = await markAllAsRead(supabase as never, USER_ID)

    expect(result.success).toBe(true)
  })

  it('returns error on DB failure', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder({ error: { message: 'DB error' } })
    supabase.from.mockReturnValue(builder)

    const result = await markAllAsRead(supabase as never, USER_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// sendLeadAlert
// ===========================================================================

describe('sendLeadAlert', () => {
  it('sends alerts to providers with email and phone', async () => {
    const providers = [
      { id: 'p1', name: 'Plombier Pro', email: 'plombier@test.com', phone: '+33612345678' },
    ]

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.in = vi.fn().mockResolvedValue({ data: providers, error: null })
        return b
      }
      if (table === 'notifications') {
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await sendLeadAlert({
      provider_ids: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      service: 'plombier',
      city: 'Paris',
      description: 'Fuite',
      client_name: 'Jean',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.results.length).toBeGreaterThan(0)
    }
  })

  it('rejects empty provider_ids', async () => {
    const result = await sendLeadAlert({
      provider_ids: [],
      service: 'plombier',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('provider_ids required')
    }
  })

  it('rejects invalid UUID in provider_ids', async () => {
    const result = await sendLeadAlert({
      provider_ids: ['not-a-uuid'],
      service: 'plombier',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('valid UUIDs')
    }
  })

  it('rejects when provider_ids exceeds 50', async () => {
    const ids = Array.from(
      { length: 51 },
      (_, i) => `a1b2c3d4-e5f6-7890-abcd-${String(i).padStart(12, '0')}`
    )

    const result = await sendLeadAlert({
      provider_ids: ids,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('limit exceeded')
    }
  })

  it('handles provider fetch error', async () => {
    mockAdminFrom.mockImplementation(() => {
      const b = createMockQueryBuilder()
      b.in = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      return b
    })

    const result = await sendLeadAlert({
      provider_ids: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })

  it('sends only email when provider has no phone', async () => {
    const providers = [{ id: 'p1', name: 'Pro', email: 'pro@test.com', phone: null }]

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.in = vi.fn().mockResolvedValue({ data: providers, error: null })
        return b
      }
      if (table === 'notifications') {
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await sendLeadAlert({
      provider_ids: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      service: 'plombier',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      // Only email channel
      const emailResults = result.data.results.filter(
        (r: Record<string, unknown>) => r.channel === 'email'
      )
      const smsResults = result.data.results.filter(
        (r: Record<string, unknown>) => r.channel === 'sms'
      )
      expect(emailResults.length).toBe(1)
      expect(smsResults.length).toBe(0)
    }
  })

  it('returns empty results when no providers found', async () => {
    mockAdminFrom.mockImplementation(() => {
      const b = createMockQueryBuilder()
      b.in = vi.fn().mockResolvedValue({ data: [], error: null })
      return b
    })

    const result = await sendLeadAlert({
      provider_ids: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.results).toEqual([])
    }
  })
})
