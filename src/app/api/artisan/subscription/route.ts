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
    const { error: guardError } = await requireArtisan()
    if (guardError) return guardError

    // Les colonnes subscription_plan, subscription_status, stripe_customer_id
    // n'existent pas dans la table profiles (aucune migration ne les crée).
    // On retourne un état par défaut "pas d'abonnement" pour éviter un crash.
    return NextResponse.json({
      subscription: {
        plan: 'gratuit',
        status: null,
        stripe_customer_id: null,
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
