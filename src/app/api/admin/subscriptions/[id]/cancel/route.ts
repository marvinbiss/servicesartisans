import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cancelSubscription, reactivateSubscription } from '@/lib/stripe-admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'

// POST request schema
const cancelSubscriptionSchema = z.object({
  action: z.enum(['cancel', 'reactivate']),
  immediately: z.boolean().optional().default(false),
})

export const dynamic = 'force-dynamic'

// POST - Annuler ou réactiver un abonnement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with payments:cancel permission
    const authResult = await requirePermission('payments', 'cancel')
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
    const result = cancelSubscriptionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de validation', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { action, immediately } = result.data

    let stripeResult
    if (action === 'cancel') {
      stripeResult = await cancelSubscription(params.id, immediately)

      // Mettre à jour le profil si annulation immédiate
      if (immediately) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', params.id)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_plan: 'gratuit',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
        }
      }
    } else {
      stripeResult = await reactivateSubscription(params.id)
    }

    // Log d'audit
    await logAdminAction(
      authResult.admin.id,
      `subscription.${action}`,
      'subscription',
      params.id,
      { action, immediately }
    )

    return NextResponse.json({
      success: true,
      result: stripeResult,
      message: action === 'cancel' ? 'Abonnement annulé' : 'Abonnement réactivé',
    })
  } catch (error) {
    logger.error('Admin subscription cancel error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
