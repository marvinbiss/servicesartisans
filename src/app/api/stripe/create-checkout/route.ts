import { NextResponse } from 'next/server'
import { stripe, PLANS, PlanId } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { z } from 'zod'

// POST request schema
const checkoutSchema = z.object({
  planId: z.enum(['starter', 'pro', 'premium'] as const),
})

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const result = checkoutSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { planId } = result.data

    if (!(planId in PLANS)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanId]

    if (!plan.priceId) {
      return NextResponse.json({ error: 'Ce plan ne nécessite pas de paiement' }, { status: 400 })
    }

    // F-9 security/billing fix : réutiliser le Stripe Customer existant si
    // déjà persisté côté profile, sinon le créer. Sinon, chaque POST sur
    // /api/stripe/create-checkout générait un nouveau customer (le webhook
    // écrasait ensuite stripe_customer_id), produisant un mess billing
    // côté Stripe et empêchant la consolidation des abonnements.
    let customerId: string
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
      if (updateError) {
        logger.warn('Failed to persist stripe_customer_id', { userId: user.id })
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/espace-artisan/abonnement?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/espace-artisan/abonnement?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    logger.error('Stripe checkout error:', error)
    captureError(error, { tags: { route: 'api/stripe/create-checkout', critical: 'true' } })
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
