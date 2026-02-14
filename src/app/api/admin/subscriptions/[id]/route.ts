import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSubscription, changeSubscriptionPlan, PRICE_IDS } from '@/lib/stripe-admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'

// PATCH request schema
const changeSubscriptionSchema = z.object({
  newPlan: z.enum(['pro', 'premium']),
  proration: z.enum(['create_prorations', 'none', 'always_invoice']).optional().default('create_prorations'),
})

export const dynamic = 'force-dynamic'

// GET - Détails d'un abonnement
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with payments:read permission
    const authResult = await requirePermission('payments', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
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

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const validation = changeSubscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de validation', details: validation.error.flatten() } },
        { status: 400 }
      )
    }
    const { newPlan, proration } = validation.data

    // Déterminer le price ID
    const newPriceId = newPlan === 'pro' ? PRICE_IDS.pro : PRICE_IDS.premium

    if (!newPriceId) {
      return NextResponse.json(
        { success: false, error: { message: 'Configuration Stripe manquante pour ce plan' } },
        { status: 500 }
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
