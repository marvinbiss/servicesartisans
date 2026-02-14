import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { pauseCampaign } from '@/lib/prospection/message-queue'

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

    if (campaign.status !== 'sending') {
      return NextResponse.json(
        { success: false, error: { message: 'Seules les campagnes en cours d\'envoi peuvent être mises en pause' } },
        { status: 400 }
      )
    }

    await pauseCampaign(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Pause campaign error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
