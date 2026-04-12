import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import {
  getSlotIdsForDate,
  hasActiveBookingsOnSlots,
  deleteSlotsForDate,
  bulkInsertSlots,
  getSlotWithBookings,
  deleteSlot,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

// GET query params schema
const availabilityGetSchema = z.object({
  artisanId: z.string().uuid(),
})

// POST request schema
const availabilityPostSchema = z.object({
  artisanId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(
    z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
})

// DELETE query params schema
const availabilityDeleteSchema = z.object({
  slotId: z.string().uuid(),
})

// GET /api/availability - Get artisan's availability settings
// Note: availability_settings table was removed in migration 100
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = {
    artisanId: searchParams.get('artisanId'),
  }
  const result = availabilityGetSchema.safeParse(queryParams)
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Paramètres invalides', details: result.error.flatten() },
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    settings: null,
    message: 'Paramètres de disponibilité non disponibles',
  })
}

// POST /api/availability - Create or update availability slots
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = availabilityPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { artisanId, slots, date } = result.data

    const supabase = await createClient()

    // Verify ownership: artisanId must match the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }
    if (result.data.artisanId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Accès refusé' } },
        { status: 403 }
      )
    }

    // Verifier qu'aucune reservation active n'est liee aux creneaux de cette date
    const { data: existingSlots } = await getSlotIdsForDate(supabase, artisanId, date)

    if (existingSlots && existingSlots.length > 0) {
      const slotIds = existingSlots.map((s) => s.id)
      const hasActive = await hasActiveBookingsOnSlots(supabase, slotIds)

      if (hasActive) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Des créneaux de cette date ont des réservations actives' },
          },
          { status: 409 }
        )
      }
    }

    // Supprimer les creneaux existants pour cette date
    await deleteSlotsForDate(supabase, artisanId, date)

    // Insert new slots
    const slotsToInsert = slots.map((slot: { start: string; end: string }) => ({
      artisan_id: artisanId,
      date: date,
      start_time: slot.start,
      end_time: slot.end,
      is_available: true,
    }))

    const { data: newSlots, error: insertError } = await bulkInsertSlots(supabase, slotsToInsert)

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      slots: newSlots,
    })
  } catch (error) {
    logger.error('Error updating availability:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la mise à jour de la disponibilité' } },
      { status: 500 }
    )
  }
}

// PUT /api/availability - Update availability settings
// Note: availability_settings table was removed in migration 100
export async function PUT(_request: Request) {
  return NextResponse.json(
    { success: false, error: { message: 'Fonctionnalité non disponible' } },
    { status: 501 }
  )
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
      {
        success: false,
        error: { message: 'Paramètres invalides', details: result.error.flatten() },
      },
      { status: 400 }
    )
  }
  const { slotId } = result.data

  try {
    const supabase = await createClient()

    // Auth guard: require authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }

    // Check if slot has a booking
    const { data: slot, error: slotError } = await getSlotWithBookings(supabase, slotId)

    if (slotError) throw slotError

    // Ownership check: only the artisan who owns the slot can delete it
    if (slot?.artisan_id !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Vous n'êtes pas autorisé à supprimer ce créneau" } },
        { status: 403 }
      )
    }

    if (slot?.booking && slot.booking.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Ce créneau a une réservation et ne peut pas être supprimé' },
        },
        { status: 400 }
      )
    }

    // Delete the slot
    const { error: deleteError } = await deleteSlot(supabase, slotId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting slot:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la suppression du créneau' } },
      { status: 500 }
    )
  }
}
