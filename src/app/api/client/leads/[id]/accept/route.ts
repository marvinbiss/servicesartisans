/**
 * Client Accept Quote API
 * POST /api/client/leads/[id]/accept
 * Body: { quote_id: string }
 *
 * - Verifies the quote belongs to this devis_request
 * - Marks quote as 'accepted', all others as 'refused'
 * - Marks the devis_request as 'accepted'
 * - Logs an 'accepted' lead_event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  getDevisRequestById,
  getQuoteById,
  updateQuoteStatus,
  refuseOtherQuotes,
  updateDevisRequestStatus,
  logLeadEvent,
} from '@/lib/services/leads-service'

export const dynamic = 'force-dynamic'

const acceptSchema = z.object({
  quote_id: z.string().uuid(),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }

    // Parse body
    const body = await request.json()
    const result = acceptSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètre quote_id invalide', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { quote_id } = result.data

    // Verify ownership of the devis_request via user client (RLS enforces client_id = auth.uid())
    const lead = await getDevisRequestById(supabase, leadId, user.id)

    if (!lead) {
      return NextResponse.json(
        { success: false, error: { message: 'Demande non trouvée' } },
        { status: 404 }
      )
    }

    if (lead.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: { message: 'Un devis a déjà été accepté pour cette demande' } },
        { status: 409 }
      )
    }

    // Use admin client for write operations on quotes (providers-only RLS)
    const adminClient = createAdminClient()

    // Verify the quote belongs to this lead and is still pending
    const quote = await getQuoteById(adminClient, quote_id, leadId)

    if (!quote) {
      return NextResponse.json(
        { success: false, error: { message: 'Devis non trouvé pour cette demande' } },
        { status: 404 }
      )
    }

    if (quote.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Ce devis ne peut plus être accepté (statut : ${quote.status})` },
        },
        { status: 409 }
      )
    }

    // 1. Accept the chosen quote
    await updateQuoteStatus(adminClient, quote_id, 'accepted')

    // 2. Refuse all other pending quotes for this lead
    await refuseOtherQuotes(adminClient, leadId, quote_id)

    // 3. Mark the devis_request as accepted
    await updateDevisRequestStatus(adminClient, leadId, 'accepted')

    // 4. Log the accepted event
    await logLeadEvent(leadId, 'accepted', {
      actorId: user.id,
      providerId: quote.provider_id,
      metadata: { quote_id },
    })

    return NextResponse.json({
      success: true,
      message: 'Devis accepté avec succès',
    })
  } catch (error) {
    logger.error('Accept quote POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
