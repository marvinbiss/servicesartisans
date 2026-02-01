import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// GET /api/availability - Get artisan's availability settings
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const artisanId = searchParams.get('artisanId')

  if (!artisanId) {
    return NextResponse.json(
      { error: 'artisanId is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from('availability_settings')
      .select('*')
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
    const { artisanId, slots, date } = body

    if (!artisanId || !slots || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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
    const { artisanId, settings } = body

    if (!artisanId || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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
  const slotId = searchParams.get('slotId')

  if (!slotId) {
    return NextResponse.json(
      { error: 'slotId is required' },
      { status: 400 }
    )
  }

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
