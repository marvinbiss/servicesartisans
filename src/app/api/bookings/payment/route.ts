/**
 * POST /api/bookings/payment — Create a Stripe Checkout session for a booking deposit
 */

import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
})

const MIN_DEPOSIT_CENTS = 100
const MAX_DEPOSIT_CENTS = 1_000_000

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { bookingId } = parsed.data

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, provider_id, client_id, status, scheduled_date, deposit_amount, payment_status')
      .eq('id', bookingId)
      .eq('client_id', user.id)
      .maybeSingle()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Cette réservation ne peut pas être payée dans son état actuel' },
        { status: 400 }
      )
    }

    if (booking.payment_status === 'paid') {
      return NextResponse.json({ error: 'Cette réservation est déjà payée' }, { status: 409 })
    }

    const depositAmountInCents = booking.deposit_amount
    if (
      typeof depositAmountInCents !== 'number' ||
      !Number.isInteger(depositAmountInCents) ||
      depositAmountInCents < MIN_DEPOSIT_CENTS ||
      depositAmountInCents > MAX_DEPOSIT_CENTS
    ) {
      logger.error('Booking payment rejected: invalid deposit_amount', {
        bookingId,
        deposit_amount: depositAmountInCents,
      })
      return NextResponse.json(
        { error: 'Montant d’acompte invalide pour cette réservation' },
        { status: 422 }
      )
    }

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Acompte réservation #${bookingId.slice(0, 8)}`,
              },
              unit_amount: depositAmountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          bookingId,
          userId: user.id,
        },
        success_url: `${SITE_URL}/?payment=success`,
        cancel_url: `${SITE_URL}/?payment=cancelled`,
      },
      { idempotencyKey: `booking-payment:${bookingId}` }
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    logger.error('Booking payment error', { error })
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
