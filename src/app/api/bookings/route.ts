/**
 * Bookings API - ServicesArtisans
 * Handles booking creation and retrieval with proper validation
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendBookingNotifications,
  type NotificationPayload,
} from '@/lib/notifications/unified-notification-service'
import { createBookingSchema, validateRequest, formatZodErrors } from '@/lib/validations/schemas'
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors/types'
import { logger } from '@/lib/logger'
import {
  getBookingsByProviderId,
  getAvailableSlotsForMonth,
  getSlotsWithBookingsForDate,
  getProviderUserId,
  getProfileById,
  groupSlotsByDate,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

// Schema for GET request query params
const getQuerySchema = z.object({
  artisanId: z.string().uuid('ID artisan invalide'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/)
    .optional(),
})

// GET /api/bookings - Get artisan's bookings or available slots
export const dynamic = 'force-dynamic'

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
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Paramètres invalides', {
          fields: formatZodErrors(queryValidation.error),
        }),
        { status: 400 }
      )
    }

    const { artisanId, date, month } = queryValidation.data
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.UNAUTHORIZED, 'Authentification requise'),
        { status: 401 }
      )
    }

    // SECURITY: Verify the authenticated user owns the artisan profile (IDOR protection)
    const adminSupabase = createAdminClient()
    const { data: provider, error: providerError } = await getProviderUserId(
      adminSupabase,
      artisanId
    )

    if (providerError || !provider) {
      return NextResponse.json(createErrorResponse(ErrorCode.NOT_FOUND, 'Artisan introuvable'), {
        status: 404,
      })
    }

    if (provider.user_id !== user.id) {
      logger.warn('IDOR attempt blocked', { userId: user.id, artisanId })
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.INSUFFICIENT_PERMISSIONS,
          'Accès non autorisé à ces réservations'
        ),
        { status: 403 }
      )
    }

    // If fetching for a specific month (client view - available slots)
    if (month) {
      const startDate = new Date(month)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

      const { data: slots, error } = await getAvailableSlotsForMonth(
        supabase,
        artisanId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      if (error) {
        logger.error('Database error', error)
        return NextResponse.json(
          createErrorResponse(
            ErrorCode.DATABASE_ERROR,
            'Erreur lors de la récupération des créneaux'
          ),
          { status: 500 }
        )
      }

      const slotsByDate = groupSlotsByDate(slots ?? [])
      return NextResponse.json(createSuccessResponse({ slots: slotsByDate }))
    }

    // If fetching for a specific date (artisan view - all slots with bookings)
    if (date) {
      const { data: slots, error } = await getSlotsWithBookingsForDate(supabase, artisanId, date)

      if (error) {
        logger.error('Database error', error)
        return NextResponse.json(
          createErrorResponse(
            ErrorCode.DATABASE_ERROR,
            'Erreur lors de la récupération des créneaux'
          ),
          { status: 500 }
        )
      }

      return NextResponse.json(createSuccessResponse({ slots }))
    }

    // Default: get all bookings for the artisan
    const { data: bookings, error } = await getBookingsByProviderId(supabase, artisanId)

    if (error) {
      logger.error('Database error', error)
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.DATABASE_ERROR,
          'Erreur lors de la récupération des réservations'
        ),
        { status: 500 }
      )
    }

    return NextResponse.json(createSuccessResponse({ bookings }))
  } catch (error) {
    logger.error('Error fetching bookings', error)
    return NextResponse.json(
      createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Erreur lors de la récupération des réservations'
      ),
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
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Données de réservation invalides', {
          fields: formatZodErrors(validation.errors),
        }),
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

    const supabase = await createClient()

    // SECURITY FIX: Use atomic transaction to prevent double booking
    const { data: result, error: rpcError } = await supabase.rpc('create_booking_atomic', {
      p_artisan_id: artisanId,
      p_slot_id: slotId,
      p_client_name: clientName.trim(),
      p_client_phone: clientPhone,
      p_client_email: clientEmail.toLowerCase().trim(),
      p_service_description: serviceDescription?.slice(0, 1000) || null,
      p_address: address?.slice(0, 500) || null,
      p_payment_intent_id: paymentIntentId || null,
      p_deposit_amount: depositAmount || null,
    })

    if (rpcError) {
      logger.error('Booking RPC error', rpcError)
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.DATABASE_ERROR,
          'Erreur lors de la création de la réservation'
        ),
        { status: 500 }
      )
    }

    // Check result from atomic function
    if (!result.success) {
      const errorMap: Record<string, { code: ErrorCode; status: number }> = {
        SLOT_UNAVAILABLE: { code: ErrorCode.SLOT_UNAVAILABLE, status: 409 },
        SLOT_ALREADY_BOOKED: { code: ErrorCode.SLOT_UNAVAILABLE, status: 409 },
        DUPLICATE_BOOKING: { code: ErrorCode.ALREADY_EXISTS, status: 409 },
        DATABASE_ERROR: { code: ErrorCode.DATABASE_ERROR, status: 500 },
      }
      const errorInfo = errorMap[result.error] || { code: ErrorCode.INTERNAL_ERROR, status: 500 }
      return NextResponse.json(createErrorResponse(errorInfo.code, result.message), {
        status: errorInfo.status,
      })
    }

    const booking = { id: result.booking_id }
    const slot = result.slot

    // Fetch artisan details for email notification
    // Uses admin client: RLS policy 328 restricts cross-user profile reads
    const adminSupabase = createAdminClient()
    const { data: artisan } = await getProfileById(adminSupabase, artisanId)

    // Format date for email
    const bookingDate = new Date(slot.date)
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Determine artisan display name
    const artisanDisplayName = artisan?.full_name || 'Artisan'

    // Send confirmation notifications (email + SMS, non-blocking)
    const notificationPayload: NotificationPayload = {
      bookingId: booking.id,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      artisanName: artisanDisplayName,
      artisanEmail: artisan?.email ?? undefined,
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
          status: 'confirmed', // RPC sets status to confirmed
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          artisanName: artisanDisplayName,
        },
        message: 'Réservation confirmée avec succès',
      }),
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating booking', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur lors de la création de la réservation'),
      { status: 500 }
    )
  }
}
