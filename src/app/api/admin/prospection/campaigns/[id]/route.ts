import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  template_id: z.string().uuid().optional(),
  list_id: z.string().uuid().optional(),
  batch_size: z.number().int().min(1).max(10000).optional(),
  batch_delay_ms: z.number().int().min(0).max(60000).optional(),
  daily_send_limit: z.number().int().min(1).max(100000).optional(),
  ai_auto_reply: z.boolean().optional(),
  ai_provider: z.enum(['claude', 'openai']).optional(),
  ai_model: z.string().max(100).optional(),
  ai_system_prompt: z.string().max(5000).optional(),
  ai_max_tokens: z.number().int().min(1).max(8000).optional(),
  ai_temperature: z.number().min(0).max(2).optional(),
  scheduled_at: z.string().datetime().optional(),
}).strict()

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'read')
    if (!authResult.success) return authResult.error

    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prospection_campaigns')
      .select('id, name, description, channel, audience_type, status, template_id, list_id, scheduled_at, started_at, completed_at, batch_size, ai_auto_reply, ai_provider, total_recipients, sent_count, delivered_count, replied_count, failed_count, estimated_cost, actual_cost, created_at, template:prospection_templates(id, name, channel), list:prospection_lists(id, name, contact_count)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: { message: 'Campagne non trouvée' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Get campaign error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success) return authResult.error

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prospection_campaigns')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: { message: 'Resource not found' } }, { status: 404 })
      }
      logger.error('Update campaign error', error)
      return NextResponse.json({ success: false, error: { message: 'Erreur lors de la mise à jour' } }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ success: false, error: { message: 'Resource not found' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Patch campaign error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success) return authResult.error

    const { id } = await params
    const supabase = createAdminClient()

    // Ne supprimer que les campagnes en draft
    const { data: campaign } = await supabase
      .from('prospection_campaigns')
      .select('status')
      .eq('id', id)
      .single()

    if (campaign?.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: { message: 'Seules les campagnes en brouillon peuvent être supprimées' } },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('prospection_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Delete campaign error', error)
      return NextResponse.json({ success: false, error: { message: 'Erreur lors de la suppression' } }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete campaign error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
