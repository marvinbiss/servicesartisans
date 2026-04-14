import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockSupabaseFrom = vi.fn()
const mockSupabaseClient = { from: mockSupabaseFrom } as never

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a chainable mock query builder for Supabase */
function createMockQueryBuilder(finalResult: Record<string, unknown> = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainable = (name: string) => {
    builder[name] = vi.fn().mockReturnValue(builder)
  }
  ;[
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'in',
    'gte',
    'lte',
    'limit',
    'single',
    'order',
    'range',
  ].forEach(chainable)

  // Terminal methods resolve with the final result
  builder.single = vi.fn().mockResolvedValue(finalResult)
  builder.limit = vi.fn().mockResolvedValue(finalResult)

  // For non-terminal select (after insert/update) keep chaining
  builder.select = vi.fn().mockImplementation((...args: unknown[]) => {
    // If called with count option, use original chain
    if (args.length > 1) return builder
    return builder
  })

  return builder
}

function makeSlotRow(
  overrides: Partial<import('@/lib/services/bookings-service').SlotRow> = {}
): import('@/lib/services/bookings-service').SlotRow {
  return {
    id: 'slot-1',
    artisan_id: 'artisan-1',
    date: '2026-04-15',
    start_time: '09:00',
    end_time: '10:00',
    is_available: true,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Imports (after mock declarations)
// ---------------------------------------------------------------------------

import {
  getBookingsByProviderId,
  getBookingByIdWithSlot,
  getBookingForAuthCheck,
  getBookingForCancel,
  getBookingForReschedule,
  cancelBooking,
  updateBooking,
  rescheduleBooking,
  getArtisanBookingsForMonth,
  hasActiveBookingOnSlot,
  hasActiveBookingsOnSlots,
  adminListBookings,
  adminGetBookingById,
  adminUpdateBooking,
  adminCancelBooking,
  getAvailableSlotsForMonth,
  getSlotsWithBookingsForDate,
  getAllSlotsForArtisan,
  getAvailableSlotsForArtisanMonth,
  getSlotsForDateByArtisan,
  createSlot,
  getSlotById,
  getSlotWithBookings,
  getAvailableSlotById,
  deleteSlot,
  updateSlotAvailability,
  getSlotIdsForDate,
  deleteSlotsForDate,
  bulkInsertSlots,
  getProfileById,
  getProviderUserId,
  groupSlotsByDate,
  hasTimeOverlap,
  formatDateFr,
  extractSlotFromJoin,
} from '@/lib/services/bookings-service'

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// getBookingsByProviderId
// ===========================================================================

describe('getBookingsByProviderId', () => {
  it('returns bookings for a provider', async () => {
    const bookings = [{ id: 'b-1', provider_id: 'p-1', status: 'confirmed' }]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: bookings, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingsByProviderId(mockSupabaseClient, 'p-1')

    expect(result.data).toEqual(bookings)
    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('bookings')
    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'p-1')
  })

  it('returns empty array when no bookings exist', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingsByProviderId(mockSupabaseClient, 'p-none')

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('returns error on DB failure', async () => {
    const dbError = { message: 'connection refused', code: '08001' }
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: dbError })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingsByProviderId(mockSupabaseClient, 'p-1')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })

  it('orders by created_at descending', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getBookingsByProviderId(mockSupabaseClient, 'p-1')

    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })
})

// ===========================================================================
// getBookingByIdWithSlot
// ===========================================================================

describe('getBookingByIdWithSlot', () => {
  it('returns booking with slot data', async () => {
    const booking = {
      id: 'b-1',
      client_name: 'Jean',
      status: 'confirmed',
      slot: [{ id: 's-1', date: '2026-04-15', start_time: '09:00', end_time: '10:00' }],
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: booking, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingByIdWithSlot(mockSupabaseClient, 'b-1')

    expect(result.data).toEqual(booking)
    expect(result.error).toBeNull()
    expect(builder.eq).toHaveBeenCalledWith('id', 'b-1')
  })

  it('returns null when booking not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingByIdWithSlot(mockSupabaseClient, 'nonexistent')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })

  it('includes slot join in select', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getBookingByIdWithSlot(mockSupabaseClient, 'b-1')

    const selectArg = builder.select.mock.calls[0][0] as string
    expect(selectArg).toContain('slot:availability_slots')
  })
})

// ===========================================================================
// getBookingForAuthCheck
// ===========================================================================

describe('getBookingForAuthCheck', () => {
  it('returns booking with client_id and slot artisan_id', async () => {
    const data = {
      id: 'b-1',
      client_id: 'c-1',
      client_email: 'a@b.com',
      slot: [{ artisan_id: 'art-1' }],
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingForAuthCheck(mockSupabaseClient, 'b-1')

    expect(result.data).toEqual(data)
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingForAuthCheck(mockSupabaseClient, 'nope')

    expect(result.data).toBeNull()
  })
})

// ===========================================================================
// getBookingForCancel
// ===========================================================================

describe('getBookingForCancel', () => {
  it('returns booking for cancel with correct fields', async () => {
    const data = { id: 'b-1', client_id: 'c-1', provider_id: 'p-1', status: 'confirmed' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingForCancel(mockSupabaseClient, 'b-1')

    expect(result.data).toEqual(data)
    expect(builder.eq).toHaveBeenCalledWith('id', 'b-1')
  })
})

// ===========================================================================
// getBookingForReschedule
// ===========================================================================

describe('getBookingForReschedule', () => {
  it('returns booking with slot for rescheduling', async () => {
    const data = {
      id: 'b-1',
      status: 'confirmed',
      client_id: 'c-1',
      slot: [
        {
          id: 's-1',
          date: '2026-04-15',
          start_time: '09:00',
          end_time: '10:00',
          artisan_id: 'art-1',
        },
      ],
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getBookingForReschedule(mockSupabaseClient, 'b-1')

    expect(result.data?.slot).toHaveLength(1)
    expect(result.data?.status).toBe('confirmed')
  })
})

// ===========================================================================
// cancelBooking
// ===========================================================================

describe('cancelBooking', () => {
  it('cancels a booking successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await cancelBooking(mockSupabaseClient, 'b-1', 'user-1', 'client request')

    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('bookings')
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'cancelled',
        cancelled_by: 'user-1',
        cancellation_reason: 'client request',
      })
    )
  })

  it('sets cancelled_at to current ISO timestamp', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const before = new Date().toISOString()
    await cancelBooking(mockSupabaseClient, 'b-1', 'user-1')
    const after = new Date().toISOString()

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.cancelled_at >= before).toBe(true)
    expect(updateArg.cancelled_at <= after).toBe(true)
  })

  it('handles undefined reason', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await cancelBooking(mockSupabaseClient, 'b-1', 'user-1')

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.cancellation_reason).toBeUndefined()
  })

  it('returns error on DB failure', async () => {
    const dbError = { message: 'RLS violation' }
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: dbError })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await cancelBooking(mockSupabaseClient, 'b-1', 'user-1')

    expect(result.error).toEqual(dbError)
  })
})

// ===========================================================================
// updateBooking
// ===========================================================================

describe('updateBooking', () => {
  it('updates booking with given fields', async () => {
    const updated = { id: 'b-1', status: 'completed' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: updated, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await updateBooking(mockSupabaseClient, 'b-1', { status: 'completed' })

    expect(result.data).toEqual(updated)
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }))
  })

  it('sets updated_at timestamp', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await updateBooking(mockSupabaseClient, 'b-1', { status: 'done' })

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.updated_at).toBeDefined()
    expect(() => new Date(updateArg.updated_at)).not.toThrow()
  })
})

// ===========================================================================
// rescheduleBooking
// ===========================================================================

describe('rescheduleBooking', () => {
  it('reschedules with date and time', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await rescheduleBooking(
      mockSupabaseClient,
      'b-1',
      { date: '2026-04-20', start_time: '14:00' },
      'old-slot-1'
    )

    expect(result.error).toBeNull()
    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.scheduled_date).toBe('2026-04-20T14:00')
    expect(updateArg.rescheduled_from_slot_id).toBe('old-slot-1')
  })

  it('reschedules with date only when start_time is empty', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await rescheduleBooking(
      mockSupabaseClient,
      'b-1',
      { date: '2026-04-20', start_time: '' },
      'old-slot-1'
    )

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.scheduled_date).toBe('2026-04-20')
  })

  it('sets rescheduled_at timestamp', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await rescheduleBooking(
      mockSupabaseClient,
      'b-1',
      { date: '2026-04-20', start_time: '10:00' },
      's-1'
    )

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.rescheduled_at).toBeDefined()
  })

  it('returns error on DB failure', async () => {
    const dbError = { message: 'slot not found' }
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: dbError })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await rescheduleBooking(
      mockSupabaseClient,
      'b-1',
      { date: '2026-04-20', start_time: '10:00' },
      's-1'
    )

    expect(result.error).toEqual(dbError)
  })
})

// ===========================================================================
// getArtisanBookingsForMonth
// ===========================================================================

describe('getArtisanBookingsForMonth', () => {
  it('returns bookings for the artisan', async () => {
    const bookings = [{ id: 'b-1', status: 'confirmed' }]
    const builder = createMockQueryBuilder()
    builder.in = vi.fn().mockResolvedValue({ data: bookings, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getArtisanBookingsForMonth(
      mockSupabaseClient,
      'art-1',
      '2026-04-01',
      '2026-04-30'
    )

    expect(result.data).toEqual(bookings)
    expect(builder.eq).toHaveBeenCalledWith('artisan_id', 'art-1')
    expect(builder.in).toHaveBeenCalledWith('status', ['confirmed', 'pending', 'completed'])
  })
})

// ===========================================================================
// hasActiveBookingOnSlot
// ===========================================================================

describe('hasActiveBookingOnSlot', () => {
  it('returns true when active booking exists', async () => {
    const builder = createMockQueryBuilder()
    // Chain: .select().eq().in().limit(1).single()
    builder.limit = vi.fn().mockReturnValue(builder)
    builder.single = vi.fn().mockResolvedValue({ data: { id: 'b-1' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await hasActiveBookingOnSlot(mockSupabaseClient, 's-1')

    expect(result).toBe(true)
    expect(builder.eq).toHaveBeenCalledWith('slot_id', 's-1')
    expect(builder.in).toHaveBeenCalledWith('status', ['pending', 'confirmed'])
  })

  it('returns false when no active booking', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockReturnValue(builder)
    builder.single = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await hasActiveBookingOnSlot(mockSupabaseClient, 's-1')

    expect(result).toBe(false)
  })
})

// ===========================================================================
// hasActiveBookingsOnSlots
// ===========================================================================

describe('hasActiveBookingsOnSlots', () => {
  it('returns true when active bookings exist on any slot', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [{ id: 'b-1' }] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await hasActiveBookingsOnSlots(mockSupabaseClient, ['s-1', 's-2'])

    expect(result).toBe(true)
  })

  it('returns false when no active bookings', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await hasActiveBookingsOnSlots(mockSupabaseClient, ['s-1', 's-2'])

    expect(result).toBe(false)
  })

  it('returns false when data is null', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await hasActiveBookingsOnSlots(mockSupabaseClient, ['s-1'])

    expect(result).toBe(false)
  })
})

// ===========================================================================
// adminListBookings
// ===========================================================================

describe('adminListBookings', () => {
  it('returns paginated bookings with count', async () => {
    const bookings = [{ id: 'b-1', status: 'confirmed' }]
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: bookings, count: 42, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminListBookings(mockSupabaseClient, {
      status: 'all',
      page: 1,
      limit: 10,
    })

    expect(result.data).toEqual(bookings)
    expect(result.count).toBe(42)
    expect(result.error).toBeNull()
  })

  it('applies status filter when not "all"', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await adminListBookings(mockSupabaseClient, { status: 'confirmed', page: 1, limit: 10 })

    expect(builder.eq).toHaveBeenCalledWith('status', 'confirmed')
  })

  it('does not filter status when "all"', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await adminListBookings(mockSupabaseClient, { status: 'all', page: 1, limit: 10 })

    // eq should not be called with 'status' — but it may not be called at all
    // since the only eq calls should be none for 'all'
    const statusCalls = builder.eq.mock.calls.filter((call: unknown[]) => call[0] === 'status')
    expect(statusCalls).toHaveLength(0)
  })

  it('calculates correct offset for page 3', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await adminListBookings(mockSupabaseClient, { status: 'all', page: 3, limit: 10 })

    // offset = (3-1)*10 = 20, range = (20, 29)
    expect(builder.range).toHaveBeenCalledWith(20, 29)
  })

  it('returns error on DB failure', async () => {
    const dbError = { message: 'timeout' }
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: null, count: null, error: dbError })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminListBookings(mockSupabaseClient, {
      status: 'all',
      page: 1,
      limit: 10,
    })

    expect(result.error).toEqual(dbError)
  })
})

// ===========================================================================
// adminGetBookingById
// ===========================================================================

describe('adminGetBookingById', () => {
  it('returns booking with provider details', async () => {
    const booking = {
      id: 'b-1',
      status: 'confirmed',
      provider: { id: 'p-1', name: 'Plombier Pro', email: 'p@test.fr', phone: '0600000000' },
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: booking, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminGetBookingById(mockSupabaseClient, 'b-1')

    expect(result.data).toEqual(booking)
    expect(result.data?.provider?.name).toBe('Plombier Pro')
  })

  it('returns null when booking not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminGetBookingById(mockSupabaseClient, 'nope')

    expect(result.data).toBeNull()
  })
})

// ===========================================================================
// adminUpdateBooking
// ===========================================================================

describe('adminUpdateBooking', () => {
  it('updates booking status', async () => {
    const updated = { id: 'b-1', status: 'completed' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: updated, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminUpdateBooking(mockSupabaseClient, 'b-1', { status: 'completed' })

    expect(result.data).toEqual(updated)
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }))
  })

  it('updates booking notes', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: { id: 'b-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await adminUpdateBooking(mockSupabaseClient, 'b-1', { notes: 'VIP client' })

    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ notes: 'VIP client' }))
  })

  it('sets updated_at timestamp', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await adminUpdateBooking(mockSupabaseClient, 'b-1', { status: 'cancelled' })

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.updated_at).toBeDefined()
  })
})

// ===========================================================================
// adminCancelBooking
// ===========================================================================

describe('adminCancelBooking', () => {
  it('sets status to cancelled', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminCancelBooking(mockSupabaseClient, 'b-1')

    expect(result.error).toBeNull()
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }))
  })

  it('sets updated_at timestamp', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await adminCancelBooking(mockSupabaseClient, 'b-1')

    const updateArg = builder.update.mock.calls[0][0]
    expect(updateArg.updated_at).toBeDefined()
  })

  it('returns error on DB failure', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'forbidden' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminCancelBooking(mockSupabaseClient, 'b-1')

    expect(result.error).toEqual({ message: 'forbidden' })
  })
})

// ===========================================================================
// getAvailableSlotsForMonth
// ===========================================================================

describe('getAvailableSlotsForMonth', () => {
  it('returns available slots within date range', async () => {
    const slots = [
      makeSlotRow(),
      makeSlotRow({ id: 'slot-2', start_time: '10:00', end_time: '11:00' }),
    ]
    const builder = createMockQueryBuilder()
    // The last chained call is .order('start_time')
    builder.order = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: slots, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAvailableSlotsForMonth(
      mockSupabaseClient,
      'art-1',
      '2026-04-01',
      '2026-04-30'
    )

    expect(result.data).toEqual(slots)
    expect(builder.eq).toHaveBeenCalledWith('artisan_id', 'art-1')
    expect(builder.eq).toHaveBeenCalledWith('is_available', true)
    expect(builder.gte).toHaveBeenCalledWith('date', '2026-04-01')
    expect(builder.lte).toHaveBeenCalledWith('date', '2026-04-30')
  })

  it('returns empty array when no slots available', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAvailableSlotsForMonth(
      mockSupabaseClient,
      'art-1',
      '2026-05-01',
      '2026-05-31'
    )

    expect(result.data).toEqual([])
  })

  it('returns error on DB failure', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: null, error: { message: 'timeout' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAvailableSlotsForMonth(
      mockSupabaseClient,
      'art-1',
      '2026-04-01',
      '2026-04-30'
    )

    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// createSlot
// ===========================================================================

describe('createSlot', () => {
  it('creates a slot successfully', async () => {
    const slot = makeSlotRow()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: slot, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await createSlot(mockSupabaseClient, {
      artisan_id: 'art-1',
      date: '2026-04-15',
      start_time: '09:00',
      end_time: '10:00',
      is_available: true,
    })

    expect(result.data).toEqual(slot)
    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('availability_slots')
    expect(builder.insert).toHaveBeenCalled()
  })

  it('returns error on insert failure (e.g. overlap constraint)', async () => {
    const dbError = { message: 'unique_violation', code: '23505' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: dbError })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await createSlot(mockSupabaseClient, {
      artisan_id: 'art-1',
      date: '2026-04-15',
      start_time: '09:00',
      end_time: '10:00',
      is_available: true,
    })

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })
})

// ===========================================================================
// deleteSlot
// ===========================================================================

describe('deleteSlot', () => {
  it('deletes a slot successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await deleteSlot(mockSupabaseClient, 's-1')

    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('availability_slots')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', 's-1')
  })

  it('returns error on DB failure', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'FK constraint' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await deleteSlot(mockSupabaseClient, 's-1')

    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// bulkInsertSlots
// ===========================================================================

describe('bulkInsertSlots', () => {
  it('inserts multiple slots successfully', async () => {
    const inserted = [makeSlotRow({ id: 'slot-1' }), makeSlotRow({ id: 'slot-2' })]
    const builder = createMockQueryBuilder()
    // After insert().select(), the result resolves
    builder.select = vi.fn().mockResolvedValue({ data: inserted, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const slots = [
      {
        artisan_id: 'art-1',
        date: '2026-04-15',
        start_time: '09:00',
        end_time: '10:00',
        is_available: true,
      },
      {
        artisan_id: 'art-1',
        date: '2026-04-15',
        start_time: '10:00',
        end_time: '11:00',
        is_available: true,
      },
    ]
    const result = await bulkInsertSlots(mockSupabaseClient, slots)

    expect(result.data).toEqual(inserted)
    expect(builder.insert).toHaveBeenCalledWith(slots)
  })

  it('returns error on bulk insert failure', async () => {
    const builder = createMockQueryBuilder()
    builder.select = vi.fn().mockResolvedValue({ data: null, error: { message: 'bulk error' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await bulkInsertSlots(mockSupabaseClient, [])

    expect(result.error).toEqual({ message: 'bulk error' })
  })
})

// ===========================================================================
// getSlotById, getSlotWithBookings, getAvailableSlotById
// ===========================================================================

describe('getSlotById', () => {
  it('returns slot by id', async () => {
    const slot = makeSlotRow()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: slot, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getSlotById(mockSupabaseClient, 'slot-1')

    expect(result.data).toEqual(slot)
    expect(builder.eq).toHaveBeenCalledWith('id', 'slot-1')
  })
})

describe('getSlotWithBookings', () => {
  it('returns slot with bookings join', async () => {
    const data = { id: 's-1', artisan_id: 'art-1', booking: [{ id: 'b-1' }] }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getSlotWithBookings(mockSupabaseClient, 's-1')

    expect(result.data?.booking).toHaveLength(1)
  })
})

describe('getAvailableSlotById', () => {
  it('returns available slot', async () => {
    const slot = makeSlotRow({ is_available: true })
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: slot, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAvailableSlotById(mockSupabaseClient, 'slot-1')

    expect(result.data).toEqual(slot)
    expect(builder.eq).toHaveBeenCalledWith('is_available', true)
  })

  it('returns null when slot is not available', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAvailableSlotById(mockSupabaseClient, 'slot-1')

    expect(result.data).toBeNull()
  })
})

// ===========================================================================
// updateSlotAvailability
// ===========================================================================

describe('updateSlotAvailability', () => {
  it('updates slot availability', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await updateSlotAvailability(mockSupabaseClient, 's-1', false)

    expect(result.error).toBeNull()
    expect(builder.update).toHaveBeenCalledWith({ is_available: false })
  })
})

// ===========================================================================
// getSlotsForDateByArtisan, getSlotIdsForDate, deleteSlotsForDate
// ===========================================================================

describe('getSlotsForDateByArtisan', () => {
  it('returns slots for a date', async () => {
    const slots = [{ id: 's-1', start_time: '09:00', end_time: '10:00' }]
    const builder = createMockQueryBuilder()
    builder.eq = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: slots, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getSlotsForDateByArtisan(mockSupabaseClient, 'art-1', '2026-04-15')

    expect(result.data).toEqual(slots)
  })
})

describe('getSlotIdsForDate', () => {
  it('returns slot IDs for a date', async () => {
    const ids = [{ id: 's-1' }, { id: 's-2' }]
    const builder = createMockQueryBuilder()
    builder.eq = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: ids, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getSlotIdsForDate(mockSupabaseClient, 'art-1', '2026-04-15')

    expect(result.data).toEqual(ids)
  })
})

describe('deleteSlotsForDate', () => {
  it('deletes all slots for a date', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockReturnValueOnce(builder).mockResolvedValueOnce({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await deleteSlotsForDate(mockSupabaseClient, 'art-1', '2026-04-15')

    expect(result.error).toBeNull()
    expect(builder.delete).toHaveBeenCalled()
  })
})

// ===========================================================================
// getSlotsWithBookingsForDate, getAllSlotsForArtisan, getAvailableSlotsForArtisanMonth
// ===========================================================================

describe('getSlotsWithBookingsForDate', () => {
  it('returns slots with booking joins for a date', async () => {
    const data = [{ id: 's-1', booking: [{ id: 'b-1', client_name: 'Jean' }] }]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getSlotsWithBookingsForDate(mockSupabaseClient, 'art-1', '2026-04-15')

    expect(result.data).toEqual(data)
    expect(builder.eq).toHaveBeenCalledWith('date', '2026-04-15')
  })
})

describe('getAllSlotsForArtisan', () => {
  it('returns all slots ordered by date and time', async () => {
    const slots = [makeSlotRow()]
    const builder = createMockQueryBuilder()
    builder.order = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: slots, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAllSlotsForArtisan(mockSupabaseClient, 'art-1')

    expect(result.data).toEqual(slots)
    expect(builder.order).toHaveBeenCalledWith('date', { ascending: true })
  })
})

describe('getAvailableSlotsForArtisanMonth', () => {
  it('returns available slots for artisan month view', async () => {
    const slots = [makeSlotRow()]
    const builder = createMockQueryBuilder()
    builder.order = vi
      .fn()
      .mockReturnValueOnce(builder)
      .mockResolvedValueOnce({ data: slots, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAvailableSlotsForArtisanMonth(
      mockSupabaseClient,
      'art-1',
      '2026-04-01',
      '2026-04-30'
    )

    expect(result.data).toEqual(slots)
    expect(builder.eq).toHaveBeenCalledWith('is_available', true)
  })
})

// ===========================================================================
// getProfileById
// ===========================================================================

describe('getProfileById', () => {
  it('returns profile data', async () => {
    const profile = {
      id: 'u-1',
      full_name: 'Jean Dupont',
      email: 'j@test.fr',
      phone_e164: '+33600000000',
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: profile, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProfileById(mockSupabaseClient, 'u-1')

    expect(result.data).toEqual(profile)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
  })
})

// ===========================================================================
// getProviderUserId
// ===========================================================================

describe('getProviderUserId', () => {
  it('returns provider user_id', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: { user_id: 'u-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderUserId(mockSupabaseClient, 'p-1')

    expect(result.data?.user_id).toBe('u-1')
    expect(mockSupabaseFrom).toHaveBeenCalledWith('providers')
  })

  it('returns null user_id when provider not claimed', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: { user_id: null }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderUserId(mockSupabaseClient, 'p-unclaimed')

    expect(result.data?.user_id).toBeNull()
  })
})

// ===========================================================================
// hasTimeOverlap (pure function)
// ===========================================================================

describe('hasTimeOverlap', () => {
  it('detects overlapping intervals', () => {
    const existing = [{ start_time: '09:00', end_time: '10:00' }]
    expect(hasTimeOverlap(existing, '09:30', '10:30')).toBe(true)
  })

  it('detects fully contained interval', () => {
    const existing = [{ start_time: '09:00', end_time: '12:00' }]
    expect(hasTimeOverlap(existing, '10:00', '11:00')).toBe(true)
  })

  it('detects containing interval', () => {
    const existing = [{ start_time: '10:00', end_time: '11:00' }]
    expect(hasTimeOverlap(existing, '09:00', '12:00')).toBe(true)
  })

  it('returns false for non-overlapping intervals', () => {
    const existing = [{ start_time: '09:00', end_time: '10:00' }]
    expect(hasTimeOverlap(existing, '10:30', '11:30')).toBe(false)
  })

  it('returns false for touching boundaries (end == start)', () => {
    const existing = [{ start_time: '09:00', end_time: '10:00' }]
    // [09:00, 10:00) and [10:00, 11:00) — no overlap (half-open)
    expect(hasTimeOverlap(existing, '10:00', '11:00')).toBe(false)
  })

  it('returns false for touching boundaries (start == end)', () => {
    const existing = [{ start_time: '10:00', end_time: '11:00' }]
    expect(hasTimeOverlap(existing, '09:00', '10:00')).toBe(false)
  })

  it('returns false for empty existing slots', () => {
    expect(hasTimeOverlap([], '09:00', '10:00')).toBe(false)
  })

  it('detects overlap with any of multiple existing slots', () => {
    const existing = [
      { start_time: '09:00', end_time: '10:00' },
      { start_time: '14:00', end_time: '15:00' },
    ]
    expect(hasTimeOverlap(existing, '14:30', '15:30')).toBe(true)
  })

  it('returns false when new slot is between existing slots', () => {
    const existing = [
      { start_time: '09:00', end_time: '10:00' },
      { start_time: '14:00', end_time: '15:00' },
    ]
    expect(hasTimeOverlap(existing, '11:00', '13:00')).toBe(false)
  })

  it('handles exact same interval', () => {
    const existing = [{ start_time: '09:00', end_time: '10:00' }]
    expect(hasTimeOverlap(existing, '09:00', '10:00')).toBe(true)
  })
})

// ===========================================================================
// groupSlotsByDate (pure function)
// ===========================================================================

describe('groupSlotsByDate', () => {
  it('groups slots by date', () => {
    const slots = [
      makeSlotRow({ id: 's-1', date: '2026-04-15', start_time: '09:00', end_time: '10:00' }),
      makeSlotRow({ id: 's-2', date: '2026-04-15', start_time: '10:00', end_time: '11:00' }),
      makeSlotRow({ id: 's-3', date: '2026-04-16', start_time: '09:00', end_time: '10:00' }),
    ]

    const result = groupSlotsByDate(slots)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result['2026-04-15']).toHaveLength(2)
    expect(result['2026-04-16']).toHaveLength(1)
  })

  it('returns correct shape for each slot', () => {
    const slots = [
      makeSlotRow({ id: 's-1', start_time: '09:00', end_time: '10:00', is_available: true }),
    ]

    const result = groupSlotsByDate(slots)

    expect(result['2026-04-15'][0]).toEqual({
      id: 's-1',
      start: '09:00',
      end: '10:00',
      available: true,
    })
  })

  it('returns empty object for empty input', () => {
    expect(groupSlotsByDate([])).toEqual({})
  })

  it('preserves is_available flag correctly', () => {
    const slots = [
      makeSlotRow({ id: 's-1', is_available: true }),
      makeSlotRow({ id: 's-2', is_available: false }),
    ]

    const result = groupSlotsByDate(slots)

    expect(result['2026-04-15'][0].available).toBe(true)
    expect(result['2026-04-15'][1].available).toBe(false)
  })
})

// ===========================================================================
// formatDateFr (pure function)
// ===========================================================================

describe('formatDateFr', () => {
  it('formats date in French locale', () => {
    const result = formatDateFr('2026-04-15')

    // Should contain French day/month names
    expect(result).toContain('2026')
    expect(result).toContain('15')
    // "avril" in French
    expect(result.toLowerCase()).toContain('avril')
  })

  it('includes weekday in French', () => {
    // 2026-04-15 is a Wednesday (mercredi)
    const result = formatDateFr('2026-04-15')
    expect(result.toLowerCase()).toContain('mercredi')
  })

  it('formats another date correctly', () => {
    const result = formatDateFr('2026-01-01')
    expect(result.toLowerCase()).toContain('janvier')
    expect(result).toContain('2026')
  })
})

// ===========================================================================
// extractSlotFromJoin (pure function)
// ===========================================================================

describe('extractSlotFromJoin', () => {
  it('extracts first element from array', () => {
    const slots = [{ id: 's-1' }, { id: 's-2' }]
    expect(extractSlotFromJoin(slots)).toEqual({ id: 's-1' })
  })

  it('returns single object as-is', () => {
    const slot = { id: 's-1' }
    expect(extractSlotFromJoin(slot)).toEqual({ id: 's-1' })
  })

  it('returns null for null input', () => {
    expect(extractSlotFromJoin(null)).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(extractSlotFromJoin([])).toBeNull()
  })

  it('handles array with single element', () => {
    expect(extractSlotFromJoin([{ id: 's-1' }])).toEqual({ id: 's-1' })
  })

  it('returns null for undefined (cast as null)', () => {
    // undefined is falsy, same branch as null
    expect(extractSlotFromJoin(undefined as unknown as null)).toBeNull()
  })
})
