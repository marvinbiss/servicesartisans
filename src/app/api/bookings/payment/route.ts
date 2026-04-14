/**
 * POST /api/bookings/payment — Create a Stripe Checkout session for a booking deposit
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  depositAmountInCents: z.number().int().positive(),
})

export const dynamic = 'force-dynamic'

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

    const { bookingId, depositAmountInCents } = parsed.data

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, provider_id, client_id, status, scheduled_date')
      .eq('id', bookingId)
      .eq('client_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Cette réservation ne peut pas être payée dans son état actuel' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/espace-client/reservations?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/espace-client/reservations?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    logger.error('Booking payment error', { error })
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
