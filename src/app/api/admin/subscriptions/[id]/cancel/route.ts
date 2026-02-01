import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelSubscription, reactivateSubscription } from '@/lib/stripe-admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

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

    const supabase = await createClient()
    const body = await request.json()
    const { action, immediately = false } = body // action: 'cancel' ou 'reactivate'

    let result
    if (action === 'cancel') {
      result = await cancelSubscription(params.id, immediately)

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
    } else if (action === 'reactivate') {
      result = await reactivateSubscription(params.id)
    } else {
      return NextResponse.json(
        { success: false, error: { message: "Action invalide. Utilisez 'cancel' ou 'reactivate'" } },
        { status: 400 }
      )
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
      result,
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
