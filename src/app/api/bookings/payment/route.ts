import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createDepositCheckoutSession,
  calculateDepositAmount,
  DEFAULT_DEPOSIT_CONFIG,
} from '@/lib/stripe/deposits'
import { logger } from '@/lib/logger'

// POST /api/bookings/payment - Create payment session for booking deposit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      bookingId,
      servicePriceInCents,
      depositAmountInCents,
    } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_email,
        client_phone,
        service_description,
        status,
        payment_status,
        payment_intent_id,
        slot:availability_slots(
          id,
          date,
          start_time,
          end_time,
          artisan_id
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      )
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Impossible de payer une réservation annulée' },
        { status: 400 }
      )
    }

    if (booking.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Cette réservation a déjà été payée' },
        { status: 400 }
      )
    }

    // Handle slot data (Supabase returns array for joins)
    const slotData = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
    if (!slotData) {
      return NextResponse.json(
        { error: 'Créneau introuvable' },
        { status: 404 }
      )
    }

    // Fetch artisan details
    const { data: artisan } = await supabase
      .from('profiles')
      .select('id, full_name, company_name')
      .eq('id', slotData.artisan_id)
      .single()

    // Calculate deposit amount
    let finalDepositAmount = depositAmountInCents
    if (!finalDepositAmount && servicePriceInCents) {
      finalDepositAmount = calculateDepositAmount(servicePriceInCents)
    }
    if (!finalDepositAmount) {
      finalDepositAmount = DEFAULT_DEPOSIT_CONFIG.minDepositAmount // Default 10 EUR
    }

    // Format date for display
    const bookingDate = new Date(slotData.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const bookingTime = `${slotData.start_time} - ${slotData.end_time}`

    // Create Stripe checkout session
    const { sessionId, url } = await createDepositCheckoutSession({
      bookingId: booking.id,
      artisanId: slotData.artisan_id,
      artisanName: artisan?.company_name || artisan?.full_name || 'Artisan',
      clientEmail: booking.client_email,
      clientName: booking.client_name,
      serviceName: booking.service_description || 'Service',
      depositAmountInCents: finalDepositAmount,
      bookingDate,
      bookingTime,
    })

    // Update booking with pending payment status
    await supabase
      .from('bookings')
      .update({
        payment_status: 'pending',
        payment_session_id: sessionId,
        deposit_amount: finalDepositAmount,
      })
      .eq('id', bookingId)

    return NextResponse.json({
      success: true,
      sessionId,
      url,
      depositAmount: finalDepositAmount / 100, // Return in euros
    })
  } catch (error) {
    logger.error('Error creating payment session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}

// GET /api/bookings/payment?bookingId=X - Get payment status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, payment_status, payment_intent_id, deposit_amount')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      bookingId: booking.id,
      paymentStatus: booking.payment_status || 'not_required',
      depositAmount: booking.deposit_amount ? booking.deposit_amount / 100 : null,
    })
  } catch (error) {
    logger.error('Error fetching payment status:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    )
  }
}
