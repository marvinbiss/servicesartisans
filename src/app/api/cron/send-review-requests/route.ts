/**
 * Review Request Cron Job - ServicesArtisans
 * Sends review request emails 2 hours after completed appointments
 * Best practice: Timing is crucial - 2h after is optimal for service businesses
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/notifications/email'
import { sendReviewRequestSMS, type SMSData } from '@/lib/notifications/sms'
import { logger } from '@/lib/logger'
import { escapeHtml } from '@/lib/utils/html'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

// Review request email template
function getReviewEmailTemplate(data: {
  clientName: string
  artisanName: string
  serviceName: string
  reviewUrl: string
}) {
  const safeClientName = escapeHtml(data.clientName)
  const safeArtisanName = escapeHtml(data.artisanName)
  const safeServiceName = escapeHtml(data.serviceName)

  return {
    subject: `Comment s'est pass\u00e9 votre RDV avec ${data.artisanName} ?`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Votre avis compte !</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Bonjour <strong>${safeClientName}</strong>,
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Comment s'est pass\u00e9 votre rendez-vous avec <strong>${safeArtisanName}</strong> pour <strong>${safeServiceName}</strong> ?
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Votre avis aide d'autres personnes \u00e0 trouver les meilleurs artisans et permet \u00e0 ${safeArtisanName} de s'am\u00e9liorer.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.reviewUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
                  Laisser un avis
                </a>
              </div>

              <p style="color: #999; font-size: 13px; text-align: center;">
                Cela ne prend que 30 secondes
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
                contact@servicesartisans.fr<br>
                <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Bonjour ${data.clientName},

Comment s'est pass\u00e9 votre rendez-vous avec ${data.artisanName} pour ${data.serviceName} ?

Votre avis aide d'autres personnes \u00e0 trouver les meilleurs artisans.

Laisser un avis : ${data.reviewUrl}

Cela ne prend que 30 secondes.

ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr
Politique de confidentialit\u00e9 : https://servicesartisans.fr/confidentialite`,
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify cron secret - REQUIRED in production
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('[Review Cron] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate time window: appointments that ended 2-3 hours ago
    const now = new Date()
    const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000) // 3h ago
    const windowEnd = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2h ago

    const todayStr = now.toISOString().split('T')[0]
    const windowStartTime = windowStart.toTimeString().slice(0, 5)
    const windowEndTime = windowEnd.toTimeString().slice(0, 5)

    logger.info(`[Review Cron] Looking for completed appointments between ${windowStartTime} and ${windowEndTime}`)

    // Fetch completed bookings in the time window
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
          end_time,
          artisan_id
        )
      `)
      .in('status', ['confirmed', 'completed'])
      .not('slot', 'is', null)

    if (error) {
      logger.error('[Review Cron] Error fetching bookings:', error)
      throw error
    }

    // Helper to get slot data (handles array from Supabase join)
    const getSlot = (slot: unknown) => {
      if (Array.isArray(slot)) return slot[0]
      return slot as { date: string; end_time: string; artisan_id: string } | undefined
    }

    // Filter bookings that ended in the time window
    const completedBookings = bookings?.filter((b) => {
      const slot = getSlot(b.slot)
      if (!slot?.date || !slot?.end_time) return false
      if (slot.date !== todayStr) return false

      const endTime = slot.end_time.slice(0, 5)
      return endTime >= windowStartTime && endTime <= windowEndTime
    }) || []

    logger.info(`[Review Cron] Found ${completedBookings.length} completed appointments`)

    if (completedBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No completed appointments in window',
        sentCount: 0,
      })
    }

    // Check which haven't received review request yet
    const { data: sentRequests } = await supabase
      .from('notification_logs')
      .select('booking_id')
      .in('booking_id', completedBookings.map((b) => b.id))
      .eq('type', 'review_request')
      .eq('status', 'sent')

    const sentBookingIds = new Set(sentRequests?.map((r) => r.booking_id) || [])

    const bookingsToRequest = completedBookings.filter(
      (b) => !sentBookingIds.has(b.id)
    )

    logger.info(`[Review Cron] ${bookingsToRequest.length} need review requests`)

    // Fetch artisan details
    const artisanIds = Array.from(new Set(bookingsToRequest.map((b) => getSlot(b.slot)?.artisan_id).filter(Boolean)))
    const { data: artisans } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, slug')
      .in('id', artisanIds)

    const artisanMap = new Map(artisans?.map((a) => [a.id, a]) || [])

    let sentCount = 0
    let failedCount = 0

    for (const booking of bookingsToRequest) {
      const slot = getSlot(booking.slot)
      const artisan = artisanMap.get(slot?.artisan_id || '')
      const artisanName = artisan?.company_name || artisan?.full_name || 'Artisan'
      const reviewUrl = `${SITE_URL}/avis/${booking.id.slice(0, 8)}`

      try {
        // Send email
        const emailTemplate = getReviewEmailTemplate({
          clientName: booking.client_name,
          artisanName,
          serviceName: booking.service_description || 'Service',
          reviewUrl,
        })

        const emailResult = await sendEmail({
          to: booking.client_email,
          ...emailTemplate,
        })

        // Send SMS if phone available
        let smsResult = { success: false }
        if (booking.client_phone) {
          const smsData: SMSData = {
            to: booking.client_phone,
            clientName: booking.client_name,
            artisanName,
            serviceName: booking.service_description || 'Service',
            date: '',
            time: '',
            bookingId: booking.id,
          }
          smsResult = await sendReviewRequestSMS(smsData)
        }

        // Log notification
        await supabase.from('notification_logs').insert({
          booking_id: booking.id,
          type: 'review_request',
          status: emailResult.success || smsResult.success ? 'sent' : 'failed',
          recipient_email: booking.client_email,
          error_message: emailResult.error,
        })

        if (emailResult.success || smsResult.success) {
          sentCount++
        } else {
          failedCount++
        }

        // Rate limiting
        await new Promise((r) => setTimeout(r, 100))
      } catch (err) {
        failedCount++
        logger.error(`[Review Cron] Error for booking ${booking.id}:`, err)
      }
    }

    // Mark bookings as completed if they were confirmed
    const confirmedIds = bookingsToRequest
      .filter((b) => b.status === 'confirmed')
      .map((b) => b.id)

    if (confirmedIds.length > 0) {
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .in('id', confirmedIds)
    }

    logger.info(`[Review Cron] Completed: ${sentCount} sent, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      message: 'Review requests processed',
      sentCount,
      failedCount,
      markedCompleted: confirmedIds.length,
    })
  } catch (error) {
    logger.error('[Review Cron] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send review requests' },
      { status: 500 }
    )
  }
}
