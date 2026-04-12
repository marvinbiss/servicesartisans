import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCancellationNotification, logNotification } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'
import {
  getBookingForCancel,
  cancelBooking,
  getProfileById,
  formatDateFr,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

// POST request schema
const cancelBookingSchema = z.object({
  cancelledBy: z.enum(['client', 'artisan']),
  reason: z.string().max(500).optional(),
})

// POST /api/bookings/[id]/cancel - Cancel a booking
export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = cancelBookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { cancelledBy, reason } = result.data

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    // Fetch booking info
    const { data: booking, error: bookingError } = await getBookingForCancel(supabase, id)

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Verify ownership: only the client or the provider can cancel
    if (booking.client_id !== user.id && booking.provider_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à annuler cette réservation" },
        { status: 403 }
      )
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cette réservation est déjà annulée' }, { status: 400 })
    }

    // Check if cancellation is allowed (at least 24h before)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bookingDate = new Date(booking.scheduled_date!)
    const now = new Date()
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking < 24 && cancelledBy === 'client') {
      return NextResponse.json(
        { error: "Les annulations doivent être effectuées au moins 24h à l'avance" },
        { status: 400 }
      )
    }

    // Update booking status
    const { error: updateError } = await cancelBooking(supabase, id, cancelledBy, reason)

    if (updateError) throw updateError

    // Fetch artisan details for notification
    // Uses admin client: RLS policy 328 restricts cross-user profile reads
    const adminSupabase = createAdminClient()
    const { data: artisan } = await getProfileById(adminSupabase, booking.provider_id)

    // Format date for email
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const formattedDate = formatDateFr(booking.scheduled_date!)

    // Send cancellation notification (non-blocking)
    if (artisan?.email) {
      sendCancellationNotification({
        bookingId: id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientName: booking.client_name!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientEmail: booking.client_email!,
        artisanName: artisan.full_name || 'Artisan',
        artisanEmail: artisan.email,
        serviceName: booking.service_description || 'Service',
        date: formattedDate,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        startTime: new Date(booking.scheduled_date!).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        endTime: '',
        cancelledBy,
        reason,
      })
        .then(async (notifResult) => {
          await logNotification(supabase, {
            bookingId: id,
            type: 'cancellation',
            status: notifResult.clientNotification.success ? 'sent' : 'failed',
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            recipientEmail: booking.client_email!,
            errorMessage: notifResult.clientNotification.error,
          })
        })
        .catch((err) => {
          logger.error('Failed to send cancellation notifications:', err)
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Réservation annulée avec succès',
    })
  } catch (error) {
    logger.error('Error cancelling booking:', error)
    return NextResponse.json({ error: "Erreur lors de l'annulation" }, { status: 500 })
  }
}
