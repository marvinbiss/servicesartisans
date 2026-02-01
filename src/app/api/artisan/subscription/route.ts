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
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Fetch profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_period_end, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      logger.error('Error fetching subscription:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'abonnement' },
        { status: 500 }
      )
    }

    // Fetch invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get devis count this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: devisCount } = await supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('artisan_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

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
      periodEnd: profile?.subscription_period_end || null,
      devisUsed: devisCount || 0,
      devisLimit: limit,
      hasStripeCustomer: !!profile?.stripe_customer_id,
      invoices: invoices?.map(inv => ({
        id: inv.id,
        date: inv.created_at,
        montant: inv.amount / 100, // Convert from cents
        status: inv.status,
        url: inv.invoice_url,
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
