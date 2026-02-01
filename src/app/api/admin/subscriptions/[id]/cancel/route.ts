import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelSubscription, reactivateSubscription } from '@/lib/stripe-admin'

export const dynamic = 'force-dynamic'

// POST - Annuler ou réactiver un abonnement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

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
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: `subscription.${action}`,
      entity_type: 'subscription',
      entity_id: params.id,
      new_data: { action, immediately },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      result,
      message: action === 'cancel' ? 'Abonnement annulé' : 'Abonnement réactivé',
    })
  } catch (error) {
    console.error('Admin subscription cancel error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
