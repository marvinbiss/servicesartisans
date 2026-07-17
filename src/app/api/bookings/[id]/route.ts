import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  getBookingByIdWithSlot,
  getBookingForAuthCheck,
  updateBooking,
  getProfileById,
  extractSlotFromJoin,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

// Booking ID schema - must be valid UUID
const bookingIdSchema = z.string().uuid('ID de réservation invalide')

// PATCH request schema
const bookingPatchSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().max(1000).optional(),
})

// GET /api/bookings/[id] - Get booking details
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const bookingId = params.id

    // Validate booking ID format (must be full UUID)
    const idValidation = bookingIdSchema.safeParse(bookingId)
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'ID de réservation invalide' } },
        { status: 400 }
      )
    }

    // Get authenticated user (optional for booking lookup by ID)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Use admin client for booking lookup
    const adminSupabase = createAdminClient()

    // Query booking by exact ID only (no partial matching for security)
    const { data: booking, error } = await getBookingByIdWithSlot(adminSupabase, bookingId)

    if (error || !booking) {
      return NextResponse.json(
        { success: false, error: { message: 'Réservation introuvable' } },
        { status: 404 }
      )
    }

    const slot = extractSlotFromJoin(
      booking.slot as Array<{
        id: string
        date: string
        start_time: string
        end_time: string
        artisan_id: string
      }> | null
    )

    // Require authentication to view booking details
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    // Security check: If user is authenticated, verify they have access to this booking
    // (either as the client who made it, or as the artisan)
    if (user) {
      const isOwner = booking.client_id === user.id
      const isArtisan = slot?.artisan_id === user.id

      // For authenticated users, they must be the owner or the artisan
      if (!isOwner && !isArtisan) {
        // Check if user email matches booking email (for non-registered users who made booking)
        if (user.email?.toLowerCase() !== booking.client_email?.toLowerCase()) {
          return NextResponse.json(
            { success: false, error: { message: 'Accès non autorisé à cette réservation' } },
            { status: 403 }
          )
        }
      }
    }

    // Fetch artisan details (limited info for non-owners)
    let artisan: {
      id: string
      full_name: string | null
      phone_e164: string | null
      email: string | null
    } | null = null
    if (slot?.artisan_id) {
      const { data: artisanData } = await getProfileById(adminSupabase, slot.artisan_id)
      artisan = artisanData
        ? {
            id: artisanData.id ?? slot.artisan_id,
            full_name: artisanData.full_name,
            phone_e164: artisanData.phone_e164 ?? null,
            email: artisanData.email,
          }
        : null
    }

    // Format response for confirmation page
    return NextResponse.json({
      booking: {
        id: booking.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        serviceName: booking.service_description || 'Service',
        status: booking.status,
        createdAt: booking.created_at,
        cancelledAt: booking.cancelled_at,
        cancelledBy: booking.cancelled_by,
        cancellationReason: booking.cancellation_reason,
        rescheduledAt: booking.rescheduled_at,
        paymentStatus: booking.payment_status,
        depositAmount: booking.deposit_amount,
        date: slot?.date,
        startTime: slot?.start_time,
        endTime: slot?.end_time,
        slotId: slot?.id,
        artisanId: artisan?.id || slot?.artisan_id,
        artisanName: artisan?.full_name || 'Artisan',
        artisanPhone: artisan?.phone_e164 ?? null,
        artisanEmail: artisan?.email,
        artisanAvatar: null,
        // Legacy format for backward compatibility
        client_name: booking.client_name,
        client_phone: booking.client_phone,
        client_email: booking.client_email,
        service_description: booking.service_description,
        slot: booking.slot,
        artisan: artisan || { id: slot?.artisan_id, full_name: 'Artisan' },
      },
    })
  } catch (error) {
    logger.error('Error fetching booking:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors du chargement de la réservation' } },
      { status: 500 }
    )
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const bookingId = params.id

    // Validate booking ID format
    const idValidation = bookingIdSchema.safeParse(bookingId)
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'ID de réservation invalide' } },
        { status: 400 }
      )
    }

    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = bookingPatchSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Requête invalide', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { status, notes } = result.data

    // Verify user has access to this booking
    const adminSupabase = createAdminClient()
    const { data: existingBooking, error: fetchError } = await getBookingForAuthCheck(
      adminSupabase,
      bookingId
    )

    if (fetchError || !existingBooking) {
      return NextResponse.json(
        { success: false, error: { message: 'Réservation introuvable' } },
        { status: 404 }
      )
    }

    // Check authorization: must be owner or artisan
    const slotData = existingBooking.slot as Array<{ artisan_id: string }> | null
    const isOwner = existingBooking.client_id === user.id
    const isArtisan = slotData?.[0]?.artisan_id === user.id
    const isEmailMatch = user.email?.toLowerCase() === existingBooking.client_email?.toLowerCase()

    if (!isOwner && !isArtisan && !isEmailMatch) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Vous n'êtes pas autorisé à modifier cette réservation" },
        },
        { status: 403 }
      )
    }

    const updateData: Record<string, string | undefined> = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await updateBooking(adminSupabase, bookingId, updateData)

    if (error) {
      logger.error('Booking update error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      booking: data,
    })
  } catch (error) {
    logger.error('Booking PATCH error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la mise à jour' } },
      { status: 500 }
    )
  }
}
