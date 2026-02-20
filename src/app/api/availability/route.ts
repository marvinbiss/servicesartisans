import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const availabilityGetSchema = z.object({
  artisanId: z.string().uuid(),
})

// POST request schema
const availabilityPostSchema = z.object({
  artisanId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  })),
})

// PUT request schema
const availabilityPutSchema = z.object({
  artisanId: z.string().uuid(),
  settings: z.object({
    default_slots: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })).optional(),
    working_days: z.array(z.number().int().min(0).max(6)).optional(),
    booking_enabled: z.boolean().optional(),
    advance_booking_days: z.number().int().min(1).max(365).optional(),
    min_notice_hours: z.number().int().min(0).max(168).optional(),
    intervention_radius_km: z.number().min(1).max(200).optional(),
  }),
})

// DELETE query params schema
const availabilityDeleteSchema = z.object({
  slotId: z.string().uuid(),
})

// GET /api/availability - Get artisan's availability settings
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = {
    artisanId: searchParams.get('artisanId'),
  }
  const result = availabilityGetSchema.safeParse(queryParams)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: result.error.flatten() },
      { status: 400 }
    )
  }
  const { artisanId } = result.data

  try {
    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from('availability_settings')
      .select('artisan_id, default_slots, working_days, booking_enabled, advance_booking_days, min_notice_hours, intervention_radius_km, updated_at')
      .eq('artisan_id', artisanId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Return default settings if none exist
    const defaultSettings = {
      artisan_id: artisanId,
      default_slots: [
        { start: '08:00', end: '10:00' },
        { start: '10:00', end: '12:00' },
        { start: '14:00', end: '16:00' },
        { start: '16:00', end: '18:00' },
      ],
      working_days: [1, 2, 3, 4, 5], // Monday to Friday
      booking_enabled: true,
      advance_booking_days: 30,
      min_notice_hours: 24,
      intervention_radius_km: 20,
    }

    return NextResponse.json({ settings: settings || defaultSettings })
  } catch (error) {
    logger.error('Error fetching availability settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability settings' },
      { status: 500 }
    )
  }
}

// POST /api/availability - Create or update availability slots
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = availabilityPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { artisanId, slots, date } = result.data

    const supabase = await createClient()

    // Verify artisan has Pro or Premium subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', artisanId)
      .single()

    if (profileError) throw profileError

    if (!profile || !['pro', 'premium'].includes(profile.subscription_plan)) {
      return NextResponse.json(
        { error: 'Cette fonctionnalité nécessite un abonnement Pro ou Premium' },
        { status: 403 }
      )
    }

    // Delete existing slots for this date
    await supabase
      .from('availability_slots')
      .delete()
      .eq('artisan_id', artisanId)
      .eq('date', date)

    // Insert new slots
    const slotsToInsert = slots.map((slot: { start: string; end: string }) => ({
      artisan_id: artisanId,
      date: date,
      start_time: slot.start,
      end_time: slot.end,
      is_available: true,
    }))

    const { data: newSlots, error: insertError } = await supabase
      .from('availability_slots')
      .insert(slotsToInsert)
      .select()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      slots: newSlots,
    })
  } catch (error) {
    logger.error('Error updating availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}

// PUT /api/availability - Update availability settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const result = availabilityPutSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { artisanId, settings } = result.data

    const supabase = await createClient()

    // Upsert settings
    const { data, error } = await supabase
      .from('availability_settings')
      .upsert({
        artisan_id: artisanId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      settings: data,
    })
  } catch (error) {
    logger.error('Error updating availability settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// DELETE /api/availability - Delete a slot
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = {
    slotId: searchParams.get('slotId'),
  }
  const result = availabilityDeleteSchema.safeParse(queryParams)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: result.error.flatten() },
      { status: 400 }
    )
  }
  const { slotId } = result.data

  try {
    const supabase = await createClient()

    // Check if slot has a booking
    const { data: slot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*, booking:bookings(*)')
      .eq('id', slotId)
      .single()

    if (slotError) throw slotError

    if (slot?.booking && slot.booking.length > 0) {
      return NextResponse.json(
        { error: 'Ce créneau a une réservation et ne peut pas être supprimé' },
        { status: 400 }
      )
    }

    // Delete the slot
    const { error: deleteError } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', slotId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting slot:', error)
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    )
  }
}
