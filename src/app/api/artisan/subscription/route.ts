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

    // Fetch profile with subscription info (columns from migration 309)
    // Note: subscription_period_end does not exist in the schema
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, stripe_customer_id')
      .eq('id', user!.id)
      .single()

    if (profileError) {
      logger.error('Error fetching subscription:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'abonnement' },
        { status: 500 }
      )
    }

    // Fetch the provider record to use provider.id for FK lookups
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user!.id)
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: 'Profil artisan non trouvé' },
        { status: 404 }
      )
    }

    // Fetch invoices using provider.id (invoices.provider_id → providers.id)
    // invoices table: id, created_at, status, total (from migration 006)
    // No download URL column exists in the schema — url returned as null
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, created_at, status, total')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Count devis sent by this artisan via the quotes table (one row per devis sent)
    const { count: devisCount, error: devisError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', provider.id)

    if (devisError) {
      logger.error('Error fetching devis count:', devisError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const devisUsed = devisCount ?? 0

    // Determine limits based on plan
    const planLimits: Record<string, number> = {
      gratuit: 5,
      pro: 30,
      premium: 9999, // Unlimited
    }

    const currentPlan = profile?.subscription_plan || 'gratuit'
    const limit = planLimits[currentPlan] || 5

    return NextResponse.json({
      plan: currentPlan,
      status: profile?.subscription_status || null,
      periodEnd: null,
      devisUsed,
      devisLimit: limit,
      hasStripeCustomer: !!profile?.stripe_customer_id,
      invoices: invoices?.map(inv => ({
        id: inv.id,
        date: inv.created_at,
        montant: inv.total,
        status: inv.status,
        url: null,
      })) || [],
    })
  } catch (error) {
    logger.error('Subscription GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
