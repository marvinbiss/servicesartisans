/**
 * POST /api/payments/intent — Create a Stripe PaymentIntent for flexible payment
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const intentSchema = z.object({
  bookingId: z.string().uuid(),
  artisanId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().optional(),
  paymentType: z.enum(['full', 'deposit', 'split']).default('full'),
  depositPercentage: z.number().min(10).max(50).optional(),
  splitInstallments: z.number().min(2).max(4).optional(),
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
    const parsed = intentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { bookingId, artisanId, amount, description, paymentType, depositPercentage } =
      parsed.data

    // Verify booking belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, client_id, status')
      .eq('id', bookingId)
      .eq('client_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Calculate actual amount based on payment type
    let chargeAmount = Math.round(amount * 100) // Convert to cents
    if (paymentType === 'deposit' && depositPercentage) {
      chargeAmount = Math.round(chargeAmount * (depositPercentage / 100))
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: chargeAmount,
      currency: 'eur',
      metadata: {
        bookingId,
        artisanId,
        userId: user.id,
        paymentType,
      },
      description: description || `Paiement réservation #${bookingId.slice(0, 8)}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: chargeAmount,
      totalAmount: Math.round(amount * 100),
    })
  } catch (error) {
    logger.error('Payment intent error', { error })
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
