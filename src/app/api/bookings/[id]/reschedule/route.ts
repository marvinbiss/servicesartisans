import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation, logNotification } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'

// POST /api/bookings/[id]/reschedule - Reschedule a booking to a new slot
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { newSlotId } = body

    if (!newSlotId) {
      return NextResponse.json(
        { error: 'newSlotId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Fetch current booking
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
        { error: 'Impossible de reporter une réservation annulée' },
        { status: 400 }
      )
    }

    // Verify new slot exists and is available
    const { data: newSlot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', newSlotId)
      .eq('is_available', true)
      .single()

    if (slotError || !newSlot) {
      return NextResponse.json(
        { error: 'Le nouveau créneau n\'est plus disponible' },
        { status: 400 }
      )
    }

    // Verify new slot belongs to the same artisan
    if (newSlot.artisan_id !== booking.slot.artisan_id) {
      return NextResponse.json(
        { error: 'Le créneau doit appartenir au même artisan' },
        { status: 400 }
      )
    }

    // Check that new slot is in the future
    const newSlotDate = new Date(`${newSlot.date}T${newSlot.start_time}`)
    if (newSlotDate <= new Date()) {
      return NextResponse.json(
        { error: 'Le nouveau créneau doit être dans le futur' },
        { status: 400 }
      )
    }

    // Update booking with new slot
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        slot_id: newSlotId,
        rescheduled_at: new Date().toISOString(),
        rescheduled_from_slot_id: booking.slot.id,
      })
      .eq('id', params.id)

    if (updateError) throw updateError

    // Make old slot available again
    await supabase
      .from('availability_slots')
      .update({ is_available: true })
      .eq('id', booking.slot.id)

    // Mark new slot as unavailable
    await supabase
      .from('availability_slots')
      .update({ is_available: false })
      .eq('id', newSlotId)

    // Fetch artisan details for notification
    const { data: artisan } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', booking.slot.artisan_id)
      .single()

    // Format new date for email
    const formattedDate = new Date(newSlot.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Send confirmation of rescheduled booking (non-blocking)
    if (artisan?.email) {
      sendBookingConfirmation({
        bookingId: params.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        artisanName: artisan.full_name || 'Artisan',
        artisanEmail: artisan.email,
        serviceName: booking.service_description || 'Service',
        date: formattedDate,
        startTime: newSlot.start_time,
        endTime: newSlot.end_time,
        message: `Report de réservation - Ancien créneau: ${booking.slot.date} ${booking.slot.start_time}`,
      }).then(async (result) => {
        await logNotification(supabase, {
          bookingId: params.id,
          type: 'reschedule',
          status: result.clientNotification.success ? 'sent' : 'failed',
          recipientEmail: booking.client_email,
          errorMessage: result.clientNotification.error,
        })
      }).catch((err) => {
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
      { error: 'Erreur lors du report' },
      { status: 500 }
    )
  }
}
