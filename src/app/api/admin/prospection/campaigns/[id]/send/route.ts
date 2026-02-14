import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { enqueueCampaignMessages, processBatch } from '@/lib/prospection/message-queue'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'send')
    if (!authResult.success) return authResult.error

    const { id } = await params

    const supabase = createAdminClient()
    const { data: campaign } = await supabase.from('prospection_campaigns').select('id, status').eq('id', id).single()
    if (!campaign) {
      return NextResponse.json({ success: false, error: { message: 'Campagne introuvable' } }, { status: 404 })
    }

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return NextResponse.json(
        { success: false, error: { message: `Impossible d'envoyer une campagne avec le statut "${campaign.status}"` } },
        { status: 400 }
      )
    }

    // Enfiler les messages
    const enqueueResult = await enqueueCampaignMessages(id)

    // Lancer le premier batch (le reste sera traité par cron ou polling)
    const batchResult = await processBatch(id, 100)

    return NextResponse.json({
      success: true,
      data: {
        enqueued: enqueueResult.enqueued,
        skipped: enqueueResult.skipped,
        first_batch: batchResult,
      },
    })
  } catch (error) {
    logger.error('Send campaign error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message || 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
