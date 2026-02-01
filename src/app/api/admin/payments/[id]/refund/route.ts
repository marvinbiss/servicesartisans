import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processRefund } from '@/lib/stripe-admin'

export const dynamic = 'force-dynamic'

// POST - Traiter un remboursement
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

    const paymentIntentId = params.id
    const body = await request.json()
    const { amount, reason } = body

    // Traiter le remboursement via Stripe
    const refund = await processRefund(
      paymentIntentId,
      amount, // undefined = remboursement total
      reason as 'duplicate' | 'fraudulent' | 'requested_by_customer'
    )

    // Enregistrer dans les logs d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'payment.refund',
      entity_type: 'payment',
      entity_id: paymentIntentId,
      new_data: {
        refund_id: refund.id,
        amount: refund.amount,
        reason,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      refund,
      message: 'Remboursement traité avec succès',
    })
  } catch (error) {
    console.error('Admin refund error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors du remboursement' } },
      { status: 500 }
    )
  }
}
