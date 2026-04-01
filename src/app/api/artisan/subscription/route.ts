/**
 * Artisan Subscription API
 * GET: Fetch current subscription info
 * POST: Update subscription (redirect to Stripe)
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, stripe_customer_id')
      .eq('id', user!.id)
      .single()

    if (profileError) {
      logger.error('Subscription profile fetch error:', profileError)
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'abonnement" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscription: {
        plan: profile.subscription_plan,
        status: profile.subscription_status,
        stripe_customer_id: profile.stripe_customer_id,
      },
    })
  } catch (error) {
    logger.error('Subscription GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
