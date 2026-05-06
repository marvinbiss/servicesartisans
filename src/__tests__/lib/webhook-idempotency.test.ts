import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

const mockFrom = vi.fn((_table: string) => ({
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import {
  checkWebhookIdempotency,
  markWebhookCompleted,
  markWebhookFailed,
} from '@/lib/webhook-idempotency'

beforeEach(() => {
  vi.clearAllMocks()

  // Default chain setup for insert
  mockInsert.mockResolvedValue({ error: null })

  // Default chain setup for update
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockEq.mockResolvedValue({ error: null })

  // Default chain setup for select
  mockSelect.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValue({ single: mockSingle })
  mockSingle.mockResolvedValue({ data: null, error: null })
})

describe('checkWebhookIdempotency', () => {
  it('returns false for a new event (insert succeeds)', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const result = await checkWebhookIdempotency('evt_123', 'stripe')
    expect(result).toBe(false)
    expect(mockFrom).toHaveBeenCalledWith('webhook_events')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_event_id: 'evt_123',
        type: 'stripe_webhook',
        status: 'processing',
      })
    )
  })

  it('returns true for an already completed event (duplicate insert + status completed)', async () => {
    // Insert fails with unique constraint violation
    mockInsert.mockResolvedValue({ error: { code: '23505' } })

    // Setup select chain for the duplicate check (maybeSingle now)
    const mockEqForSelect = vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: 'completed', created_at: new Date().toISOString() },
        error: null,
      }),
    })
    mockSelect.mockReturnValue({ eq: mockEqForSelect })

    const result = await checkWebhookIdempotency('evt_123', 'stripe')
    expect(result).toBe(true)
  })

  it('returns true for a duplicate event still processing within 30s window (anti double-traitement)', async () => {
    // 2026-05-05 fix audit V2 races P0 #3 : status=processing récent ⇒ skip
    // pour empêcher 2 workers de traiter simultanément le même webhook.
    mockInsert.mockResolvedValue({ error: { code: '23505' } })

    const mockEqForSelect = vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: 'processing', created_at: new Date().toISOString() },
        error: null,
      }),
    })
    mockSelect.mockReturnValue({ eq: mockEqForSelect })

    const result = await checkWebhookIdempotency('evt_123', 'stripe')
    expect(result).toBe(true)
  })

  it('returns false (claim) for a duplicate event stuck in processing >30s', async () => {
    // Worker précédent stuck/crashed → autoriser un retry après 30s.
    mockInsert.mockResolvedValue({ error: { code: '23505' } })

    const oldTimestamp = new Date(Date.now() - 60_000).toISOString()
    const mockEqForSelect = vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: 'processing', created_at: oldTimestamp },
        error: null,
      }),
    })
    mockSelect.mockReturnValue({ eq: mockEqForSelect })

    const result = await checkWebhookIdempotency('evt_123', 'stripe')
    expect(result).toBe(false)
  })

  it('returns false when insert fails with non-duplicate error', async () => {
    mockInsert.mockResolvedValue({ error: { code: '42P01' } })

    const result = await checkWebhookIdempotency('evt_123', 'stripe')
    expect(result).toBe(false)
  })

  it('returns false (fail-open) when DB throws an exception', async () => {
    mockInsert.mockRejectedValue(new Error('Connection refused'))

    const result = await checkWebhookIdempotency('evt_123', 'stripe')
    expect(result).toBe(false)
  })

  it('uses correct provider prefix for Stripe events', async () => {
    mockInsert.mockResolvedValue({ error: null })
    await checkWebhookIdempotency('evt_abc123', 'stripe')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_event_id: 'evt_abc123', type: 'stripe_webhook' })
    )
  })

  it('uses correct provider prefix for Resend events', async () => {
    mockInsert.mockResolvedValue({ error: null })
    await checkWebhookIdempotency('resend:svix-id-123', 'resend')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_event_id: 'resend:svix-id-123', type: 'resend_webhook' })
    )
  })

  it('uses correct provider prefix for Twilio events', async () => {
    mockInsert.mockResolvedValue({ error: null })
    await checkWebhookIdempotency('twilio:SM123abc', 'twilio')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_event_id: 'twilio:SM123abc', type: 'twilio_webhook' })
    )
  })

  it('uses correct provider prefix for Vapi events', async () => {
    mockInsert.mockResolvedValue({ error: null })
    await checkWebhookIdempotency('vapi:call_123', 'vapi')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_event_id: 'vapi:call_123', type: 'vapi_webhook' })
    )
  })

  it('handles empty event ID', async () => {
    mockInsert.mockResolvedValue({ error: null })
    const result = await checkWebhookIdempotency('', 'stripe')
    expect(result).toBe(false)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ stripe_event_id: '' }))
  })

  it('handles very long event ID', async () => {
    const longId = 'evt_' + 'a'.repeat(500)
    mockInsert.mockResolvedValue({ error: null })
    const result = await checkWebhookIdempotency(longId, 'stripe')
    expect(result).toBe(false)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ stripe_event_id: longId }))
  })

  it('handles special characters in event ID', async () => {
    const specialId = 'evt_test+foo/bar=baz'
    mockInsert.mockResolvedValue({ error: null })
    const result = await checkWebhookIdempotency(specialId, 'stripe')
    expect(result).toBe(false)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ stripe_event_id: specialId }))
  })
})

describe('markWebhookCompleted', () => {
  it('updates the event to completed status', async () => {
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })

    await markWebhookCompleted('evt_123', 'checkout.session.completed')

    expect(mockFrom).toHaveBeenCalledWith('webhook_events')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'checkout.session.completed',
        status: 'completed',
      })
    )
    expect(mockEq).toHaveBeenCalledWith('stripe_event_id', 'evt_123')
  })

  it('handles DB errors gracefully (does not throw)', async () => {
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockRejectedValue(new Error('DB timeout')),
    })

    // Should not throw
    await expect(markWebhookCompleted('evt_123', 'invoice.paid')).resolves.toBeUndefined()
  })
})

describe('markWebhookFailed', () => {
  it('updates the event to failed status with error message', async () => {
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })

    await markWebhookFailed('evt_123', 'Payment processing failed')

    expect(mockFrom).toHaveBeenCalledWith('webhook_events')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        error: 'Payment processing failed',
      })
    )
    expect(mockEq).toHaveBeenCalledWith('stripe_event_id', 'evt_123')
  })

  it('truncates error message to 1000 characters', async () => {
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })

    const longError = 'E'.repeat(2000)
    await markWebhookFailed('evt_123', longError)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'E'.repeat(1000),
      })
    )
  })

  it('handles DB errors gracefully (does not throw)', async () => {
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockRejectedValue(new Error('Connection lost')),
    })

    await expect(markWebhookFailed('evt_123', 'some error')).resolves.toBeUndefined()
  })
})
