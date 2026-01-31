import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getNotificationService, type NotificationPayload } from '@/lib/notifications/unified-notification-service'
import { logger } from '@/lib/logger'

// Use service role for cron jobs to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/cron/send-reminders - Send reminder emails for tomorrow's bookings
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Calculate tomorrow's date range
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    logger.info(`[Cron] Fetching bookings for ${tomorrowStr}`)

    // Fetch all confirmed bookings for tomorrow
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_email,
        client_phone,
        service_description,
        status,
        slot:availability_slots(
          date,
          start_time,
          end_time,
          artisan_id
        )
      `)
      .eq('status', 'confirmed')
      .not('slot', 'is', null)

    if (error) {
      logger.error('[Cron] Error fetching bookings:', error)
      throw error
    }

    // Helper to get slot data (handles array from Supabase join)
    const getSlot = (slot: unknown) => {
      if (Array.isArray(slot)) return slot[0]
      return slot as { date: string; start_time: string; end_time: string; artisan_id: string } | undefined
    }

    // Filter bookings for tomorrow
    const tomorrowBookings = bookings?.filter(
      (b) => getSlot(b.slot)?.date === tomorrowStr
    ) || []

    logger.info(`[Cron] Found ${tomorrowBookings.length} bookings for tomorrow`)

    if (tomorrowBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bookings for tomorrow',
        sentCount: 0,
      })
    }

    // Check which bookings haven't received a reminder yet
    const { data: sentReminders } = await supabase
      .from('notification_logs')
      .select('booking_id')
      .in('booking_id', tomorrowBookings.map((b) => b.id))
      .eq('type', 'reminder')
      .eq('status', 'sent')

    const sentBookingIds = new Set(sentReminders?.map((r) => r.booking_id) || [])

    // Filter out bookings that already received reminders
    const bookingsToRemind = tomorrowBookings.filter(
      (b) => !sentBookingIds.has(b.id)
    )

    logger.info(`[Cron] ${bookingsToRemind.length} bookings need reminders`)

    // Fetch artisan details for all bookings
    const artisanIds = Array.from(new Set(bookingsToRemind.map((b) => getSlot(b.slot)?.artisan_id).filter(Boolean)))
    const { data: artisans } = await supabase
      .from('profiles')
      .select('id, full_name, company_name')
      .in('id', artisanIds)

    const artisanMap = new Map(artisans?.map((a) => [a.id, a]) || [])

    // Prepare notification payloads
    const payloads: NotificationPayload[] = bookingsToRemind.map((booking) => {
      const slot = getSlot(booking.slot)
      const artisan = artisanMap.get(slot?.artisan_id || '')
      const formattedDate = slot?.date ? new Date(slot.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) : ''

      return {
        bookingId: booking.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        artisanName: artisan?.company_name || artisan?.full_name || 'Artisan',
        serviceName: booking.service_description || 'Service',
        date: formattedDate,
        startTime: slot?.start_time || '',
        endTime: slot?.end_time || '',
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
      message: `Reminders processed`,
      sentCount,
      failedCount,
      totalBookings: tomorrowBookings.length,
    })
  } catch (error) {
    logger.error('[Cron] Error in send-reminders:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}
