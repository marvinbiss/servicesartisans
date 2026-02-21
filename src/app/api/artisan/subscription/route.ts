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

    // La table 'subscriptions' n'existe pas dans le schéma public.
    // Les colonnes subscription_plan, subscription_status, stripe_customer_id
    // n'existent pas dans 'profiles'. Fonctionnalité non disponible.
    return NextResponse.json(
      { subscription: null, message: 'Fonctionnalité non disponible' },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Subscription GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
