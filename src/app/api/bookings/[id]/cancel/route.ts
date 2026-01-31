import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendCancellationNotification, logNotification } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'

// POST /api/bookings/[id]/cancel - Cancel a booking
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { cancelledBy, reason } = body

    if (!cancelledBy || !['client', 'artisan'].includes(cancelledBy)) {
      return NextResponse.json(
        { error: 'cancelledBy must be "client" or "artisan"' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Fetch booking with slot and artisan info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        slot:availability_slots(
          id,
          date,
          start_time,
          end_time,
          artisan_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      )
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cette réservation est déjà annulée' },
        { status: 400 }
      )
    }

    // Check if cancellation is allowed (at least 24h before)
    const bookingDate = new Date(`${booking.slot.date}T${booking.slot.start_time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking < 24 && cancelledBy === 'client') {
      return NextResponse.json(
        { error: 'Les annulations doivent être effectuées au moins 24h à l\'avance' },
        { status: 400 }
      )
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
      })
      .eq('id', params.id)

    if (updateError) throw updateError

    // Make the slot available again
    const { error: slotError } = await supabase
      .from('availability_slots')
      .update({ is_available: true })
      .eq('id', booking.slot.id)

    if (slotError) {
      logger.error('Error making slot available again:', slotError)
    }

    // Fetch artisan details for notification
    const { data: artisan } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', booking.slot.artisan_id)
      .single()

    // Format date for email
    const formattedDate = new Date(booking.slot.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Send cancellation notification (non-blocking)
    if (artisan?.email) {
      sendCancellationNotification({
        bookingId: params.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        artisanName: artisan.full_name || 'Artisan',
        artisanEmail: artisan.email,
        serviceName: booking.service_description || 'Service',
        date: formattedDate,
        startTime: booking.slot.start_time,
        endTime: booking.slot.end_time,
        cancelledBy,
        reason,
      }).then(async (result) => {
        await logNotification(supabase, {
          bookingId: params.id,
          type: 'cancellation',
          status: result.clientNotification.success ? 'sent' : 'failed',
          recipientEmail: booking.client_email,
          errorMessage: result.clientNotification.error,
        })
      }).catch((err) => {
        logger.error('Failed to send cancellation notifications:', err)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Réservation annulée avec succès',
    })
  } catch (error) {
    logger.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    )
  }
}
