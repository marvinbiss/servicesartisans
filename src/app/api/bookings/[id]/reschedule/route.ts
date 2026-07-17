import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingConfirmation, logNotification } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'
import {
  getBookingForReschedule,
  getAvailableSlotById,
  rescheduleBooking,
  updateSlotAvailability,
  getProfileById,
  extractSlotFromJoin,
  formatDateFr,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

// POST request schema
const rescheduleBookingSchema = z.object({
  newSlotId: z.string().uuid(),
})

// POST /api/bookings/[id]/reschedule - Reschedule a booking to a new slot
export const dynamic = 'force-dynamic'

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
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

    const body = await request.json()
    const result = rescheduleBookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { newSlotId } = result.data

    // Fetch current booking
    const { data: booking, error: bookingError } = await getBookingForReschedule(
      supabase,
      params.id
    )

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: { message: 'Réservation introuvable' } },
        { status: 404 }
      )
    }

    // Ownership check: user must be the client or the assigned artisan
    const bookingSlotForAuth = extractSlotFromJoin(booking.slot)
    const isClient = booking.client_id === user.id
    const isArtisan = bookingSlotForAuth?.artisan_id === user.id
    const isEmailMatch = user.email?.toLowerCase() === booking.client_email?.toLowerCase()
    if (!isClient && !isArtisan && !isEmailMatch) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Vous n'êtes pas autorisé à reporter cette réservation" },
        },
        { status: 403 }
      )
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: { message: 'Impossible de reporter une réservation annulée' } },
        { status: 400 }
      )
    }

    // Verify new slot exists and is available
    const { data: newSlot, error: slotError } = await getAvailableSlotById(supabase, newSlotId)

    if (slotError || !newSlot) {
      return NextResponse.json(
        { success: false, error: { message: "Le nouveau créneau n'est plus disponible" } },
        { status: 400 }
      )
    }

    // Verify new slot belongs to the same artisan
    const bookingSlot = extractSlotFromJoin(booking.slot)
    if (newSlot.artisan_id !== bookingSlot?.artisan_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Le créneau doit appartenir au même artisan' } },
        { status: 400 }
      )
    }

    // Check that new slot is in the future
    const newSlotDate = new Date(`${newSlot.date}T${newSlot.start_time}`)
    if (newSlotDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: { message: 'Le nouveau créneau doit être dans le futur' } },
        { status: 400 }
      )
    }

    // Update booking with new slot
    const { error: updateError } = await rescheduleBooking(
      supabase,
      params.id,
      { date: newSlot.date, start_time: newSlot.start_time },
      bookingSlot?.id ?? ''
    )

    if (updateError) throw updateError

    // Make old slot available again
    if (bookingSlot?.id) {
      await updateSlotAvailability(supabase, bookingSlot.id, true)
    }

    // Mark new slot as unavailable
    await updateSlotAvailability(supabase, newSlotId, false)

    // Fetch artisan details for notification
    // Uses admin client: RLS policy 328 restricts cross-user profile reads
    const adminSupabase = createAdminClient()
    const { data: artisan } = await getProfileById(adminSupabase, bookingSlot?.artisan_id ?? '')

    // Format new date for email
    const formattedDate = formatDateFr(newSlot.date)

    // Send confirmation of rescheduled booking (non-blocking)
    if (artisan?.email) {
      sendBookingConfirmation({
        bookingId: params.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientName: booking.client_name!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientEmail: booking.client_email!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientPhone: booking.client_phone!,
        artisanName: artisan.full_name || 'Artisan',
        artisanEmail: artisan.email,
        serviceName: booking.service_description || 'Service',
        date: formattedDate,
        startTime: newSlot.start_time,
        endTime: newSlot.end_time,
        message: `Report de réservation - Ancien créneau: ${bookingSlot?.date} ${bookingSlot?.start_time}`,
      })
        .then(async (notifResult) => {
          await logNotification(supabase, {
            bookingId: params.id,
            type: 'reschedule',
            status: notifResult.clientNotification.success ? 'sent' : 'failed',
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            recipientEmail: booking.client_email!,
            errorMessage: notifResult.clientNotification.error,
          })
        })
        .catch((err) => {
          logger.error('Failed to send reschedule notifications:', err)
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Réservation reportée avec succès',
      newSlot: {
        date: newSlot.date,
        startTime: newSlot.start_time,
        endTime: newSlot.end_time,
      },
    })
  } catch (error) {
    logger.error('Error rescheduling booking:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors du report' } },
      { status: 500 }
    )
  }
}
