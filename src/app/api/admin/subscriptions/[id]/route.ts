import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSubscription, changeSubscriptionPlan, PRICE_IDS } from '@/lib/stripe-admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET - Détails d'un abonnement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with payments:read permission
    const authResult = await requirePermission('payments', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const subscription = await getSubscription(params.id)

    return NextResponse.json({
      success: true,
      subscription,
    })
  } catch (error) {
    logger.error('Admin subscription details error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// PATCH - Modifier un abonnement (changer de plan)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with payments:read permission (changing plans)
    const authResult = await requirePermission('payments', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { newPlan, proration = 'create_prorations' } = body

    // Déterminer le price ID
    let newPriceId: string | undefined
    if (newPlan === 'pro') {
      newPriceId = PRICE_IDS.pro
    } else if (newPlan === 'premium') {
      newPriceId = PRICE_IDS.premium
    }

    if (!newPriceId) {
      return NextResponse.json(
        { success: false, error: { message: 'Plan invalide' } },
        { status: 400 }
      )
    }

    const result = await changeSubscriptionPlan(
      params.id,
      newPriceId,
      proration as 'create_prorations' | 'none' | 'always_invoice'
    )

    // Mettre à jour le profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', params.id)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          subscription_plan: newPlan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
    }

    // Log d'audit
    await logAdminAction(
      authResult.admin.id,
      'subscription.change_plan',
      'subscription',
      params.id,
      { newPlan, newPriceId }
    )

    return NextResponse.json({
      success: true,
      result,
      message: `Plan changé vers ${newPlan}`,
    })
  } catch (error) {
    logger.error('Admin subscription change error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors du changement de plan' } },
      { status: 500 }
    )
  }
}
