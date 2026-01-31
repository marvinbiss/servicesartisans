/**
 * Bookings API - ServicesArtisans
 * Handles booking creation and retrieval with proper validation
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingNotifications, type NotificationPayload } from '@/lib/notifications/unified-notification-service'
import { createBookingSchema, getBookingsSchema, validateRequest, formatZodErrors } from '@/lib/validations/schemas'
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors/types'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Schema for GET request query params
const getQuerySchema = z.object({
  artisanId: z.string().uuid('ID artisan invalide'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).optional(),
})

// GET /api/bookings - Get artisan's bookings or available slots
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const queryValidation = getQuerySchema.safeParse({
      artisanId: searchParams.get('artisanId'),
      date: searchParams.get('date') || undefined,
      month: searchParams.get('month') || undefined,
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Parametres invalides',
          { fields: formatZodErrors(queryValidation.error) }
        ),
        { status: 400 }
      )
    }

    const { artisanId, date, month } = queryValidation.data
    const supabase = createClient()

    // If fetching for a specific month (client view - available slots)
    if (month) {
      const startDate = new Date(month)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('artisan_id', artisanId)
        .eq('is_available', true)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date')
        .order('start_time')

      if (error) {
        logger.error('Database error', error)
        return NextResponse.json(
          createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la recuperation des creneaux'),
          { status: 500 }
        )
      }

      // Group slots by date
      const slotsByDate = slots?.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = []
        acc[slot.date].push({
          id: slot.id,
          start: slot.start_time,
          end: slot.end_time,
          available: slot.is_available,
        })
        return acc
      }, {} as Record<string, Array<{ id: string; start: string; end: string; available: boolean }>>)

      return NextResponse.json(createSuccessResponse({ slots: slotsByDate }))
    }

    // If fetching for a specific date (artisan view - all slots with bookings)
    if (date) {
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select(`
          *,
          booking:bookings(
            id,
            client_name,
            client_phone,
            client_email,
            service_description,
            status
          )
        `)
        .eq('artisan_id', artisanId)
        .eq('date', date)
        .order('start_time')

      if (error) {
        logger.error('Database error', error)
        return NextResponse.json(
          createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la recuperation des creneaux'),
          { status: 500 }
        )
      }

      return NextResponse.json(createSuccessResponse({ slots }))
    }

    // Default: get all bookings for the artisan
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        slot:availability_slots(
          date,
          start_time,
          end_time
        )
      `)
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Database error', error)
      return NextResponse.json(
        createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la recuperation des reservations'),
        { status: 500 }
      )
    }

    return NextResponse.json(createSuccessResponse({ bookings }))
  } catch (error) {
    logger.error('Error fetching bookings', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur lors de la recuperation des reservations'),
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateRequest(createBookingSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Donnees de reservation invalides',
          { fields: formatZodErrors(validation.errors) }
        ),
        { status: 400 }
      )
    }

    const {
      artisanId,
      slotId,
      clientName,
      clientPhone,
      clientEmail,
      serviceDescription,
      address,
      paymentIntentId,
      depositAmount,
    } = validation.data

    const supabase = createClient()

    // Check if slot is still available
    const { data: slot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_available', true)
      .single()

    if (slotError || !slot) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.SLOT_UNAVAILABLE, 'Ce creneau n\'est plus disponible'),
        { status: 409 }
      )
    }

    // Check for existing booking with same email on same date (prevent duplicates)
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('slot_id', slotId)
      .eq('client_email', clientEmail.toLowerCase())
      .eq('status', 'confirmed')
      .single()

    if (existingBooking) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.ALREADY_EXISTS, 'Vous avez deja une reservation pour ce creneau'),
        { status: 409 }
      )
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        artisan_id: artisanId,
        slot_id: slotId,
        client_name: clientName.trim(),
        client_phone: clientPhone,
        client_email: clientEmail.toLowerCase().trim(),
        service_description: serviceDescription?.slice(0, 1000) || null,
        address: address?.slice(0, 500) || null,
        payment_intent_id: paymentIntentId || null,
        deposit_amount: depositAmount || null,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (bookingError) {
      logger.error('Booking creation error', bookingError)
      return NextResponse.json(
        createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la creation de la reservation'),
        { status: 500 }
      )
    }

    // Mark slot as unavailable
    const { error: updateError } = await supabase
      .from('availability_slots')
      .update({ is_available: false })
      .eq('id', slotId)

    if (updateError) {
      logger.error('Slot update error', updateError)
      // Don't fail the booking, but log the error
    }

    // Fetch artisan details for email notification
    const { data: artisan } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, business_name')
      .eq('id', artisanId)
      .single()

    // Format date for email
    const bookingDate = new Date(slot.date)
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Determine artisan display name
    const artisanDisplayName = artisan?.business_name ||
      (artisan?.first_name && artisan?.last_name
        ? `${artisan.first_name} ${artisan.last_name}`
        : 'Artisan')

    // Send confirmation notifications (email + SMS, non-blocking)
    const notificationPayload: NotificationPayload = {
      bookingId: booking.id,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      artisanName: artisanDisplayName,
      artisanEmail: artisan?.email,
      serviceName: serviceDescription || 'Service',
      date: formattedDate,
      startTime: slot.start_time,
      endTime: slot.end_time,
      message: serviceDescription,
    }

    // Send notifications asynchronously (don't block response)
    sendBookingNotifications(notificationPayload).catch((err) => {
      logger.error('Failed to send booking confirmation notifications', err)
    })

    return NextResponse.json(
      createSuccessResponse({
        booking: {
          id: booking.id,
          status: booking.status,
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          artisanName: artisanDisplayName,
        },
        message: 'Reservation confirmee avec succes',
      }),
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating booking', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur lors de la creation de la reservation'),
      { status: 500 }
    )
  }
}
