import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getNotificationService,
  type NotificationPayload,
} from '@/lib/notifications/unified-notification-service'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// GET /api/cron/send-reminders - Send reminder emails for tomorrow's bookings
export const dynamic = 'force-dynamic'

export const GET = withCronCheckIn('cron-send-reminders', async (request: Request) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
    }
    // Use service role for cron jobs to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey)
    // Verify cron secret - REQUIRED in production
    const authHeader = request.headers.get('authorization')
    if (!verifyCronSecret(authHeader)) {
      logger.warn('[Cron] Unauthorized access attempt to send-reminders')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Audit V1 P0 #4 : avant ce fix, `.eq(status,confirmed).limit(500)` puis
    // filter JS `scheduled_date.startsWith(tomorrowStr)` faisait silent-miss
    // tous les bookings de demain au-delà de la 500e ligne. Volume 970K
    // providers × N futurs ⇒ saturation possible. Fix : range côté DB.
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStart = new Date(tomorrow)
    tomorrowStart.setHours(0, 0, 0, 0)
    const dayAfter = new Date(tomorrowStart)
    dayAfter.setDate(dayAfter.getDate() + 1)
    const tomorrowStr = tomorrowStart.toISOString().split('T')[0]

    logger.info(`[Cron] Fetching bookings for ${tomorrowStr}`)

    const { data: tomorrowBookings, error } = await supabase
      .from('bookings')
      .select(
        `
        id,
        service_name,
        status,
        scheduled_date,
        provider_id,
        client:profiles!client_id(full_name, email, phone_e164)
      `
      )
      .eq('status', 'confirmed')
      .gte('scheduled_date', tomorrowStart.toISOString())
      .lt('scheduled_date', dayAfter.toISOString())
      .limit(5000)

    if (error) {
      logger.error('[Cron] Error fetching bookings:', error)
      throw error
    }

    logger.info(`[Cron] Found ${tomorrowBookings?.length ?? 0} bookings for tomorrow`)

    if (!tomorrowBookings || tomorrowBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune réservation pour demain',
        sentCount: 0,
      })
    }

    // Check which bookings haven't received a reminder yet
    const { data: sentReminders } = await supabase
      .from('notification_logs')
      .select('booking_id')
      .in(
        'booking_id',
        tomorrowBookings.map((b) => b.id)
      )
      .eq('type', 'reminder')
      .eq('status', 'sent')

    const sentBookingIds = new Set(sentReminders?.map((r) => r.booking_id) || [])

    // Filter out bookings that already received reminders
    const bookingsToRemind = tomorrowBookings.filter((b) => !sentBookingIds.has(b.id))

    logger.info(`[Cron] ${bookingsToRemind.length} bookings need reminders`)

    // Fetch artisan details for all bookings
    const artisanIds = Array.from(
      new Set(bookingsToRemind.map((b) => b.provider_id).filter(Boolean))
    )
    const { data: artisans } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', artisanIds)

    const artisanMap = new Map(artisans?.map((a) => [a.id, a]) || [])

    // Prepare notification payloads
    const payloads: NotificationPayload[] = bookingsToRemind.map((booking) => {
      const artisan = artisanMap.get(booking.provider_id || '')
      const client = Array.isArray(booking.client) ? booking.client[0] : booking.client
      const formattedDate = booking.scheduled_date
        ? new Date(booking.scheduled_date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : ''

      return {
        bookingId: booking.id,
        clientName: client?.full_name || '',
        clientEmail: client?.email || '',
        clientPhone: client?.phone_e164 || '',
        artisanName: artisan?.full_name || 'Artisan',
        serviceName: booking.service_name || 'Service',
        date: formattedDate,
        startTime: '',
        endTime: '',
      }
    })

    // Send reminders using unified notification service (email + SMS)
    const notificationService = getNotificationService()
    const result = await notificationService.sendBatch('reminder_24h', payloads)

    const sentCount = result.succeeded
    const failedCount = result.failed

    logger.info(`[Cron] Reminders sent: ${sentCount} succeeded, ${failedCount} failed`)

    logger.info(`[Cron] Completed: ${sentCount} sent, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      message: 'Rappels traités',
      sentCount,
      failedCount,
      totalBookings: tomorrowBookings.length,
    })
  } catch (error) {
    logger.error('[Cron] Error in send-reminders:', error)
    return NextResponse.json({ error: "Échec de l'envoi des rappels" }, { status: 500 })
  }
})
