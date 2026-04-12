/**
 * Bookings Service — Centralized Supabase queries for bookings & availability_slots
 * Framework-agnostic: no NextRequest/NextResponse
 */

import type { SupabaseClientType } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookingRow {
  id: string
  client_id: string | null
  provider_id: string
  service_name: string | null
  status: string
  scheduled_date: string | null
  payment_status: string | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  service_description: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  rescheduled_at: string | null
  deposit_amount: number | null
  created_at: string
  updated_at: string | null
}

export interface SlotRow {
  id: string
  artisan_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  created_at?: string
}

export interface BookingWithSlot {
  id: string
  client_id: string | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  service_description: string | null
  status: string
  created_at: string
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  rescheduled_at: string | null
  payment_status: string | null
  deposit_amount: number | null
  slot: SlotRow[] | null
}

export interface BookingForCancel {
  id: string
  client_id: string | null
  provider_id: string
  status: string
  scheduled_date: string | null
  client_name: string | null
  client_email: string | null
  service_description: string | null
}

export interface BookingForReschedule {
  id: string
  status: string
  client_id: string | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  service_description: string | null
  slot: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
    artisan_id: string
  }> | null
}

export interface BookingWithProvider {
  id: string
  status: string
  created_at: string
  provider: {
    id: string
    name: string | null
    email: string | null
    phone?: string | null
  } | null
  [key: string]: unknown
}

export interface ProfileInfo {
  id?: string
  full_name: string | null
  email: string | null
  phone_e164?: string | null
}

export interface AdminBookingListParams {
  status: string
  page: number
  limit: number
}

export interface AdminBookingListResult {
  bookings: BookingWithProvider[]
  total: number
  page: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Booking queries
// ---------------------------------------------------------------------------

/** Fetch all bookings for a provider (artisan view) */
export async function getBookingsByProviderId(
  supabase: SupabaseClientType,
  providerId: string
): Promise<{ data: BookingRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id, client_id, provider_id, service_name, status, scheduled_date, payment_status,
      client_name, client_email, client_phone, service_description,
      cancelled_at, cancelled_by, cancellation_reason,
      rescheduled_at, deposit_amount, created_at, updated_at
    `
    )
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/** Fetch a single booking by ID with slot join (for detail view) */
export async function getBookingByIdWithSlot(
  supabase: SupabaseClientType,
  bookingId: string
): Promise<{ data: BookingWithSlot | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      client_name,
      client_phone,
      client_email,
      service_description,
      status,
      created_at,
      cancelled_at,
      cancelled_by,
      cancellation_reason,
      rescheduled_at,
      payment_status,
      deposit_amount,
      client_id,
      slot:availability_slots(
        id,
        date,
        start_time,
        end_time,
        artisan_id
      )
    `
    )
    .eq('id', bookingId)
    .single()

  return { data: data as BookingWithSlot | null, error }
}

/** Fetch a booking with slot join for auth check (PATCH route) */
export async function getBookingForAuthCheck(
  supabase: SupabaseClientType,
  bookingId: string
): Promise<{
  data: {
    id: string
    client_id: string | null
    client_email: string | null
    slot: Array<{ artisan_id: string }> | null
  } | null
  error: unknown
}> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, client_id, client_email, slot:availability_slots(artisan_id)')
    .eq('id', bookingId)
    .single()

  return {
    data: data as {
      id: string
      client_id: string | null
      client_email: string | null
      slot: Array<{ artisan_id: string }> | null
    } | null,
    error,
  }
}

/** Fetch a booking for cancellation (cancel route) */
export async function getBookingForCancel(
  supabase: SupabaseClientType,
  bookingId: string
): Promise<{ data: BookingForCancel | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, client_id, provider_id, status, scheduled_date, client_name, client_email, service_description'
    )
    .eq('id', bookingId)
    .single()

  return { data: data as BookingForCancel | null, error }
}

/** Fetch a booking with slot for rescheduling */
export async function getBookingForReschedule(
  supabase: SupabaseClientType,
  bookingId: string
): Promise<{ data: BookingForReschedule | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id, status, client_id, client_name, client_email, client_phone, service_description,
      slot:availability_slots(
        id,
        date,
        start_time,
        end_time,
        artisan_id
      )
    `
    )
    .eq('id', bookingId)
    .single()

  return { data: data as BookingForReschedule | null, error }
}

/** Cancel a booking — update status to cancelled */
export async function cancelBooking(
  supabase: SupabaseClientType,
  bookingId: string,
  cancelledBy: string,
  reason?: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: cancelledBy,
      cancellation_reason: reason,
    })
    .eq('id', bookingId)

  return { error }
}

/** Update a booking (generic fields) */
export async function updateBooking(
  supabase: SupabaseClientType,
  bookingId: string,
  updates: Record<string, string | number | undefined>
): Promise<{ data: BookingRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single()

  return { data: data as BookingRow | null, error }
}

/** Reschedule a booking to a new slot */
export async function rescheduleBooking(
  supabase: SupabaseClientType,
  bookingId: string,
  newSlot: { date: string; start_time: string },
  oldSlotId: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bookings')
    .update({
      scheduled_date: newSlot.start_time ? `${newSlot.date}T${newSlot.start_time}` : newSlot.date,
      rescheduled_at: new Date().toISOString(),
      rescheduled_from_slot_id: oldSlotId,
    })
    .eq('id', bookingId)

  return { error }
}

/** Fetch artisan bookings for a given month (artisan dashboard) */
export async function getArtisanBookingsForMonth(
  supabase: SupabaseClientType,
  artisanId: string,
  _startDate: string,
  _endDate: string
): Promise<{
  data: Array<{
    id: string
    client_name: string | null
    client_email: string | null
    client_phone: string | null
    service_description: string | null
    status: string
    created_at: string
    slot: unknown
  }> | null
  error: unknown
}> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      client_name,
      client_email,
      client_phone,
      service_description,
      status,
      created_at,
      slot:availability_slots!slot_id (
        id,
        date,
        start_time,
        end_time
      )
    `
    )
    .eq('artisan_id', artisanId)
    .in('status', ['confirmed', 'pending', 'completed'])

  return { data, error }
}

/** Check for active bookings on a slot */
export async function hasActiveBookingOnSlot(
  supabase: SupabaseClientType,
  slotId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('bookings')
    .select('id')
    .eq('slot_id', slotId)
    .in('status', ['pending', 'confirmed'])
    .limit(1)
    .single()

  return !!data
}

/** Check for active bookings on multiple slot IDs */
export async function hasActiveBookingsOnSlots(
  supabase: SupabaseClientType,
  slotIds: string[]
): Promise<boolean> {
  const { data } = await supabase
    .from('bookings')
    .select('id')
    .in('slot_id', slotIds)
    .in('status', ['pending', 'confirmed'])
    .limit(1)

  return !!(data && data.length > 0)
}

// ---------------------------------------------------------------------------
// Admin booking queries
// ---------------------------------------------------------------------------

/** Admin: list bookings with pagination and optional status filter */
export async function adminListBookings(
  supabase: SupabaseClientType,
  params: AdminBookingListParams
): Promise<{ data: BookingWithProvider[] | null; count: number | null; error: unknown }> {
  const { status, page, limit } = params
  const offset = (page - 1) * limit

  let query = supabase.from('bookings').select(
    `
      *,
      provider:providers!provider_id (
        id,
        name,
        email
      )
    `,
    { count: 'exact' }
  )

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data as BookingWithProvider[] | null, count, error }
}

/** Admin: get a single booking with provider details */
export async function adminGetBookingById(
  supabase: SupabaseClientType,
  bookingId: string
): Promise<{ data: BookingWithProvider | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      provider:providers!provider_id (
        id,
        name,
        email,
        phone
      )
    `
    )
    .eq('id', bookingId)
    .single()

  return { data: data as BookingWithProvider | null, error }
}

/** Admin: update a booking */
export async function adminUpdateBooking(
  supabase: SupabaseClientType,
  bookingId: string,
  updates: { status?: string; notes?: string }
): Promise<{ data: BookingRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single()

  return { data: data as BookingRow | null, error }
}

/** Admin: cancel a booking (soft delete) */
export async function adminCancelBooking(
  supabase: SupabaseClientType,
  bookingId: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  return { error }
}

// ---------------------------------------------------------------------------
// Availability slot queries
// ---------------------------------------------------------------------------

/** Fetch available slots for a month (client booking view) */
export async function getAvailableSlotsForMonth(
  supabase: SupabaseClientType,
  artisanId: string,
  startDate: string,
  endDate: string
): Promise<{ data: SlotRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, artisan_id, date, start_time, end_time, is_available')
    .eq('artisan_id', artisanId)
    .eq('is_available', true)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('start_time')

  return { data: data as SlotRow[] | null, error }
}

/** Fetch all slots for a date with booking joins (artisan detail view) */
export async function getSlotsWithBookingsForDate(
  supabase: SupabaseClientType,
  artisanId: string,
  date: string
): Promise<{ data: unknown[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select(
      `
      *,
      booking:bookings(
        id,
        client_name,
        client_phone,
        client_email,
        service_description,
        status
      )
    `
    )
    .eq('artisan_id', artisanId)
    .eq('date', date)
    .order('start_time')

  return { data, error }
}

/** Fetch all slots for an artisan (artisan availability management) */
export async function getAllSlotsForArtisan(
  supabase: SupabaseClientType,
  artisanId: string
): Promise<{ data: SlotRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, artisan_id, date, start_time, end_time, is_available, created_at')
    .eq('artisan_id', artisanId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return { data: data as SlotRow[] | null, error }
}

/** Fetch available slots for a month for an artisan (artisan dashboard) */
export async function getAvailableSlotsForArtisanMonth(
  supabase: SupabaseClientType,
  artisanId: string,
  startDate: string,
  endDate: string
): Promise<{ data: SlotRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, date, start_time, end_time, is_available')
    .eq('artisan_id', artisanId)
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('is_available', true)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return { data: data as SlotRow[] | null, error }
}

/** Fetch slots for a specific date and artisan (overlap check) */
export async function getSlotsForDateByArtisan(
  supabase: SupabaseClientType,
  artisanId: string,
  date: string
): Promise<{
  data: Array<{ id: string; start_time: string; end_time: string }> | null
  error: unknown
}> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, start_time, end_time')
    .eq('artisan_id', artisanId)
    .eq('date', date)

  return { data, error }
}

/** Create a new availability slot */
export async function createSlot(
  supabase: SupabaseClientType,
  slot: {
    artisan_id: string
    date: string
    start_time: string
    end_time: string
    is_available: boolean
  }
): Promise<{ data: SlotRow | null; error: unknown }> {
  const { data, error } = await supabase.from('availability_slots').insert(slot).select().single()

  return { data: data as SlotRow | null, error }
}

/** Get a single slot by ID */
export async function getSlotById(
  supabase: SupabaseClientType,
  slotId: string
): Promise<{ data: SlotRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, artisan_id, date, start_time, end_time, is_available')
    .eq('id', slotId)
    .single()

  return { data: data as SlotRow | null, error }
}

/** Get a single slot with its bookings */
export async function getSlotWithBookings(
  supabase: SupabaseClientType,
  slotId: string
): Promise<{
  data: { id: string; artisan_id: string; booking: Array<{ id: string }> | null } | null
  error: unknown
}> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*, booking:bookings(*)')
    .eq('id', slotId)
    .single()

  return {
    data: data as { id: string; artisan_id: string; booking: Array<{ id: string }> | null } | null,
    error,
  }
}

/** Get an available slot by ID (for rescheduling) */
export async function getAvailableSlotById(
  supabase: SupabaseClientType,
  slotId: string
): Promise<{ data: SlotRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, artisan_id, date, start_time, end_time, is_available')
    .eq('id', slotId)
    .eq('is_available', true)
    .single()

  return { data: data as SlotRow | null, error }
}

/** Delete a slot by ID */
export async function deleteSlot(
  supabase: SupabaseClientType,
  slotId: string
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('availability_slots').delete().eq('id', slotId)

  return { error }
}

/** Update a slot's availability */
export async function updateSlotAvailability(
  supabase: SupabaseClientType,
  slotId: string,
  isAvailable: boolean
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('availability_slots')
    .update({ is_available: isAvailable })
    .eq('id', slotId)

  return { error }
}

/** Get all slot IDs for an artisan on a given date */
export async function getSlotIdsForDate(
  supabase: SupabaseClientType,
  artisanId: string,
  date: string
): Promise<{ data: Array<{ id: string }> | null; error: unknown }> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id')
    .eq('artisan_id', artisanId)
    .eq('date', date)

  return { data, error }
}

/** Delete all slots for an artisan on a given date */
export async function deleteSlotsForDate(
  supabase: SupabaseClientType,
  artisanId: string,
  date: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('artisan_id', artisanId)
    .eq('date', date)

  return { error }
}

/** Bulk insert slots */
export async function bulkInsertSlots(
  supabase: SupabaseClientType,
  slots: Array<{
    artisan_id: string
    date: string
    start_time: string
    end_time: string
    is_available: boolean
  }>
): Promise<{ data: SlotRow[] | null; error: unknown }> {
  const { data, error } = await supabase.from('availability_slots').insert(slots).select()

  return { data: data as SlotRow[] | null, error }
}

// ---------------------------------------------------------------------------
// Profile queries (used by booking routes for notifications)
// ---------------------------------------------------------------------------

/** Fetch a profile by user ID (for artisan info in bookings) */
export async function getProfileById(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProfileInfo | null; error: unknown }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone_e164')
    .eq('id', userId)
    .single()

  return { data: data as ProfileInfo | null, error }
}

/** Fetch provider's user_id for IDOR check */
export async function getProviderUserId(
  supabase: SupabaseClientType,
  providerId: string
): Promise<{ data: { user_id: string | null } | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('user_id')
    .eq('id', providerId)
    .single()

  return { data, error }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group slots by date for calendar view */
export function groupSlotsByDate(
  slots: SlotRow[]
): Record<string, Array<{ id: string; start: string; end: string; available: boolean }>> {
  return slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = []
      acc[slot.date].push({
        id: slot.id,
        start: slot.start_time,
        end: slot.end_time,
        available: slot.is_available,
      })
      return acc
    },
    {} as Record<string, Array<{ id: string; start: string; end: string; available: boolean }>>
  )
}

/** Check if two time intervals overlap: [a,b) and [c,d) overlap if a < d && c < b */
export function hasTimeOverlap(
  existingSlots: Array<{ start_time: string; end_time: string }>,
  startTime: string,
  endTime: string
): boolean {
  return existingSlots.some((slot) => startTime < slot.end_time && slot.start_time < endTime)
}

/** Format a date string to french locale */
export function formatDateFr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Extract normalized slot from booking join (handles array or single) */
export function extractSlotFromJoin<T>(slot: T | T[] | null): T | null {
  if (!slot) return null
  return Array.isArray(slot) ? (slot[0] ?? null) : slot
}
