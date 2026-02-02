import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// PATCH request schema
const moderateReviewSchema = z.object({
  moderation_status: z.enum(['pending', 'approved', 'rejected']),
  is_visible: z.boolean().optional(),
})

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

    const supabase = createAdminClient()
    const body = await request.json()
    const result = moderateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation error', details: result.error.flatten() } },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({
        moderation_status: result.data.moderation_status,
        is_visible: result.data.is_visible,
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
      `review.${result.data.moderation_status}`,
      'review',
      params.id,
      { moderation_status: result.data.moderation_status, is_visible: result.data.is_visible }
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
