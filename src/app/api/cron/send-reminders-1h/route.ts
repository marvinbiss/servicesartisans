/**
 * 1-Hour Reminder Cron Job - ServicesArtisans
 * Sends SMS reminders 1 hour before appointments
 * Best practice: SMS has 98% open rate, ideal for last-minute reminders
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getNotificationService, type NotificationPayload } from '@/lib/notifications/unified-notification-service'
import { logger } from '@/lib/logger'

// Use service role for cron jobs to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/cron/send-reminders-1h - Send 1h reminder SMS
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify cron secret - REQUIRED in production
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('[Cron 1h] Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Calculate time window: appointments between now+55min and now+65min
    const now = new Date()
    const windowStart = new Date(now.getTime() + 55 * 60 * 1000)
    const windowEnd = new Date(now.getTime() + 65 * 60 * 1000)

    const todayStr = now.toISOString().split('T')[0]
    const windowStartTime = windowStart.toTimeString().slice(0, 5) // HH:MM
    const windowEndTime = windowEnd.toTimeString().slice(0, 5)

    logger.info(`[Cron 1h] Looking for appointments between ${windowStartTime} and ${windowEndTime}`)

    // Fetch bookings in the time window
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
      logger.error('[Cron 1h] Error fetching bookings:', error)
      throw error
    }

    // Helper to get slot data (handles array from Supabase join)
    const getSlot = (slot: unknown) => {
      if (Array.isArray(slot)) return slot[0]
      return slot as { date: string; start_time: string; end_time: string; artisan_id: string } | undefined
    }

    // Filter bookings for the time window
    const upcomingBookings = bookings?.filter((b) => {
      const slot = getSlot(b.slot)
      if (!slot?.date || !slot?.start_time) return false
      if (slot.date !== todayStr) return false

      const startTime = slot.start_time.slice(0, 5)
      return startTime >= windowStartTime && startTime <= windowEndTime
    }) || []

    logger.info(`[Cron 1h] Found ${upcomingBookings.length} bookings starting in ~1 hour`)

    if (upcomingBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No appointments in the next hour',
        sentCount: 0,
      })
    }

    // Check which bookings haven't received 1h reminder yet
    const { data: sentReminders } = await supabase
      .from('notification_logs')
      .select('booking_id')
      .in('booking_id', upcomingBookings.map((b) => b.id))
      .eq('type', 'reminder_1h_sms')
      .eq('status', 'sent')

    const sentBookingIds = new Set(sentReminders?.map((r) => r.booking_id) || [])

    // Filter out bookings that already received 1h reminder
    const bookingsToRemind = upcomingBookings.filter(
      (b) => !sentBookingIds.has(b.id) && b.client_phone
    )

    logger.info(`[Cron 1h] ${bookingsToRemind.length} bookings need 1h reminder`)

    if (bookingsToRemind.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All reminders already sent',
        sentCount: 0,
      })
    }

    // Fetch artisan details
    const artisanIds = Array.from(new Set(bookingsToRemind.map((b) => getSlot(b.slot)?.artisan_id).filter(Boolean)))
    const { data: artisans } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', artisanIds)

    const artisanMap = new Map(artisans?.map((a) => [a.id, a]) || [])

    // Prepare notification payloads
    const payloads: NotificationPayload[] = bookingsToRemind.map((booking) => {
      const slot = getSlot(booking.slot)
      const artisan = artisanMap.get(slot?.artisan_id || '')

      return {
        bookingId: booking.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        artisanName: artisan?.full_name || 'Artisan',
        serviceName: booking.service_description || 'Service',
        date: slot?.date ? new Date(slot.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }) : '',
        startTime: slot?.start_time || '',
        endTime: slot?.end_time || '',
      }
    })

    // Send reminders using unified service (SMS only for 1h reminder)
    const notificationService = getNotificationService()
    const result = await notificationService.sendBatch(
      'reminder_1h',
      payloads,
      { email: false, sms: true }
    )

    logger.info(`[Cron 1h] Completed: ${result.succeeded} sent, ${result.failed} failed`)

    return NextResponse.json({
      success: true,
      message: '1h reminders processed',
      sentCount: result.succeeded,
      failedCount: result.failed,
      totalBookings: upcomingBookings.length,
    })
  } catch (error) {
    logger.error('[Cron 1h] Error in send-reminders-1h:', error)
    return NextResponse.json(
      { error: 'Failed to send 1h reminders' },
      { status: 500 }
    )
  }
}
