import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// PATCH - Moderate review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with reviews:write permission
    const authResult = await requirePermission('reviews', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('reviews')
      .update({
        moderation_status: body.moderation_status,
        is_visible: body.is_visible,
        moderated_at: new Date().toISOString(),
        moderated_by: authResult.admin.id,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log the moderation action
    await logAdminAction(
      authResult.admin.id,
      `review.${body.moderation_status}`,
      'review',
      params.id,
      { moderation_status: body.moderation_status, is_visible: body.is_visible }
    )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Admin review moderation error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
