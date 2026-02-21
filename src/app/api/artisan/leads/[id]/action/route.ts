/**
 * POST /api/artisan/leads/:id/action — Lead actions for authenticated artisan
 * Actions: view, quote, decline
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logLeadEvent } from '@/lib/dashboard/events'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body as { action: string }

    if (!action || !['view', 'quote', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide. Valeurs: view, quote, decline' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get provider linked to this user
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Aucun profil artisan' }, { status: 403 })
    }

    // Verify assignment exists and belongs to this provider
    const adminClient = createAdminClient()
    const { data: assignment, error: assignError } = await adminClient
      .from('lead_assignments')
      .select('id, lead_id, status')
      .eq('id', id)
      .eq('provider_id', provider.id)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
    }

    const now = new Date().toISOString()

    if (action === 'view') {
      await adminClient
        .from('lead_assignments')
        .update({ status: 'viewed', viewed_at: now })
        .eq('id', id)

      await logLeadEvent(assignment.lead_id, 'viewed', {
        providerId: provider.id,
        actorId: user.id,
      })
    } else if (action === 'quote') {
      const { amount, description: quoteDesc, validDays } = body as {
        amount?: number
        description?: string
        validDays?: number
      }

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Montant requis' }, { status: 400 })
      }

      // Create quote
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + (validDays || 30))

      await adminClient.from('quotes').insert({
        request_id: assignment.lead_id,
        provider_id: provider.id,
        amount,
        description: quoteDesc || '',
        valid_until: validUntil.toISOString().split('T')[0],
        status: 'pending',
      })

      await adminClient
        .from('lead_assignments')
        .update({ status: 'quoted' })
        .eq('id', id)

      await logLeadEvent(assignment.lead_id, 'quoted', {
        providerId: provider.id,
        actorId: user.id,
        metadata: { amount, validDays: validDays || 30 },
      })
    } else if (action === 'decline') {
      const { reason } = body as { reason?: string }

      await adminClient
        .from('lead_assignments')
        .update({ status: 'declined' })
        .eq('id', id)

      await logLeadEvent(assignment.lead_id, 'declined', {
        providerId: provider.id,
        actorId: user.id,
        metadata: { reason: reason || '' },
      })
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    logger.error('Lead action POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
