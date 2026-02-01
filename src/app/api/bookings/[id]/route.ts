import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Use service role for booking access (allows partial ID lookup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/bookings/[id] - Get booking details
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    // Build query - support both full UUID and partial ID (first 8 chars)
    let query = supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_phone,
        client_email,
        service_description,
        status,
        created_at,
        cancelled_at,
        cancelled_by,
        cancellation_reason,
        rescheduled_at,
        payment_status,
        deposit_amount,
        slot:availability_slots(
          id,
          date,
          start_time,
          end_time,
          artisan_id
        )
      `)

    // Check if it's a partial ID (8 chars) or full UUID (36 chars)
    if (bookingId.length < 36) {
      query = query.ilike('id', `${bookingId}%`)
    } else {
      query = query.eq('id', bookingId)
    }

    const { data: bookings, error } = await query.limit(1)

    if (error) {
      logger.error('Booking fetch error:', error)
      throw error
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      )
    }

    const booking = bookings[0]
    const slotData = booking.slot as Array<{ id: string; date: string; start_time: string; end_time: string; artisan_id: string }> | null
    const slot = slotData?.[0] || null

    // Fetch artisan details
    const { data: artisan } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, phone, email, address, city, avatar_url')
      .eq('id', slot?.artisan_id)
      .single()

    // Format response for confirmation page
    return NextResponse.json({
      booking: {
        id: booking.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        serviceName: booking.service_description || 'Service',
        status: booking.status,
        createdAt: booking.created_at,
        cancelledAt: booking.cancelled_at,
        cancelledBy: booking.cancelled_by,
        cancellationReason: booking.cancellation_reason,
        rescheduledAt: booking.rescheduled_at,
        paymentStatus: booking.payment_status,
        depositAmount: booking.deposit_amount,
        date: slot?.date,
        startTime: slot?.start_time,
        endTime: slot?.end_time,
        slotId: slot?.id,
        artisanId: artisan?.id || slot?.artisan_id,
        artisanName: artisan?.company_name || artisan?.full_name || 'Artisan',
        artisanPhone: artisan?.phone,
        artisanEmail: artisan?.email,
        artisanAddress: artisan?.address
          ? `${artisan.address}${artisan.city ? ', ' + artisan.city : ''}`
          : null,
        artisanAvatar: artisan?.avatar_url,
        // Legacy format for backward compatibility
        client_name: booking.client_name,
        client_phone: booking.client_phone,
        client_email: booking.client_email,
        service_description: booking.service_description,
        slot: booking.slot,
        artisan: artisan || { id: slot?.artisan_id, full_name: 'Artisan' },
      },
    })
  } catch (error) {
    logger.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la réservation' },
      { status: 500 }
    )
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses = ['confirmed', 'completed', 'cancelled', 'no_show']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    const updateData: Record<string, string | undefined> = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      logger.error('Booking update error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      booking: data,
    })
  } catch (error) {
    logger.error('Booking PATCH error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
