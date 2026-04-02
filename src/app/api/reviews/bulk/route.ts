import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const bulkModerateSchema = z.object({
  review_ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(['approve', 'reject']),
})

// PATCH /api/reviews/bulk - Bulk moderate reviews (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission('reviews', 'write')
    if (!auth.success) return auth.error

    const body = await request.json()
    const parsed = bulkModerateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const { review_ids, action } = parsed.data

    const updates = {
      status: action === 'approve' ? 'published' : 'rejected',
      updated_at: new Date().toISOString(),
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .in('id', review_ids)
      .select('id')

    if (error) throw error

    return NextResponse.json({
      success: true,
      moderated: data?.length || 0,
    })
  } catch (error) {
    logger.error('Bulk moderate reviews error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
