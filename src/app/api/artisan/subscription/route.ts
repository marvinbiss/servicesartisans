/**
 * Artisan Subscription API
 * GET: Fetch current subscription info
 * POST: Update subscription (redirect to Stripe)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Fetch profile with subscription info (columns from migration 309)
    // Note: subscription_period_end does not exist in the schema
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, stripe_customer_id')
      .eq('id', user.id)
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
      .eq('user_id', user.id)
      .single()

    // Fetch invoices using provider.id (invoices.provider_id → providers.id)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, created_at, status')
      .eq('provider_id', provider?.id || '')
      .order('created_at', { ascending: false })
      .limit(10)

    // Count quotes sent by this artisan via lead_assignments (not devis_requests by client_id)
    const { count: devisCount } = await supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', provider?.id || '')
      .eq('status', 'quoted')

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
      devisUsed: devisCount || 0,
      devisLimit: limit,
      hasStripeCustomer: !!profile?.stripe_customer_id,
      invoices: invoices?.map(inv => ({
        id: inv.id,
        date: inv.created_at,
        status: inv.status,
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
